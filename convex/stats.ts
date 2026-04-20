import { query } from './_generated/server'
import { v } from 'convex/values'
import type { QueryCtx } from './_generated/server'
import type { Doc, Id } from './_generated/dataModel'
import {
  computeCostMicrosUsd,
  getModelByKey,
  getThemeCopy,
} from '../shared/arena'

const MAX_SESSIONS_SCAN = 200
const MAX_RESPONSES_PER_ROUND = 16
const MAX_VOTES_PER_ROUND = 512
const MAX_ROUNDS_PER_SESSION = 20

type ModelAggregate = {
  modelKey: string
  label: string
  providerKey: string
  accent: string
  wins: number
  ties: number
  totalVotes: number
  roundsPlayed: number
  sessionsPlayed: Set<Id<'sessions'>>
  tokensIn: number
  tokensOut: number
  costMicrosUsd: number
  successes: number
  failures: number
}

function emptyAggregate(
  modelKey: string,
  fallbackLabel: string,
  fallbackProviderKey: string,
): ModelAggregate {
  const modelDef = getModelByKey(modelKey)
  return {
    modelKey,
    label: modelDef?.label ?? fallbackLabel,
    providerKey: modelDef?.providerKey ?? fallbackProviderKey,
    accent: modelDef?.accent ?? 'var(--arena-signal)',
    wins: 0,
    ties: 0,
    totalVotes: 0,
    roundsPlayed: 0,
    sessionsPlayed: new Set<Id<'sessions'>>(),
    tokensIn: 0,
    tokensOut: 0,
    costMicrosUsd: 0,
    successes: 0,
    failures: 0,
  }
}

async function collectRoundData(
  ctx: QueryCtx,
  session: Doc<'sessions'>,
) {
  const rounds = await ctx.db
    .query('rounds')
    .withIndex('by_session_id_and_round_number', (queryBuilder) =>
      queryBuilder.eq('sessionId', session._id),
    )
    .take(MAX_ROUNDS_PER_SESSION)

  const roundData: Array<{
    round: Doc<'rounds'>
    responses: Array<Doc<'roundResponses'>>
    humanVoteCount: number
    aiVoteCount: number
    voteTally: Map<Id<'roundResponses'>, number>
  }> = []

  for (const round of rounds) {
    const responses = await ctx.db
      .query('roundResponses')
      .withIndex('by_round_id_and_anonymized_slot', (queryBuilder) =>
        queryBuilder.eq('roundId', round._id),
      )
      .take(MAX_RESPONSES_PER_ROUND)
    const humanVotes = await ctx.db
      .query('roundVotes')
      .withIndex('by_round_id_and_response_id', (queryBuilder) =>
        queryBuilder.eq('roundId', round._id),
      )
      .take(MAX_VOTES_PER_ROUND)
    const aiVotes = await ctx.db
      .query('roundAiVotes')
      .withIndex('by_round_id_and_response_id', (queryBuilder) =>
        queryBuilder.eq('roundId', round._id),
      )
      .take(MAX_VOTES_PER_ROUND)

    const voteTally = new Map<Id<'roundResponses'>, number>()
    for (const response of responses) {
      voteTally.set(response._id, 0)
    }
    for (const vote of humanVotes) {
      voteTally.set(vote.responseId, (voteTally.get(vote.responseId) ?? 0) + 1)
    }
    for (const vote of aiVotes) {
      voteTally.set(vote.responseId, (voteTally.get(vote.responseId) ?? 0) + 1)
    }

    roundData.push({
      round,
      responses,
      humanVoteCount: humanVotes.length,
      aiVoteCount: aiVotes.length,
      voteTally,
    })
  }

  return roundData
}

function accumulateModelStats(
  aggregates: Map<string, ModelAggregate>,
  sessionId: Id<'sessions'>,
  responses: Array<Doc<'roundResponses'>>,
  winnerResponseIds: Array<Id<'roundResponses'>>,
  resultStatus: Doc<'rounds'>['resultStatus'],
  voteTally: Map<Id<'roundResponses'>, number>,
) {
  for (const response of responses) {
    const key = response.modelKey
    let agg = aggregates.get(key)
    if (!agg) {
      agg = emptyAggregate(key, response.modelLabel, response.providerKey)
      aggregates.set(key, agg)
    }

    agg.roundsPlayed += 1
    agg.sessionsPlayed.add(sessionId)
    agg.tokensIn += response.tokenUsageInput ?? 0
    agg.tokensOut += response.tokenUsageOutput ?? 0
    agg.costMicrosUsd += computeCostMicrosUsd(
      response.modelKey,
      response.tokenUsageInput,
      response.tokenUsageOutput,
    )
    if (response.status === 'success') {
      agg.successes += 1
    } else if (
      response.status === 'error' ||
      response.status === 'timeout'
    ) {
      agg.failures += 1
    }
    agg.totalVotes += voteTally.get(response._id) ?? 0

    if (winnerResponseIds.includes(response._id)) {
      if (resultStatus === 'tie') {
        agg.ties += 1
      } else if (resultStatus === 'winner') {
        agg.wins += 1
      }
    }
  }
}

