import { internal } from './_generated/api'
import type { Id } from './_generated/dataModel'
import { internalMutation, internalQuery } from './_generated/server'
import { v } from 'convex/values'
import { getThemeCopy } from '../shared/arena'
import {
  appendSessionEvent,
  getEligibleResponses,
  getRoundByNumber,
  now,
} from './lib'
import {
  artifactStatusValidator,
  artifactTypeValidator,
  nullableStringValidator,
  responseStatusValidator,
} from './validators'

export const getRoundGenerationContext = internalQuery({
  args: {
    sessionId: v.id('sessions'),
    roundId: v.id('rounds'),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId)
    const round = await ctx.db.get(args.roundId)
    if (!session || !round) {
      return null
    }
    const responses = await ctx.db
      .query('roundResponses')
      .withIndex('by_round_id_and_anonymized_slot', (query) =>
        query.eq('roundId', round._id),
      )
      .take(session.selectedModelsSnapshot.length + 2)
    return {
      session,
      round,
      responses,
      themeCopy: getThemeCopy(session.theme),
    }
  },
})

export const getRoundReviewContext = internalQuery({
  args: {
    sessionId: v.id('sessions'),
    roundId: v.id('rounds'),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId)
    const round = await ctx.db.get(args.roundId)
    if (!session || !round) {
      return null
    }
    const responses = await ctx.db
      .query('roundResponses')
      .withIndex('by_round_id_and_anonymized_slot', (query) =>
        query.eq('roundId', round._id),
      )
      .take(session.selectedModelsSnapshot.length + 2)
    const humanVotes = await ctx.db
      .query('roundVotes')
      .withIndex('by_round_id_and_response_id', (query) =>
        query.eq('roundId', round._id),
      )
      .take(512)
    const aiVotes = await ctx.db
      .query('roundAiVotes')
      .withIndex('by_round_id_and_response_id', (query) =>
        query.eq('roundId', round._id),
      )
      .take(512)
    const nextRound =
      round.roundNumber < session.roundCount
        ? await getRoundByNumber(ctx, session._id, round.roundNumber + 1)
        : null
    return {
      session,
      round,
      responses,
      humanVotes,
      aiVotes,
      nextRound,
      themeCopy: getThemeCopy(session.theme),
    }
  },
})

export const getSessionScoreboard = internalQuery({
  args: {
    sessionId: v.id('sessions'),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId)
    if (!session) {
      return []
    }

    const rounds = await ctx.db
      .query('rounds')
      .withIndex('by_session_id_and_round_number', (query) =>
        query.eq('sessionId', session._id),
      )
      .take(session.roundCount + 1)

    const scoreByModel = new Map<
      string,
      {
        label: string
        wins: number
        totalVotes: number
        roundsPlayed: number
      }
    >()

    for (const round of rounds) {
      const responses = await ctx.db
        .query('roundResponses')
        .withIndex('by_round_id_and_anonymized_slot', (query) =>
          query.eq('roundId', round._id),
        )
        .take(16)
      const humanVotes = await ctx.db
        .query('roundVotes')
        .withIndex('by_round_id_and_response_id', (query) =>
          query.eq('roundId', round._id),
        )
        .take(512)
      const aiVotes = await ctx.db
        .query('roundAiVotes')
        .withIndex('by_round_id_and_response_id', (query) =>
          query.eq('roundId', round._id),
        )
        .take(512)

      const tally = new Map<string, number>()
      for (const response of responses) {
        tally.set(response._id, 0)
        const existing = scoreByModel.get(response.modelKey)
        if (existing) {
          existing.roundsPlayed += 1
        } else {
          scoreByModel.set(response.modelKey, {
            label: response.modelLabel,
            wins: 0,
            totalVotes: 0,
            roundsPlayed: 1,
          })
        }
      }
      for (const vote of humanVotes) {
        tally.set(vote.responseId, (tally.get(vote.responseId) ?? 0) + 1)
      }
      for (const vote of aiVotes) {
        tally.set(vote.responseId, (tally.get(vote.responseId) ?? 0) + 1)
      }
      for (const response of responses) {
        const entry = scoreByModel.get(response.modelKey)
        if (!entry) {
          continue
        }
        entry.totalVotes += tally.get(response._id) ?? 0
        if (round.winnerResponseIds.includes(response._id)) {
          entry.wins += 1
        }
      }
    }

    return Array.from(scoreByModel.entries())
      .map(([modelKey, entry]) => ({
        modelKey,
        label: entry.label,
        wins: entry.wins,
        totalVotes: entry.totalVotes,
        roundsPlayed: entry.roundsPlayed,
      }))
      .sort((left, right) => {
        if (right.wins !== left.wins) {
          return right.wins - left.wins
        }
        return right.totalVotes - left.totalVotes
      })
  },
})

