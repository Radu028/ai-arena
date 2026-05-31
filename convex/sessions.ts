import { internal } from './_generated/api'
import type { Doc } from './_generated/dataModel'
import { mutation, query } from './_generated/server'
import type { MutationCtx, QueryCtx } from './_generated/server'
import { v } from 'convex/values'
import {
  MAX_CUSTOM_PROMPT_LENGTH,
  MAX_MODELS_PER_SESSION,
  MAX_ROUNDS,
  MIN_MODELS_PER_SESSION,
  MIN_ROUNDS,
  RESPONSE_LANGUAGE_COPY,
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
  maxRoundResponsesForSession,
  now,
  requireAdminIdentity,
  requireSessionOwner,
} from './lib'
import { responseLanguageValidator } from './validators'

function getResponseLanguage(session: Doc<'sessions'>) {
  return session.responseLanguage ?? 'english'
}

function getCustomPrompt(session: Doc<'sessions'>) {
  const prompt = session.customPrompt?.trim()
  return prompt ? prompt : null
}

function getRoundTopic(session: Doc<'sessions'>) {
  return getCustomPrompt(session) ?? session.title
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

function summarizeRound(
  round: Doc<'rounds'>,
  responses: Array<Doc<'roundResponses'>>,
  humanVotes: Array<Doc<'roundVotes'>>,
  aiVotes: Array<Doc<'roundAiVotes'>>,
  artifacts: Array<Doc<'roundArtifacts'>>,
  revealModels: boolean,
  revealHostTransition: boolean,
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
      kind: response.responseKind ?? 'model',
      participantId: response.participantId ?? null,
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
      hostTransition: revealHostTransition
        ? (artifacts.find((artifact) => artifact.type === 'host_transition')
            ?.content ?? null)
        : null,
      criticAnalysis: revealModels
        ? (artifacts.find((artifact) => artifact.type === 'critic_analysis')
            ?.content ?? null)
        : null,
      hostRecap: revealModels
        ? (artifacts.find((artifact) => artifact.type === 'host_recap')
            ?.content ?? null)
        : null,
      statsSummary: revealModels
        ? (artifacts.find((artifact) => artifact.type === 'stats_summary')
            ?.content ?? null)
        : null,
    },
    totals: {
      humanVotes: humanVotes.length,
      aiVotes: aiVotes.length,
    },
  }
}

