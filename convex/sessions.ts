import type { Doc } from './_generated/dataModel'
import { mutation, query } from './_generated/server'
import type { MutationCtx, QueryCtx } from './_generated/server'
import { v } from 'convex/values'
import {
  MAX_MODELS_PER_SESSION,
  MAX_ROUNDS,
  MIN_MODELS_PER_SESSION,
  MIN_ROUNDS,
  getThemeCopy,
  statusTone,
} from '../shared/arena'
import {
  appendSessionEvent,
  autoDisplayName,
  clampParticipantLimit,
  countParticipantsForSession,
  defaultVotingWindowSeconds,
  ensureModelSnapshots,
  generateGuestAccessToken,
  generateUniqueJoinCode,
  generateUniqueSessionSlug,
  getParticipantByToken,
  getRoundByNumber,
  getSessionByJoinCode,
  getSessionBySlug,
  hashToken,
  listRoundsForSession,
  now,
  requireAdminIdentity,
  requireSessionOwner,
} from './lib'

function summarizeRound(
  round: Doc<'rounds'>,
  responses: Array<Doc<'roundResponses'>>,
  humanVotes: Array<Doc<'roundVotes'>>,
  aiVotes: Array<Doc<'roundAiVotes'>>,
  artifacts: Array<Doc<'roundArtifacts'>>,
  revealModels: boolean,
) {
  const voteCount = new Map<string, number>()
  for (const response of responses) {
    voteCount.set(response._id, 0)
  }
  for (const vote of humanVotes) {
    voteCount.set(vote.responseId, (voteCount.get(vote.responseId) ?? 0) + 1)
  }
  for (const vote of aiVotes) {
    voteCount.set(vote.responseId, (voteCount.get(vote.responseId) ?? 0) + 1)
  }

  return {
    id: round._id,
    roundNumber: round.roundNumber,
    status: round.status,
    topic: round.topic,
    resultStatus: round.resultStatus,
    topicLockedAt: round.topicLockedAt,
    votingEndsAt: round.votingEndsAt,
    responses: responses.map((response) => ({
      id: response._id,
      slot: response.anonymizedSlot,
      status: response.status,
      text: response.responseText,
      label: revealModels ? response.modelLabel : null,
      modelKey: revealModels ? response.modelKey : null,
      votes: voteCount.get(response._id) ?? 0,
      isWinner: round.winnerResponseIds.includes(response._id),
      errorMessage: response.errorMessage,
      latencyMs: response.latencyMs,
    })),
    artifacts: {
      hostIntro:
        artifacts.find((artifact) => artifact.type === 'host_intro')?.content ??
        null,
      hostTransition:
        artifacts.find((artifact) => artifact.type === 'host_transition')
          ?.content ?? null,
      criticAnalysis:
        artifacts.find((artifact) => artifact.type === 'critic_analysis')
          ?.content ?? null,
      hostRecap:
        artifacts.find((artifact) => artifact.type === 'host_recap')?.content ??
        null,
    },
    totals: {
      humanVotes: humanVotes.length,
      aiVotes: aiVotes.length,
    },
  }
}