export const saveArtifact = internalMutation({
  args: {
    sessionId: v.id('sessions'),
    roundId: v.id('rounds'),
    type: artifactTypeValidator,
    status: artifactStatusValidator,
    content: v.string(),
    modelId: nullableStringValidator,
    failureReason: nullableStringValidator,
  },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId)
    if (!session || session.status === 'stopped') {
      return null
    }
    const existing = await ctx.db
      .query('roundArtifacts')
      .withIndex('by_round_id_and_type', (query) =>
        query.eq('roundId', args.roundId).eq('type', args.type),
      )
      .unique()
    if (existing) {
      await ctx.db.patch(existing._id, {
        status: args.status,
        content: args.content,
        modelId: args.modelId,
        failureReason: args.failureReason,
        createdAt: now(),
      })
      return existing._id
    }
    return await ctx.db.insert('roundArtifacts', {
      sessionId: args.sessionId,
      roundId: args.roundId,
      type: args.type,
      status: args.status,
      content: args.content,
      modelId: args.modelId,
      failureReason: args.failureReason,
      createdAt: now(),
    })
  },
})

export const saveModelResponse = internalMutation({
  args: {
    sessionId: v.id('sessions'),
    roundId: v.id('rounds'),
    modelKey: v.string(),
    status: responseStatusValidator,
    responseText: nullableStringValidator,
    latencyMs: v.union(v.number(), v.null()),
    tokenUsageInput: v.union(v.number(), v.null()),
    tokenUsageOutput: v.union(v.number(), v.null()),
    errorCode: nullableStringValidator,
    errorMessage: nullableStringValidator,
  },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId)
    if (!session || session.status === 'stopped') {
      return null
    }
    const response = await ctx.db
      .query('roundResponses')
      .withIndex('by_round_id_and_model_key', (query) =>
        query.eq('roundId', args.roundId).eq('modelKey', args.modelKey),
      )
      .unique()
    if (!response) {
      return null
    }
    await ctx.db.patch(response._id, {
      status: args.status,
      responseText: args.responseText,
      latencyMs: args.latencyMs,
      tokenUsageInput: args.tokenUsageInput,
      tokenUsageOutput: args.tokenUsageOutput,
      errorCode: args.errorCode,
      errorMessage: args.errorMessage,
      completedAt: now(),
    })
    return response._id
  },
})

export const saveAiVote = internalMutation({
  args: {
    roundId: v.id('rounds'),
    voterModelKey: v.string(),
    responseId: v.id('roundResponses'),
    rationale: nullableStringValidator,
  },
  handler: async (ctx, args) => {
    const round = await ctx.db.get(args.roundId)
    if (!round || round.status !== 'voting') {
      return null
    }
    const existing = await ctx.db
      .query('roundAiVotes')
      .withIndex('by_round_id_and_voter_model_key', (query) =>
        query
          .eq('roundId', args.roundId)
          .eq('voterModelKey', args.voterModelKey),
      )
      .unique()
    if (existing) {
      return existing._id
    }
    return await ctx.db.insert('roundAiVotes', {
      roundId: args.roundId,
      voterModelKey: args.voterModelKey,
      responseId: args.responseId,
      rationale: args.rationale,
      source: 'ai',
      createdAt: now(),
    })
  },
})

export const openVoting = internalMutation({
  args: {
    sessionId: v.id('sessions'),
    roundId: v.id('rounds'),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId)
    const round = await ctx.db.get(args.roundId)
    if (!session || !round) {
      return null
    }
    if (session.status !== 'active' || round.status !== 'generating') {
      return null
    }
    const openedAt = now()
    await ctx.db.patch(round._id, {
      status: 'voting',
      votingStartedAt: openedAt,
      votingEndsAt: openedAt + session.votingWindowSeconds * 1000,
    })
    await appendSessionEvent(ctx, {
      sessionId: session._id,
      roundId: round._id,
      type: 'voting_opened',
      title: `Round ${round.roundNumber} voting is live`,
      description:
        'Responses are locked in and votes are now updating in real time.',
      meta: {},
    })
    await ctx.scheduler.runAfter(
      session.votingWindowSeconds * 1000,
      internal.state.finalizeRound,
      {
        sessionId: session._id,
        roundId: round._id,
        triggeredBy: 'timer',
      },
    )
    return round._id
  },
})

