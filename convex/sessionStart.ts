import { internal } from './_generated/api'
import type { Doc } from './_generated/dataModel'
import { internalMutation } from './_generated/server'
import type { MutationCtx } from './_generated/server'
import { v } from 'convex/values'
import {
  appendSessionEvent,
  buildAnonymizedSlots,
  getRoundByNumber,
  now,
} from './lib'

function getRoundTopic(session: Doc<'sessions'>) {
  const prompt = session.customPrompt?.trim()
  return prompt ? prompt : session.title
}

async function prepareRoundResponses(
  ctx: MutationCtx,
  session: Doc<'sessions'>,
  round: Doc<'rounds'>,
) {
  const startedAt = now()
  const slots = buildAnonymizedSlots(session.selectedModelsSnapshot.length)
  await ctx.db.patch(round._id, {
    status: 'generating',
    topic: getRoundTopic(session),
    topicSubmittedByParticipantId: null,
    topicLockedAt: startedAt,
    generatingStartedAt: startedAt,
  })

  for (const [index, model] of session.selectedModelsSnapshot.entries()) {
    await ctx.db.insert('roundResponses', {
      sessionId: session._id,
      roundId: round._id,
      providerKey: model.providerKey,
      modelKey: model.key,
      modelId: model.modelId,
      modelLabel: model.label,
      anonymizedSlot: slots[index],
      promptVersion: 'v2',
      responseText: null,
      status: 'pending',
      latencyMs: null,
      tokenUsageInput: null,
      tokenUsageOutput: null,
      costMicrosUsd: null,
      errorCode: null,
      errorMessage: null,
      createdAt: startedAt,
      completedAt: null,
    })
  }
}

export const startScheduled = internalMutation({
  args: {
    sessionId: v.id('sessions'),
    scheduledStartAt: v.number(),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId)
    if (
      !session ||
      session.status !== 'waiting' ||
      session.scheduledStartAt !== args.scheduledStartAt
    ) {
      return null
    }
    const firstRound = await getRoundByNumber(ctx, session._id, 1)
    if (!firstRound || firstRound.status !== 'pending') {
      return null
    }

    await ctx.db.patch(session._id, {
      status: 'active',
      currentRoundNumber: 1,
      startedAt: now(),
      scheduledStartAt: null,
    })
    await prepareRoundResponses(ctx, session, firstRound)

    await appendSessionEvent(ctx, {
      sessionId: session._id,
      roundId: firstRound._id,
      type: 'session_started',
      title: 'Session started',
      description: 'Round 1 started automatically at the scheduled time.',
      meta: {},
    })

    await ctx.scheduler.runAfter(0, internal.orchestration.generateRound, {
      sessionId: session._id,
      roundId: firstRound._id,
    })

    return {
      ok: true,
      roundId: firstRound._id,
    }
  },
})