async function buildScoreboard(ctx: QueryCtx, rounds: Array<Doc<'rounds'>>) {
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
      .withIndex('by_round_id_and_anonymized_slot', (q) =>
        q.eq('roundId', round._id),
      )
      .take(16)
    const humanVotes = await ctx.db
      .query('roundVotes')
      .withIndex('by_round_id_and_response_id', (q) =>
        q.eq('roundId', round._id),
      )
      .take(512)
    const aiVotes = await ctx.db
      .query('roundAiVotes')
      .withIndex('by_round_id_and_response_id', (q) =>
        q.eq('roundId', round._id),
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
}

async function buildSessionView(
  ctx: QueryCtx,
  session: Doc<'sessions'>,
  participantToken: string | null,
) {
  const viewer = await getParticipantByToken(ctx, session._id, participantToken)
  const rounds = await listRoundsForSession(
    ctx,
    session._id,
    session.roundCount + 1,
  )
  const participants = await ctx.db
    .query('sessionParticipants')
    .withIndex('by_session_id', (q) => q.eq('sessionId', session._id))
    .take(session.maxParticipants + 1)
  const events = await ctx.db
    .query('sessionEvents')
    .withIndex('by_session_id_and_created_at', (q) =>
      q.eq('sessionId', session._id),
    )
    .order('desc')
    .take(24)

  const roundViews = []
  for (const round of rounds) {
    const responses = await ctx.db
      .query('roundResponses')
      .withIndex('by_round_id_and_anonymized_slot', (q) =>
        q.eq('roundId', round._id),
      )
      .take(session.selectedModelsSnapshot.length + 2)
    const humanVotes = await ctx.db
      .query('roundVotes')
      .withIndex('by_round_id_and_response_id', (q) =>
        q.eq('roundId', round._id),
      )
      .take(512)
    const aiVotes = await ctx.db
      .query('roundAiVotes')
      .withIndex('by_round_id_and_response_id', (q) =>
        q.eq('roundId', round._id),
      )
      .take(512)
    const artifacts = await ctx.db
      .query('roundArtifacts')
      .withIndex('by_round_id_and_type', (q) => q.eq('roundId', round._id))
      .take(8)
    roundViews.push(
      summarizeRound(
        round,
        responses,
        humanVotes,
        aiVotes,
        artifacts,
        round.status === 'scored',
      ),
    )
  }

  const currentRound =
    session.currentRoundNumber > 0
      ? (roundViews.find(
          (round) => round.roundNumber === session.currentRoundNumber,
        ) ?? null)
      : null
  const latestFinishedRound =
    roundViews.filter((round) => round.status === 'scored').at(-1) ?? null
  const currentRoundDoc =
    session.currentRoundNumber > 0
      ? await getRoundByNumber(ctx, session._id, session.currentRoundNumber)
      : null
  const viewerHasVoted =
    viewer && currentRoundDoc
      ? Boolean(
          await ctx.db
            .query('roundVotes')
            .withIndex('by_round_id_and_participant_id', (q) =>
              q
                .eq('roundId', currentRoundDoc._id)
                .eq('participantId', viewer._id),
            )
            .unique(),
        )
      : false

  const scoreboard = await buildScoreboard(ctx, rounds)

  return {
    session: {
      id: session._id,
      slug: session.slug,
      joinCode: session.joinCode,
      title: session.title,
      theme: session.theme,
      themeLabel: getThemeCopy(session.theme).label,
      status: session.status,
      statusLabel: statusTone(session.status),
      roundCount: session.roundCount,
      currentRoundNumber: session.currentRoundNumber,
      startedAt: session.startedAt,
      stoppedAt: session.stoppedAt,
      endedAt: session.endedAt,
      maxParticipants: session.maxParticipants,
      participantCount: participants.length,
      selectedModels: session.selectedModelsSnapshot,
    },
    viewer: viewer
      ? {
          participantId: viewer._id,
          displayName: viewer.displayName,
          email: viewer.email,
          hasVotedCurrentRound: viewerHasVoted,
          canVote: Boolean(
            currentRound && currentRound.status === 'voting' && !viewerHasVoted,
          ),
          canSubmitTopic: Boolean(
            currentRound &&
            currentRound.status === 'collecting_topic' &&
            session.status === 'active',
          ),
        }
      : null,
    participants: participants.map((participant) => ({
      id: participant._id,
      displayName: participant.displayName,
      kind: participant.kind,
      joinedAt: participant.joinedAt,
    })),
    currentRound,
    latestFinishedRound,
    rounds: roundViews,
    scoreboard,
    events: [...events].reverse(),
  }
}

export const listAdminSessions = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      return {
        isAuthenticated: false,
        sessions: [],
      }
    }
    const sessions = await ctx.db
      .query('sessions')
      .withIndex('by_created_by_identity_and_created_at', (q) =>
        q.eq('createdByIdentity', identity.tokenIdentifier),
      )
      .order('desc')
      .take(32)
    return {
      isAuthenticated: true,
      sessions: sessions.map((session) => ({
        id: session._id,
        slug: session.slug,
        title: session.title,
        joinCode: session.joinCode,
        status: session.status,
        theme: session.theme,
        roundCount: session.roundCount,
        currentRoundNumber: session.currentRoundNumber,
        createdAt: session.createdAt,
      })),
    }
  },
})

export const getAdminSession = query({
  args: {
    sessionId: v.id('sessions'),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      return null
    }
    const session = await ctx.db.get(args.sessionId)
    if (!session || session.createdByIdentity !== identity.tokenIdentifier) {
      return null
    }
    const rounds = await listRoundsForSession(
      ctx,
      session._id,
      session.roundCount + 1,
    )
    const currentRound =
      session.currentRoundNumber > 0
        ? (rounds.find(
            (round) => round.roundNumber === session.currentRoundNumber,
          ) ?? null)
        : null
    return {
      id: session._id,
      slug: session.slug,
      title: session.title,
      joinCode: session.joinCode,
      theme: session.theme,
      themeLabel: getThemeCopy(session.theme).label,
      status: session.status,
      roundCount: session.roundCount,
      currentRoundNumber: session.currentRoundNumber,
      currentRoundStatus: currentRound?.status ?? null,
      selectedModels: session.selectedModelsSnapshot,
      maxParticipants: session.maxParticipants,
      createdAt: session.createdAt,
      startedAt: session.startedAt,
      stoppedAt: session.stoppedAt,
      endedAt: session.endedAt,
      scoreboard: await buildScoreboard(ctx, rounds),
    }
  },
})