export const finalizeRound = internalMutation({
  args: {
    sessionId: v.id('sessions'),
    roundId: v.id('rounds'),
    triggeredBy: v.union(
      v.literal('timer'),
      v.literal('manual'),
      v.literal('system'),
    ),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId)
    const round = await ctx.db.get(args.roundId)
    if (!session || !round) {
      return null
    }
    if (session.status === 'stopped') {
      return null
    }
    if (round.status === 'scored' || round.status === 'aborted') {
      return {
        roundId: round._id,
        nextRoundId: null,
        isLastRound: round.roundNumber >= session.roundCount,
      }
    }

    const responses = await ctx.db
      .query('roundResponses')
      .withIndex('by_round_id_and_anonymized_slot', (query) =>
        query.eq('roundId', round._id),
      )
      .take(session.selectedModelsSnapshot.length + 2)
    const eligibleResponses = getEligibleResponses(responses)
    const humanVotes = await ctx.db
      .query('roundVotes')
      .withIndex('by_round_id_and_response_id', (query) =>
        query.eq('roundId', round._id),
      )
      .take(512)
    const aiVotes = await ctx.db
      .query('roundAiVotes')
      .withIndex('by_round_id_and_response_id', (query) =>
        query.eq('roundId', round._id),
      )
      .take(512)

    const tally = new Map<string, number>()
    for (const response of eligibleResponses) {
      tally.set(response._id, 0)
    }
    for (const vote of humanVotes) {
      tally.set(vote.responseId, (tally.get(vote.responseId) ?? 0) + 1)
    }
    for (const vote of aiVotes) {
      tally.set(vote.responseId, (tally.get(vote.responseId) ?? 0) + 1)
    }

    let winnerResponseIds: Array<(typeof round.winnerResponseIds)[number]> = []
    let resultStatus: 'winner' | 'tie' | 'aborted' = 'aborted'

    if (eligibleResponses.length > 0) {
      let maxVotes = -1
      for (const response of eligibleResponses) {
        maxVotes = Math.max(maxVotes, tally.get(response._id) ?? 0)
      }
      winnerResponseIds = eligibleResponses
        .filter((response) => (tally.get(response._id) ?? 0) === maxVotes)
        .map((response) => response._id)
      resultStatus = winnerResponseIds.length > 1 ? 'tie' : 'winner'
    }

    const closedAt = now()
    await ctx.db.patch(round._id, {
      status: 'scored',
      closedAt,
      revealAt: closedAt,
      resultStatus,
      winnerResponseIds,
    })

    let nextRoundId: Id<'rounds'> | null = null
    const isLastRound = round.roundNumber >= session.roundCount

    if (isLastRound) {
      await ctx.db.patch(session._id, {
        status: 'ended',
        endedAt: closedAt,
      })
    } else {
      const nextRound = await getRoundByNumber(
        ctx,
        session._id,
        round.roundNumber + 1,
      )
      if (nextRound) {
        await ctx.db.patch(nextRound._id, {
          status: 'collecting_topic',
        })
        await ctx.db.patch(session._id, {
          currentRoundNumber: nextRound.roundNumber,
        })
        nextRoundId = nextRound._id
      }
    }

    await appendSessionEvent(ctx, {
      sessionId: session._id,
      roundId: round._id,
      type: 'round_scored',
      title: `Round ${round.roundNumber} is complete`,
      description:
        resultStatus === 'aborted'
          ? 'No valid responses made it through the round.'
          : resultStatus === 'tie'
            ? 'The round ended in a tie at the top of the board.'
            : 'A winner has been locked in and revealed.',
      meta: {
        triggeredBy: args.triggeredBy,
      },
    })

    await ctx.scheduler.runAfter(
      0,
      internal.orchestration.afterRoundFinalized,
      {
        sessionId: session._id,
        roundId: round._id,
        nextRoundId,
        isLastRound,
      },
    )

    return {
      roundId: round._id,
      nextRoundId,
      isLastRound,
    }
  },
})