export const getModelLeaderboard = query({
  args: {},
  handler: async (ctx) => {
    const sessions = await ctx.db
      .query('sessions')
      .order('desc')
      .take(MAX_SESSIONS_SCAN)

    const aggregates = new Map<string, ModelAggregate>()
    let sessionsIncluded = 0

    for (const session of sessions) {
      if (session.status !== 'ended' && session.status !== 'stopped') {
        continue
      }
      sessionsIncluded += 1
      const roundData = await collectRoundData(ctx, session)
      for (const entry of roundData) {
        if (entry.round.status !== 'scored') continue
        accumulateModelStats(
          aggregates,
          session._id,
          entry.responses,
          entry.round.winnerResponseIds,
          entry.round.resultStatus,
          entry.voteTally,
        )
      }
    }

    const rows = Array.from(aggregates.values())
      .filter((entry) => entry.roundsPlayed > 0)
      .map((entry) => {
        const winRate =
          entry.roundsPlayed > 0
            ? (entry.wins / entry.roundsPlayed) * 100
            : 0
        const reliability =
          entry.successes + entry.failures > 0
            ? (entry.successes / (entry.successes + entry.failures)) * 100
            : 100
        return {
          modelKey: entry.modelKey,
          label: entry.label,
          providerKey: entry.providerKey,
          accent: entry.accent,
          wins: entry.wins,
          ties: entry.ties,
          totalVotes: entry.totalVotes,
          roundsPlayed: entry.roundsPlayed,
          sessionsPlayed: entry.sessionsPlayed.size,
          tokensIn: entry.tokensIn,
          tokensOut: entry.tokensOut,
          costMicrosUsd: entry.costMicrosUsd,
          successes: entry.successes,
          failures: entry.failures,
          winRate,
          reliability,
        }
      })
      .sort((left, right) => {
        if (right.winRate !== left.winRate) return right.winRate - left.winRate
        if (right.wins !== left.wins) return right.wins - left.wins
        return right.totalVotes - left.totalVotes
      })

    return {
      generatedAt: Date.now(),
      sessionsIncluded,
      sessionsScanned: sessions.length,
      rows,
    }
  },
})

export const listCompletedSessions = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const cap = Math.min(Math.max(args.limit ?? 24, 1), 100)
    const sessions = await ctx.db
      .query('sessions')
      .order('desc')
      .take(MAX_SESSIONS_SCAN)

    const completed = sessions.filter(
      (session) =>
        session.status === 'ended' || session.status === 'stopped',
    )

    const rows = []
    for (const session of completed.slice(0, cap)) {
      const rounds = await ctx.db
        .query('rounds')
        .withIndex('by_session_id_and_round_number', (queryBuilder) =>
          queryBuilder.eq('sessionId', session._id),
        )
        .take(MAX_ROUNDS_PER_SESSION)

      const scoredRounds = rounds.filter((round) => round.status === 'scored')
      const winnerTally = new Map<
        string,
        { label: string; wins: number }
      >()
      let totalVotes = 0

      for (const round of scoredRounds) {
        const responses = await ctx.db
          .query('roundResponses')
          .withIndex('by_round_id_and_anonymized_slot', (queryBuilder) =>
            queryBuilder.eq('roundId', round._id),
          )
          .take(MAX_RESPONSES_PER_ROUND)
        const humanVotes = await ctx.db
          .query('roundVotes')
          .withIndex('by_round_id_and_response_id', (queryBuilder) =>
            queryBuilder.eq('roundId', round._id),
          )
          .take(MAX_VOTES_PER_ROUND)
        totalVotes += humanVotes.length

        for (const response of responses) {
          if (round.winnerResponseIds.includes(response._id)) {
            const entry = winnerTally.get(response.modelKey) ?? {
              label: response.modelLabel,
              wins: 0,
            }
            entry.wins += 1
            winnerTally.set(response.modelKey, entry)
          }
        }
      }

      const overallWinner = Array.from(winnerTally.entries())
        .sort((left, right) => right[1].wins - left[1].wins)
        .at(0)

      rows.push({
        id: session._id,
        slug: session.slug,
        title: session.title,
        theme: session.theme,
        themeLabel: getThemeCopy(session.theme).label,
        status: session.status,
        roundCount: session.roundCount,
        completedRounds: scoredRounds.length,
        totalHumanVotes: totalVotes,
        modelCount: session.selectedModelsSnapshot.length,
        endedAt: session.endedAt ?? session.stoppedAt,
        createdAt: session.createdAt,
        overallWinner: overallWinner
          ? {
              modelKey: overallWinner[0],
              label: overallWinner[1].label,
              wins: overallWinner[1].wins,
            }
          : null,
      })
    }

    return {
      rows,
      scanned: sessions.length,
    }
  },
})