export const getPublicSessionView = query({
  args: {
    slug: v.string(),
    participantToken: v.union(v.string(), v.null()),
  },
  handler: async (ctx, args) => {
    const session = await getSessionBySlug(ctx, args.slug)
    if (!session) {
      return null
    }
    return await buildSessionView(ctx, session, args.participantToken)
  },
})

export const create = mutation({
  args: {
    title: v.string(),
    theme: v.union(
      v.literal('comedy'),
      v.literal('debate'),
      v.literal('eli5'),
      v.literal('freeform'),
    ),
    roundCount: v.number(),
    modelKeys: v.array(v.string()),
    maxParticipants: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await requireAdminIdentity(ctx)
    const title = args.title.trim()
    if (title.length < 3) {
      throw new Error('Session title must be at least 3 characters.')
    }
    if (args.roundCount < MIN_ROUNDS || args.roundCount > MAX_ROUNDS) {
      throw new Error('Round count is out of range.')
    }
    if (
      args.modelKeys.length < MIN_MODELS_PER_SESSION ||
      args.modelKeys.length > MAX_MODELS_PER_SESSION
    ) {
      throw new Error('Select between two and five models.')
    }

    const selectedModelsSnapshot = ensureModelSnapshots(args.modelKeys)
    const sessionId = await ctx.db.insert('sessions', {
      slug: await generateUniqueSessionSlug(ctx, title),
      joinCode: await generateUniqueJoinCode(ctx),
      title,
      theme: args.theme,
      status: 'waiting',
      createdByIdentity: identity.tokenIdentifier,
      createdByName: identity.name ?? identity.email ?? 'Arena Admin',
      roundCount: args.roundCount,
      currentRoundNumber: 0,
      maxParticipants: clampParticipantLimit(args.maxParticipants),
      votingWindowSeconds: defaultVotingWindowSeconds(),
      selectedModelKeys: args.modelKeys,
      selectedModelsSnapshot,
      startedAt: null,
      stoppedAt: null,
      endedAt: null,
      createdAt: now(),
    })

    for (
      let roundNumber = 1;
      roundNumber <= args.roundCount;
      roundNumber += 1
    ) {
      await ctx.db.insert('rounds', {
        sessionId,
        roundNumber,
        status: 'pending',
        topic: null,
        topicSubmittedByParticipantId: null,
        topicLockedAt: null,
        generatingStartedAt: null,
        votingStartedAt: null,
        votingEndsAt: null,
        closedAt: null,
        revealAt: null,
        resultStatus: 'pending',
        winnerResponseIds: [],
      })
    }

    await appendSessionEvent(ctx, {
      sessionId,
      type: 'session_created',
      title: 'Session created',
      description:
        'The arena is configured and waiting for the admin to start it.',
      meta: {},
    })

    const session = await ctx.db.get(sessionId)
    if (!session) {
      throw new Error('Failed to load the newly created session.')
    }

    return {
      sessionId,
      slug: session.slug,
      joinCode: session.joinCode,
      joinPath: `/sessions/${session.slug}`,
      adminPath: `/admin/sessions/${sessionId}`,
    }
  },
})

export const start = mutation({
  args: {
    sessionId: v.id('sessions'),
  },
  handler: async (ctx, args) => {
    const { session } = await requireSessionOwner(ctx, args.sessionId)
    if (session.status !== 'waiting') {
      throw new Error('Only waiting sessions can be started.')
    }
    const firstRound = await getRoundByNumber(ctx, session._id, 1)
    if (!firstRound) {
      throw new Error('The first round is missing.')
    }

    await ctx.db.patch(session._id, {
      status: 'active',
      currentRoundNumber: 1,
      startedAt: now(),
    })
    await ctx.db.patch(firstRound._id, {
      status: 'collecting_topic',
    })

    await appendSessionEvent(ctx, {
      sessionId: session._id,
      roundId: firstRound._id,
      type: 'session_started',
      title: 'Session started',
      description: 'Round 1 is live and waiting for the first topic.',
      meta: {},
    })

    return {
      ok: true,
      roundId: firstRound._id,
    }
  },
})

