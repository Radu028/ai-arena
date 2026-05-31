import { internal } from './_generated/api'
import { mutation } from './_generated/server'
import type { MutationCtx } from './_generated/server'
import type { Doc } from './_generated/dataModel'
import { v } from 'convex/values'
import {
  buildAnonymizedSlots,
  getParticipantByToken,
  getRoundByNumber,
  getSessionBySlug,
  maxRoundResponsesForSession,
  now,
  appendSessionEvent,
  participantResponseModelKey,
  requireSessionOwner,
} from './lib'
import {
  MAX_PARTICIPANT_RESPONSE_LENGTH,
  MAX_TOPIC_LENGTH,
  MIN_PARTICIPANT_RESPONSE_LENGTH,
  MIN_TOPIC_LENGTH,
  getRoundSlotLabel,
} from '../shared/arena'

function getRoundTopic(session: Doc<'sessions'>) {
  const prompt = session.customPrompt?.trim()
  return prompt ? prompt : session.title
}

async function prepareRoundResponses(
  ctx: MutationCtx,
  session: Doc<'sessions'>,
  round: Doc<'rounds'>,
  promptVersion: string,
) {
  const startedAt = now()
  const participantResponses = await ctx.db
    .query('roundResponses')
    .withIndex('by_round_id_and_anonymized_slot', (query) =>
      query.eq('roundId', round._id),
    )
    .take(maxRoundResponsesForSession(session))
  const slots = buildAnonymizedSlots(
    participantResponses.length + session.selectedModelsSnapshot.length,
  )

  await ctx.db.patch(round._id, {
    status: 'generating',
    topic: getRoundTopic(session),
    topicSubmittedByParticipantId: null,
    topicLockedAt: round.topicLockedAt ?? startedAt,
    generatingStartedAt: startedAt,
  })

  for (const [index, response] of participantResponses.entries()) {
    await ctx.db.patch(response._id, {
      anonymizedSlot: slots[index],
    })
  }

  for (const [index, model] of session.selectedModelsSnapshot.entries()) {
    await ctx.db.insert('roundResponses', {
      sessionId: session._id,
      roundId: round._id,
      responseKind: 'model',
      participantId: null,
      providerKey: model.providerKey,
      modelKey: model.key,
      modelId: model.modelId,
      modelLabel: model.label,
      anonymizedSlot: slots[participantResponses.length + index],
      promptVersion,
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
        responseKind: 'model',
        participantId: null,
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

export const submitParticipantResponse = mutation({
  args: {
    slug: v.string(),
    participantToken: v.string(),
    responseText: v.string(),
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
      throw new Error('Join the session before submitting a joke.')
    }

    const round = await getRoundByNumber(
      ctx,
      session._id,
      session.currentRoundNumber,
    )
    if (!round || round.status !== 'collecting_responses') {
      throw new Error('Participant joke submissions are closed right now.')
    }

    const responseText = args.responseText.trim()
    if (
      responseText.length < MIN_PARTICIPANT_RESPONSE_LENGTH ||
      responseText.length > MAX_PARTICIPANT_RESPONSE_LENGTH
    ) {
      throw new Error('Joke length is invalid.')
    }

    const existing = await ctx.db
      .query('roundResponses')
      .withIndex('by_round_id_and_participant_id', (query) =>
        query.eq('roundId', round._id).eq('participantId', participant._id),
      )
      .unique()
    const submittedAt = now()
    if (existing) {
      await ctx.db.patch(existing._id, {
        responseText,
        status: 'success',
        modelLabel: participant.displayName,
        completedAt: submittedAt,
      })
      await ctx.db.patch(participant._id, { lastSeenAt: submittedAt })
      return {
        accepted: true,
        updated: true,
        responseId: existing._id,
      }
    }

    const existingResponses = await ctx.db
      .query('roundResponses')
      .withIndex('by_round_id_and_anonymized_slot', (query) =>
        query.eq('roundId', round._id),
      )
      .take(maxRoundResponsesForSession(session))
    const responseId = await ctx.db.insert('roundResponses', {
      sessionId: session._id,
      roundId: round._id,
      responseKind: 'participant',
      participantId: participant._id,
      providerKey: 'participant',
      modelKey: participantResponseModelKey(participant._id),
      modelId: participant._id,
      modelLabel: participant.displayName,
      anonymizedSlot: getRoundSlotLabel(existingResponses.length),
      promptVersion: 'participant-v1',
      responseText,
      status: 'success',
      latencyMs: null,
      tokenUsageInput: null,
      tokenUsageOutput: null,
      costMicrosUsd: null,
      errorCode: null,
      errorMessage: null,
      createdAt: submittedAt,
      completedAt: submittedAt,
    })
    await ctx.db.patch(participant._id, { lastSeenAt: submittedAt })

    return {
      accepted: true,
      updated: false,
      responseId,
    }
  },
})

export const endResponseCollection = mutation({
  args: {
    sessionId: v.id('sessions'),
  },
  handler: async (ctx, args) => {
    const { session } = await requireSessionOwner(ctx, args.sessionId)
    if (session.status !== 'active') {
      throw new Error('Only active sessions can start model generation.')
    }
    const round = await getRoundByNumber(
      ctx,
      session._id,
      session.currentRoundNumber,
    )
    if (!round || round.status !== 'collecting_responses') {
      throw new Error('There is no open participant submission stage.')
    }

    await prepareRoundResponses(ctx, session, round, 'v2')
    await appendSessionEvent(ctx, {
      sessionId: session._id,
      roundId: round._id,
      type: 'participant_submissions_closed',
      title: `Round ${round.roundNumber} participant submissions closed`,
      description:
        'The admin closed optional user jokes and started AI generation.',
      meta: {},
    })
    await ctx.scheduler.runAfter(0, internal.orchestration.generateRound, {
      sessionId: session._id,
      roundId: round._id,
    })

    return {
      ok: true,
      roundId: round._id,
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
    const topic = getRoundTopic(session)
    await ctx.db.patch(nextRound._id, {
      status: 'collecting_responses',
      topic,
      topicSubmittedByParticipantId: null,
      topicLockedAt: startedAt,
      generatingStartedAt: null,
    })
    await ctx.db.patch(session._id, {
      currentRoundNumber: nextRound.roundNumber,
    })
    await appendSessionEvent(ctx, {
      sessionId: session._id,
      roundId: nextRound._id,
      type: 'round_started',
      title: `Round ${nextRound.roundNumber} started`,
      description:
        'The admin opened optional participant jokes for the next round.',
      meta: {},
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