export const getAdminCostSummary = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      return {
        isAuthenticated: false,
        sessions: [],
        totals: {
          sessions: 0,
          rounds: 0,
          tokensIn: 0,
          tokensOut: 0,
          costMicrosUsd: 0,
        },
        byModel: [],
      }
    }

    const sessions = await ctx.db
      .query('sessions')
      .withIndex('by_created_by_identity_and_created_at', (queryBuilder) =>
        queryBuilder.eq('createdByIdentity', identity.tokenIdentifier),
      )
      .order('desc')
      .take(MAX_SESSIONS_SCAN)

    const aggregates = new Map<string, ModelAggregate>()
    const sessionRows = []
    let totalRounds = 0

    for (const session of sessions) {
      const rounds = await ctx.db
        .query('rounds')
        .withIndex('by_session_id_and_round_number', (queryBuilder) =>
          queryBuilder.eq('sessionId', session._id),
        )
        .take(MAX_ROUNDS_PER_SESSION)
      totalRounds += rounds.length
      let sessionTokensIn = 0
      let sessionTokensOut = 0
      let sessionCost = 0
      let sessionCalls = 0

      for (const round of rounds) {
        const responses = await ctx.db
          .query('roundResponses')
          .withIndex('by_round_id_and_anonymized_slot', (queryBuilder) =>
            queryBuilder.eq('roundId', round._id),
          )
          .take(MAX_RESPONSES_PER_ROUND)
        for (const response of responses) {
          if (response.status === 'pending') continue
          sessionCalls += 1
          const inTok = response.tokenUsageInput ?? 0
          const outTok = response.tokenUsageOutput ?? 0
          const cost = computeCostMicrosUsd(
            response.modelKey,
            response.tokenUsageInput,
            response.tokenUsageOutput,
          )
          sessionTokensIn += inTok
          sessionTokensOut += outTok
          sessionCost += cost

          let agg = aggregates.get(response.modelKey)
          if (!agg) {
            agg = emptyAggregate(
              response.modelKey,
              response.modelLabel,
              response.providerKey,
            )
            aggregates.set(response.modelKey, agg)
          }
          agg.tokensIn += inTok
          agg.tokensOut += outTok
          agg.costMicrosUsd += cost
          agg.roundsPlayed += 1
          agg.sessionsPlayed.add(session._id)
          if (response.status === 'success') agg.successes += 1
          else if (
            response.status === 'error' ||
            response.status === 'timeout'
          )
            agg.failures += 1
        }
      }

      sessionRows.push({
        id: session._id,
        title: session.title,
        status: session.status,
        theme: session.theme,
        themeLabel: getThemeCopy(session.theme).label,
        roundCount: session.roundCount,
        createdAt: session.createdAt,
        tokensIn: sessionTokensIn,
        tokensOut: sessionTokensOut,
        totalCalls: sessionCalls,
        costMicrosUsd: sessionCost,
      })
    }

    const byModel = Array.from(aggregates.values())
      .map((entry) => ({
        modelKey: entry.modelKey,
        label: entry.label,
        providerKey: entry.providerKey,
        accent: entry.accent,
        tokensIn: entry.tokensIn,
        tokensOut: entry.tokensOut,
        costMicrosUsd: entry.costMicrosUsd,
        calls: entry.successes + entry.failures,
        successes: entry.successes,
        failures: entry.failures,
      }))
      .sort((left, right) => right.costMicrosUsd - left.costMicrosUsd)

    const totals = sessionRows.reduce(
      (acc, row) => ({
        sessions: acc.sessions + 1,
        rounds: acc.rounds + row.roundCount,
        tokensIn: acc.tokensIn + row.tokensIn,
        tokensOut: acc.tokensOut + row.tokensOut,
        costMicrosUsd: acc.costMicrosUsd + row.costMicrosUsd,
      }),
      { sessions: 0, rounds: 0, tokensIn: 0, tokensOut: 0, costMicrosUsd: 0 },
    )

    return {
      isAuthenticated: true,
      sessions: sessionRows,
      byModel,
      totals: {
        ...totals,
        rounds: totalRounds,
      },
    }
  },
})