export const stop = mutation({
  args: {
    sessionId: v.id('sessions'),
  },
  handler: async (ctx, args) => {
    const { session } = await requireSessionOwner(ctx, args.sessionId)
    if (session.status === 'stopped' || session.status === 'ended') {
      throw new Error('This session is already closed.')
    }

    const currentRound =
      session.currentRoundNumber > 0
        ? await getRoundByNumber(ctx, session._id, session.currentRoundNumber)
        : null

    await ctx.db.patch(session._id, {
      status: 'stopped',
      stoppedAt: now(),
    })

    if (
      currentRound &&
      currentRound.status !== 'scored' &&
      currentRound.status !== 'aborted'
    ) {
      await ctx.db.patch(currentRound._id, {
        status: 'aborted',
        closedAt: now(),
        resultStatus: 'aborted',
        winnerResponseIds: [],
      })
      const responses = await ctx.db
        .query('roundResponses')
        .withIndex('by_round_id_and_anonymized_slot', (q) =>
          q.eq('roundId', currentRound._id),
        )
        .take(session.selectedModelsSnapshot.length + 2)
      for (const response of responses) {
        if (response.status === 'pending') {
          await ctx.db.patch(response._id, {
            status: 'stopped',
            errorCode: 'SESSION_STOPPED',
            errorMessage: 'Session was stopped by the admin.',
            completedAt: now(),
          })
        }
      }
    }

    await appendSessionEvent(ctx, {
      sessionId: session._id,
      roundId: currentRound?._id ?? null,
      type: 'session_stopped',
      title: 'Session stopped',
      description:
        'The admin stopped the session. No further model calls will be accepted.',
      meta: {},
    })

    return { ok: true }
  },
})

async function joinSession(
  ctx: MutationCtx,
  session: Doc<'sessions'>,
  args: {
    displayName: string
    email?: string | null
    existingToken?: string | null
  },
) {
  if (session.status === 'ended' || session.status === 'stopped') {
    throw new Error('This session has already finished.')
  }
  const participantCount = await countParticipantsForSession(
    ctx,
    session._id,
    session.maxParticipants + 1,
  )
  const displayName = args.displayName.trim() || autoDisplayName()
  const identity = await ctx.auth.getUserIdentity()
  const accessToken = args.existingToken ?? generateGuestAccessToken()
  const accessTokenHash = await hashToken(accessToken)

  const existing = await ctx.db
    .query('sessionParticipants')
    .withIndex('by_session_id_and_access_token_hash', (q) =>
      q.eq('sessionId', session._id).eq('accessTokenHash', accessTokenHash),
    )
    .unique()

  if (existing) {
    await ctx.db.patch(existing._id, {
      displayName,
      email: args.email ?? null,
      lastSeenAt: now(),
    })
    return {
      slug: session.slug,
      sessionId: session._id,
      participantId: existing._id,
      accessToken,
      displayName,
    }
  }

  if (participantCount >= session.maxParticipants) {
    throw new Error('This session lobby is full.')
  }

  const participantId = await ctx.db.insert('sessionParticipants', {
    sessionId: session._id,
    kind:
      identity && identity.tokenIdentifier === session.createdByIdentity
        ? 'admin'
        : 'guest',
    displayName,
    email: args.email ?? null,
    clerkTokenIdentifier: identity?.tokenIdentifier ?? null,
    accessTokenHash,
    joinedAt: now(),
    lastSeenAt: now(),
  })

  return {
    slug: session.slug,
    sessionId: session._id,
    participantId,
    accessToken,
    displayName,
  }
}

export const joinBySlug = mutation({
  args: {
    slug: v.string(),
    displayName: v.string(),
    email: v.optional(v.union(v.string(), v.null())),
    existingToken: v.optional(v.union(v.string(), v.null())),
  },
  handler: async (ctx, args) => {
    const session = await getSessionBySlug(ctx, args.slug)
    if (!session) {
      throw new Error('Session not found.')
    }
    return await joinSession(ctx, session, args)
  },
})

export const joinByCode = mutation({
  args: {
    code: v.string(),
    displayName: v.string(),
    email: v.optional(v.union(v.string(), v.null())),
    existingToken: v.optional(v.union(v.string(), v.null())),
  },
  handler: async (ctx, args) => {
    const session = await getSessionByJoinCode(
      ctx,
      args.code.trim().toUpperCase(),
    )
    if (!session) {
      throw new Error('Join code not found.')
    }
    return await joinSession(ctx, session, args)
  },
})
