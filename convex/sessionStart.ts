import type { Doc } from './_generated/dataModel'
import { internalMutation } from './_generated/server'
import type { MutationCtx } from './_generated/server'
import { v } from 'convex/values'
import { appendSessionEvent, getRoundByNumber, now } from './lib'

function getRoundTopic(session: Doc<'sessions'>) {
  const prompt = session.customPrompt?.trim()
  return prompt ? prompt : session.title
}

async function openRoundForParticipantResponses(
  ctx: MutationCtx,
  session: Doc<'sessions'>,
  round: Doc<'rounds'>,
) {
  const openedAt = now()
  await ctx.db.patch(round._id, {
    status: 'collecting_responses',
    topic: getRoundTopic(session),
    topicSubmittedByParticipantId: null,
    topicLockedAt: openedAt,
    generatingStartedAt: null,
  })
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
    await openRoundForParticipantResponses(ctx, session, firstRound)

    await appendSessionEvent(ctx, {
      sessionId: session._id,
      roundId: firstRound._id,
      type: 'session_started',
      title: 'Session started',
      description:
        'Round 1 started automatically and is open for optional participant jokes.',
      meta: {},
    })

    return {
      ok: true,
      roundId: firstRound._id,
    }
  },
})
