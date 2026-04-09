import { internal } from './_generated/api'
import { mutation } from './_generated/server'
import { v } from 'convex/values'
import {
  buildAnonymizedSlots,
  getParticipantByToken,
  getRoundByNumber,
  getSessionBySlug,
  now,
  appendSessionEvent,
  requireSessionOwner,
} from './lib'
import { MAX_TOPIC_LENGTH, MIN_TOPIC_LENGTH } from '../shared/arena'

export const submitTopic = mutation({
  args: {
    slug: v.string(),
    participantToken: v.string(),
    topic: v.string(),
  },
  handler: async (ctx, args) => {
    const session = await getSessionBySlug(ctx, args.slug)
    if (!session) {
      throw new Error('Session not found.')
    }
    if (session.status !== 'active') {
      throw new Error('The session is not currently live.')
    }

    const participant = await getParticipantByToken(
      ctx,
      session._id,
      args.participantToken,
    )
    if (!participant) {
      throw new Error('Join the session before submitting a topic.')
    }

    const round = await getRoundByNumber(
      ctx,
      session._id,
      session.currentRoundNumber,
    )
    if (!round) {
      throw new Error('Current round not found.')
    }
    if (round.status !== 'collecting_topic') {
      throw new Error('This round already has a locked topic.')
    }

    const topic = args.topic.trim()
    if (topic.length < MIN_TOPIC_LENGTH || topic.length > MAX_TOPIC_LENGTH) {
      throw new Error('Topic length is invalid.')
    }

    const slots = buildAnonymizedSlots(session.selectedModelsSnapshot.length)
    await ctx.db.patch(round._id, {
      status: 'generating',
      topic,
      topicSubmittedByParticipantId: participant._id,
      topicLockedAt: now(),
      generatingStartedAt: now(),
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
        promptVersion: 'v1',
        responseText: null,
        status: 'pending',
        latencyMs: null,
        tokenUsageInput: null,
        tokenUsageOutput: null,
        costMicrosUsd: null,
        errorCode: null,
        errorMessage: null,
        createdAt: now(),
        completedAt: null,
      })
    }

    await appendSessionEvent(ctx, {
      sessionId: session._id,
      roundId: round._id,
      type: 'topic_locked',
      title: `Round ${round.roundNumber} topic locked`,
      description: topic,
      meta: {
        participant: participant.displayName,
      },
    })

    await ctx.scheduler.runAfter(0, internal.orchestration.generateRound, {
      sessionId: session._id,
      roundId: round._id,
    })

    return {
      ok: true,
      roundId: round._id,
      topic,
    }
  },
})

export const endVotingEarly = mutation({
  args: {
    sessionId: v.id('sessions'),
  },
  handler: async (ctx, args): Promise<unknown> => {
    const { session } = await requireSessionOwner(ctx, args.sessionId)
    const round = await getRoundByNumber(
      ctx,
      session._id,
      session.currentRoundNumber,
    )
    if (!round || round.status !== 'voting') {
      throw new Error('There is no active voting round to close.')
    }
    return await ctx.runMutation(internal.state.finalizeRound, {
      sessionId: session._id,
      roundId: round._id,
      triggeredBy: 'manual',
    })
  },
})
