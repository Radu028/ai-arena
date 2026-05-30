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

export const startNextRound = mutation({
  args: {
    sessionId: v.id('sessions'),
  },
  handler: async (ctx, args) => {
    const { session } = await requireSessionOwner(ctx, args.sessionId)
    if (session.status !== 'active') {
      throw new Error('Only active sessions can start another round.')
    }

    const currentRound = await getRoundByNumber(
      ctx,
      session._id,
      session.currentRoundNumber,
    )
    if (
      !currentRound ||
      (currentRound.status !== 'scored' && currentRound.status !== 'aborted')
    ) {
      throw new Error('Close the current round before starting the next one.')
    }
    if (currentRound.roundNumber >= session.roundCount) {
      throw new Error('This session has no remaining rounds.')
    }
    if (currentRound.status === 'scored' && currentRound.revealAt === null) {
      throw new Error('Reveal the current round before starting the next one.')
    }

    const nextRound = await getRoundByNumber(
      ctx,
      session._id,
      currentRound.roundNumber + 1,
    )
    if (!nextRound || nextRound.status !== 'pending') {
      throw new Error('The next round is not ready to start.')
    }

    const startedAt = now()
    const topic = session.customPrompt?.trim() || session.title
    const slots = buildAnonymizedSlots(session.selectedModelsSnapshot.length)
    await ctx.db.patch(nextRound._id, {
      status: 'generating',
      topic,
      topicSubmittedByParticipantId: null,
      topicLockedAt: startedAt,
      generatingStartedAt: startedAt,
    })

    for (const [index, model] of session.selectedModelsSnapshot.entries()) {
      await ctx.db.insert('roundResponses', {
        sessionId: session._id,
        roundId: nextRound._id,
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
    await ctx.db.patch(session._id, {
      currentRoundNumber: nextRound.roundNumber,
    })
    await appendSessionEvent(ctx, {
      sessionId: session._id,
      roundId: nextRound._id,
      type: 'round_started',
      title: `Round ${nextRound.roundNumber} started`,
      description: 'The admin started the next round.',
      meta: {},
    })
    await ctx.scheduler.runAfter(0, internal.orchestration.generateRound, {
      sessionId: session._id,
      roundId: nextRound._id,
    })

    return {
      ok: true,
      roundId: nextRound._id,
    }
  },
})

export const revealLatestScoredRound = mutation({
  args: {
    sessionId: v.id('sessions'),
  },
  handler: async (ctx, args) => {
    const { session } = await requireSessionOwner(ctx, args.sessionId)
    const rounds = await ctx.db
      .query('rounds')
      .withIndex('by_session_id_and_round_number', (query) =>
        query.eq('sessionId', session._id),
      )
      .take(session.roundCount + 1)
    const round = rounds
      .filter((candidate) => candidate.status === 'scored')
      .sort((left, right) => right.roundNumber - left.roundNumber)
      .find((candidate) => candidate.revealAt === null)

    if (!round) {
      throw new Error('There is no scored round waiting to be revealed.')
    }

    const revealedAt = now()
    await ctx.db.patch(round._id, {
      revealAt: revealedAt,
    })
    await appendSessionEvent(ctx, {
      sessionId: session._id,
      roundId: round._id,
      type: 'models_revealed',
      title: `Round ${round.roundNumber} models revealed`,
      description: 'The admin revealed the model names for this round.',
      meta: {},
    })

    return {
      ok: true,
      roundId: round._id,
    }
  },
})