async function buildScoreboard(
  ctx: QueryCtx,
  session: Doc<'sessions'>,
  rounds: Array<Doc<'rounds'>>,
  revealedOnly = false,
) {
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
    if (revealedOnly && round.revealAt === null) {
      continue
    }
    const responses = await ctx.db
      .query('roundResponses')
      .withIndex('by_round_id_and_anonymized_slot', (q) =>
        q.eq('roundId', round._id),
      )
      .take(maxRoundResponsesForSession(session))
    const humanVotes = await ctx.db
      .query('roundVotes')
      .withIndex('by_round_id_and_response_id', (q) =>
        q.eq('roundId', round._id),
      )
      .take(session.maxParticipants + 1)
    const aiVotes = await ctx.db
      .query('roundAiVotes')
      .withIndex('by_round_id_and_response_id', (q) =>
        q.eq('roundId', round._id),
      )
      .take(session.selectedModelsSnapshot.length + 1)

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
      .take(maxRoundResponsesForSession(session))
    const humanVotes = await ctx.db
      .query('roundVotes')
      .withIndex('by_round_id_and_response_id', (q) =>
        q.eq('roundId', round._id),
      )
      .take(session.maxParticipants + 1)
    const aiVotes = await ctx.db
      .query('roundAiVotes')
      .withIndex('by_round_id_and_response_id', (q) =>
        q.eq('roundId', round._id),
      )
      .take(session.selectedModelsSnapshot.length + 1)
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
        round.revealAt !== null,
        round.roundNumber <= 1 ||
          rounds.some(
            (candidate) =>
              candidate.roundNumber === round.roundNumber - 1 &&
              (candidate.revealAt !== null || candidate.status === 'aborted'),
          ),
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
  const viewerHasSubmittedResponse =
    viewer && currentRoundDoc
      ? Boolean(
          await ctx.db
            .query('roundResponses')
            .withIndex('by_round_id_and_participant_id', (q) =>
              q
                .eq('roundId', currentRoundDoc._id)
                .eq('participantId', viewer._id),
            )
            .unique(),
        )
      : false

  const scoreboard = await buildScoreboard(ctx, session, rounds, true)

  return {
    session: {
      id: session._id,
      slug: session.slug,
      joinCode: session.joinCode,
      title: session.title,
      theme: session.theme,
      themeLabel: getThemeCopy(session.theme).label,
      customPrompt: getCustomPrompt(session),
      responseLanguage: getResponseLanguage(session),
      responseLanguageLabel:
        RESPONSE_LANGUAGE_COPY[getResponseLanguage(session)].label,
      status: session.status,
      statusLabel: statusTone(session.status),
      roundCount: session.roundCount,
      currentRoundNumber: session.currentRoundNumber,
      startedAt: session.startedAt,
      scheduledStartAt: session.scheduledStartAt,
      stoppedAt: session.stoppedAt,
      endedAt: session.endedAt,
      maxParticipants: session.maxParticipants,
      participantCount: participants.length,
    },
    viewer: viewer
      ? {
          participantId: viewer._id,
          displayName: viewer.displayName,
          email: viewer.email,
          hasVotedCurrentRound: viewerHasVoted,
          hasSubmittedCurrentRound: viewerHasSubmittedResponse,
          canVote: Boolean(
            currentRound && currentRound.status === 'voting' && !viewerHasVoted,
          ),
          canSubmitResponse: Boolean(
            currentRound &&
            currentRound.status === 'collecting_responses' &&
            !viewerHasSubmittedResponse,
          ),
          canSubmitTopic: false,
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
    let identity: Awaited<ReturnType<typeof requireAdminIdentity>>
    try {
      identity = await requireAdminIdentity(ctx)
    } catch {
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
        customPrompt: getCustomPrompt(session),
        responseLanguage: getResponseLanguage(session),
        roundCount: session.roundCount,
        currentRoundNumber: session.currentRoundNumber,
        scheduledStartAt: session.scheduledStartAt,
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
    let identity: Awaited<ReturnType<typeof requireAdminIdentity>>
    try {
      identity = await requireAdminIdentity(ctx)
    } catch {
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
    const hasUnrevealedScoredRound = rounds.some(
      (round) => round.status === 'scored' && round.revealAt === null,
    )
    const canStartNextRound = Boolean(
      session.status === 'active' &&
      currentRound &&
      (currentRound.status === 'scored' || currentRound.status === 'aborted') &&
      (currentRound.status === 'aborted' || currentRound.revealAt !== null) &&
      currentRound.roundNumber < session.roundCount,
    )
    const canEndResponseCollection = Boolean(
      session.status === 'active' &&
      currentRound &&
      currentRound.status === 'collecting_responses',
    )
    return {
      id: session._id,
      slug: session.slug,
      title: session.title,
      joinCode: session.joinCode,
      theme: session.theme,
      themeLabel: getThemeCopy(session.theme).label,
      customPrompt: getCustomPrompt(session),
      responseLanguage: getResponseLanguage(session),
      responseLanguageLabel:
        RESPONSE_LANGUAGE_COPY[getResponseLanguage(session)].label,
      status: session.status,
      roundCount: session.roundCount,
      currentRoundNumber: session.currentRoundNumber,
      currentRoundStatus: currentRound?.status ?? null,
      hasUnrevealedScoredRound,
      canStartNextRound,
      canEndResponseCollection,
      selectedModels: session.selectedModelsSnapshot,
      maxParticipants: session.maxParticipants,
      createdAt: session.createdAt,
      startedAt: session.startedAt,
      scheduledStartAt: session.scheduledStartAt,
      stoppedAt: session.stoppedAt,
      endedAt: session.endedAt,
      scoreboard: await buildScoreboard(ctx, session, rounds),
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
    customPrompt: v.optional(v.string()),
    responseLanguage: v.optional(responseLanguageValidator),
    roundCount: v.number(),
    scheduledStartAt: v.optional(v.union(v.number(), v.null())),
    modelKeys: v.array(v.string()),
    maxParticipants: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await requireAdminIdentity(ctx)
    const title = args.title.trim()
    if (title.length < 3) {
      throw new Error('Session title must be at least 3 characters.')
    }
    const customPrompt = args.customPrompt?.trim() ?? ''
    if (customPrompt.length > MAX_CUSTOM_PROMPT_LENGTH) {
      throw new Error(
        `Custom prompt must stay under ${MAX_CUSTOM_PROMPT_LENGTH} characters.`,
      )
    }
    if (args.roundCount < MIN_ROUNDS || args.roundCount > MAX_ROUNDS) {
      throw new Error('Round count is out of range.')
    }
    const scheduledStartAt = args.scheduledStartAt ?? null
    if (scheduledStartAt !== null && scheduledStartAt <= now() + 30_000) {
      throw new Error('Scheduled start must be at least 30 seconds from now.')
    }
    if (
      args.modelKeys.length < MIN_MODELS_PER_SESSION ||
      args.modelKeys.length > MAX_MODELS_PER_SESSION
    ) {
      throw new Error(
        `Select between ${MIN_MODELS_PER_SESSION} and ${MAX_MODELS_PER_SESSION} models.`,
      )
    }

    const selectedModelsSnapshot = ensureModelSnapshots(args.modelKeys)
    const sessionId = await ctx.db.insert('sessions', {
      slug: await generateUniqueSessionSlug(ctx, title),
      joinCode: await generateUniqueJoinCode(ctx),
      title,
      theme: args.theme,
      customPrompt,
      responseLanguage: args.responseLanguage ?? 'english',
      status: 'waiting',
      createdByIdentity: identity.tokenIdentifier,
      createdByName: identity.name ?? identity.email ?? 'Arena Admin',
      roundCount: args.roundCount,
      currentRoundNumber: 0,
      maxParticipants: clampParticipantLimit(args.maxParticipants),
      votingWindowSeconds: defaultVotingWindowSeconds(),
      scheduledStartAt,
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
      description: scheduledStartAt
        ? 'The arena is configured and scheduled to start automatically.'
        : 'The arena is configured and waiting for the admin to start it.',
      meta: {},
    })

    if (scheduledStartAt) {
      await ctx.scheduler.runAt(
        scheduledStartAt,
        internal.sessionStart.startScheduled,
        {
          sessionId,
          scheduledStartAt,
        },
      )
    }

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
      scheduledStartAt: null,
    })
    await openRoundForParticipantResponses(ctx, session, firstRound)

    await appendSessionEvent(ctx, {
      sessionId: session._id,
      roundId: firstRound._id,
      type: 'session_started',
      title: 'Session started',
      description:
        'Round 1 is open for optional participant jokes before AI generation.',
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
        .take(maxRoundResponsesForSession(session))
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
  const requestedDisplayName = args.displayName.trim()
  if (requestedDisplayName.length > 40) {
    throw new Error('Display names must stay under 40 characters.')
  }
  const email = args.email?.trim() || null
  if (
    email &&
    (email.length > 120 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
  ) {
    throw new Error('Use a valid email address.')
  }
  const displayName = requestedDisplayName || autoDisplayName()
  const identity = await ctx.auth.getUserIdentity()
  const accessToken = args.existingToken ?? generateGuestAccessToken()
  const accessTokenHash = await hashToken(accessToken)
  const existingByToken = await ctx.db
    .query('sessionParticipants')
    .withIndex('by_session_id_and_access_token_hash', (q) =>
      q.eq('sessionId', session._id).eq('accessTokenHash', accessTokenHash),
    )
    .unique()

  if (identity) {
    const existingByIdentity = await ctx.db
      .query('sessionParticipants')
      .withIndex('by_session_id_and_clerk_token_identifier', (q) =>
        q
          .eq('sessionId', session._id)
          .eq('clerkTokenIdentifier', identity.tokenIdentifier),
      )
      .unique()

    if (existingByIdentity) {
      if (existingByToken && existingByToken._id !== existingByIdentity._id) {
        throw new Error('This participant token belongs to a different seat.')
      }
      await ctx.db.patch(existingByIdentity._id, {
        displayName,
        email,
        accessTokenHash,
        lastSeenAt: now(),
      })
      return {
        slug: session.slug,
        sessionId: session._id,
        participantId: existingByIdentity._id,
        accessToken,
        displayName,
      }
    }
  }

  if (existingByToken) {
    await ctx.db.patch(existingByToken._id, {
      displayName,
      email,
      lastSeenAt: now(),
    })
    return {
      slug: session.slug,
      sessionId: session._id,
      participantId: existingByToken._id,
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
    email,
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
