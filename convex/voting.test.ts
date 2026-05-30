/// <reference types="vite/client" />
// @vitest-environment edge-runtime

import { convexTest } from 'convex-test'
import { afterEach, describe, expect, test, vi } from 'vitest'
import { api, internal } from './_generated/api'
import schema from './schema'
import { MAX_MODELS_PER_SESSION, MIN_MODELS_PER_SESSION } from '../shared/arena'

const modules = import.meta.glob('./**/*.ts')

const adminIdentity = {
  issuer: 'https://placeholder.clerk.accounts.dev',
  subject: 'admin_voting',
  tokenIdentifier: 'test|admin_voting',
  email: 'radupopa028@gmail.com',
  name: 'Voting Admin',
}

afterEach(() => {
  vi.useRealTimers()
})

async function bootSessionWithTopic() {
  const t = convexTest({ schema, modules })
  const admin = t.withIdentity(adminIdentity)

  const created = await admin.mutation(api.sessions.create, {
    title: 'Voting Test',
    theme: 'debate',
    roundCount: 1,
    modelKeys: ['openai-gpt5', 'anthropic-claude-sonnet-4'],
    maxParticipants: 20,
  })
  await admin.mutation(api.sessions.start, { sessionId: created.sessionId })

  const guest = await t.mutation(api.sessions.joinBySlug, {
    slug: created.slug,
    displayName: 'Voter One',
    email: null,
    existingToken: null,
  })

  return { t, admin, created, guest }
}

describe('voting', () => {
  test('a guest cannot vote before voting opens', async () => {
    const { t, created, guest } = await bootSessionWithTopic()

    const view = await t.query(api.sessions.getPublicSessionView, {
      slug: created.slug,
      participantToken: guest.accessToken,
    })

    expect(view).not.toBeNull()
    expect(view?.currentRound?.status).toBe('generating')

    // There are no responses yet so vote attempts reference a missing doc
    // and must be rejected.
    const firstResponse = view?.currentRound?.responses[0]
    if (firstResponse) {
      await expect(
        t.mutation(api.votes.castHumanVote, {
          slug: created.slug,
          participantToken: guest.accessToken,
          responseId: firstResponse.id,
        }),
      ).rejects.toThrow()
    }
  })

  test('cannot submit a topic after the admin prompt is locked', async () => {
    const { t, created, guest } = await bootSessionWithTopic()

    await expect(
      t.mutation(api.rounds.submitTopic, {
        slug: created.slug,
        participantToken: guest.accessToken,
        topic: 'A second topic should not be accepted.',
      }),
    ).rejects.toThrow()
  })

  test('topic submission is closed once the admin starts the match', async () => {
    const t = convexTest({ schema, modules })
    const admin = t.withIdentity(adminIdentity)
    const created = await admin.mutation(api.sessions.create, {
      title: 'Validation Test',
      theme: 'freeform',
      roundCount: 1,
      modelKeys: ['openai-gpt5', 'google-gemini-31-pro'],
      maxParticipants: 10,
    })
    await admin.mutation(api.sessions.start, { sessionId: created.sessionId })
    const guest = await t.mutation(api.sessions.joinBySlug, {
      slug: created.slug,
      displayName: 'Short Topic',
      email: null,
      existingToken: null,
    })

    await expect(
      t.mutation(api.rounds.submitTopic, {
        slug: created.slug,
        participantToken: guest.accessToken,
        topic: 'This should not be accepted.',
      }),
    ).rejects.toThrow('already has a locked topic')
  })

  test('multiple guests can vote concurrently and the admin controls round progression', async () => {
    vi.useFakeTimers()
    const { t, admin, created, guest } = await bootSessionWithTopic()
    const guestTwo = await t.mutation(api.sessions.joinBySlug, {
      slug: created.slug,
      displayName: 'Voter Two',
      email: null,
      existingToken: null,
    })
    const responses = await t.run(async (ctx) => {
      return await ctx.db
        .query('roundResponses')
        .withIndex('by_round_id_and_anonymized_slot')
        .take(2)
    })
    const roundId = responses[0]?.roundId
    expect(roundId).toBeDefined()
    expect(responses).toHaveLength(2)

    for (const response of responses) {
      await t.mutation(internal.state.saveModelResponse, {
        sessionId: created.sessionId,
        roundId: response.roundId,
        modelKey: response.modelKey,
        status: 'success',
        responseText: `Successful response from ${response.modelKey}`,
        latencyMs: 10,
        tokenUsageInput: 20,
        tokenUsageOutput: 10,
        errorCode: null,
        errorMessage: null,
      })
    }
    await t.mutation(internal.state.openVoting, {
      sessionId: created.sessionId,
      roundId,
    })

    const [firstVote, secondVote] = await Promise.all([
      t.mutation(api.votes.castHumanVote, {
        slug: created.slug,
        participantToken: guest.accessToken,
        responseId: responses[0]._id,
      }),
      t.mutation(api.votes.castHumanVote, {
        slug: created.slug,
        participantToken: guestTwo.accessToken,
        responseId: responses[0]._id,
      }),
    ])
    expect(firstVote.accepted).toBe(true)
    expect(secondVote.accepted).toBe(true)

    const votingView = await t.query(api.sessions.getPublicSessionView, {
      slug: created.slug,
      participantToken: guest.accessToken,
    })
    expect(votingView?.currentRound?.status).toBe('voting')
    expect(votingView?.currentRound?.votingEndsAt).toBeNull()
    expect(votingView?.viewer?.hasVotedCurrentRound).toBe(true)

    await admin.mutation(api.rounds.endVotingEarly, {
      sessionId: created.sessionId,
    })
    await t.mutation(internal.state.saveArtifact, {
      sessionId: created.sessionId,
      roundId,
      type: 'critic_analysis',
      status: 'success',
      content: 'Hidden winner analysis.',
      modelId: 'test-critic',
      failureReason: null,
    })
    const scoredView = await t.query(api.sessions.getPublicSessionView, {
      slug: created.slug,
      participantToken: guest.accessToken,
    })
    expect(scoredView?.currentRound?.status).toBe('scored')
    expect(scoredView?.currentRound?.totals.humanVotes).toBe(2)
    expect(scoredView?.currentRound?.responses[0]?.label).toBeNull()
    expect(scoredView?.currentRound?.artifacts.criticAnalysis).toBeNull()
    expect(scoredView?.scoreboard).toHaveLength(0)
    expect(scoredView?.session).not.toHaveProperty('selectedModels')

    await admin.mutation(api.rounds.revealLatestScoredRound, {
      sessionId: created.sessionId,
    })
    const revealedView = await t.query(api.sessions.getPublicSessionView, {
      slug: created.slug,
      participantToken: guest.accessToken,
    })
    expect(
      revealedView?.currentRound?.responses.every(
        (response) => response.label !== null,
      ),
    ).toBe(true)
    expect(revealedView?.currentRound?.artifacts.criticAnalysis).toBe(
      'Hidden winner analysis.',
    )
    expect(revealedView?.scoreboard).not.toHaveLength(0)
  })

  test('a stale timer cannot close a generating round', async () => {
    const { t, created } = await bootSessionWithTopic()
    const responses = await t.run(async (ctx) => {
      return await ctx.db
        .query('roundResponses')
        .withIndex('by_round_id_and_anonymized_slot')
        .take(2)
    })

    const result = await t.mutation(internal.state.finalizeRound, {
      sessionId: created.sessionId,
      roundId: responses[0].roundId,
      triggeredBy: 'timer',
    })
    const view = await t.query(api.sessions.getPublicSessionView, {
      slug: created.slug,
      participantToken: null,
    })

    expect(result).toBeNull()
    expect(view?.currentRound?.status).toBe('generating')
  })
})

describe('session state machine', () => {
  test('only waiting sessions can be started', async () => {
    const t = convexTest({ schema, modules })
    const admin = t.withIdentity(adminIdentity)
    const created = await admin.mutation(api.sessions.create, {
      title: 'Start Twice',
      theme: 'comedy',
      roundCount: 1,
      modelKeys: ['openai-gpt5', 'google-gemini-31-pro'],
      maxParticipants: 5,
    })
    await admin.mutation(api.sessions.start, { sessionId: created.sessionId })
    await expect(
      admin.mutation(api.sessions.start, { sessionId: created.sessionId }),
    ).rejects.toThrow('Only waiting sessions')
  })

  test('stopping a session marks it stopped', async () => {
    const t = convexTest({ schema, modules })
    const admin = t.withIdentity(adminIdentity)
    const created = await admin.mutation(api.sessions.create, {
      title: 'Stop Me',
      theme: 'eli5',
      roundCount: 2,
      modelKeys: ['openai-gpt5', 'anthropic-claude-sonnet-4'],
      maxParticipants: 10,
    })
    await admin.mutation(api.sessions.start, { sessionId: created.sessionId })
    await admin.mutation(api.sessions.stop, { sessionId: created.sessionId })

    const view = await t.query(api.sessions.getPublicSessionView, {
      slug: created.slug,
      participantToken: null,
    })
    expect(view?.session.status).toBe('stopped')
  })

  test('create rejects invalid round count', async () => {
    const t = convexTest({ schema, modules })
    const admin = t.withIdentity(adminIdentity)
    await expect(
      admin.mutation(api.sessions.create, {
        title: 'Too Many Rounds',
        theme: 'comedy',
        roundCount: 99,
        modelKeys: ['openai-gpt5', 'google-gemini-31-pro'],
        maxParticipants: 10,
      }),
    ).rejects.toThrow()
  })

  test('create rejects fewer than two models', async () => {
    const t = convexTest({ schema, modules })
    const admin = t.withIdentity(adminIdentity)
    await expect(
      admin.mutation(api.sessions.create, {
        title: 'Single Model',
        theme: 'comedy',
        roundCount: 1,
        modelKeys: ['openai-gpt5'],
        maxParticipants: 10,
      }),
    ).rejects.toThrow(
      `between ${MIN_MODELS_PER_SESSION} and ${MAX_MODELS_PER_SESSION}`,
    )
  })

  test('the admin starts the next round explicitly after scoring', async () => {
    vi.useFakeTimers()
    const t = convexTest({ schema, modules })
    const admin = t.withIdentity(adminIdentity)
    const created = await admin.mutation(api.sessions.create, {
      title: 'Manual Round Progression',
      theme: 'comedy',
      roundCount: 2,
      modelKeys: ['openai-gpt5', 'google-gemini-31-pro'],
      maxParticipants: 10,
    })
    await admin.mutation(api.sessions.start, { sessionId: created.sessionId })
    const responses = await t.run(async (ctx) => {
      return await ctx.db
        .query('roundResponses')
        .withIndex('by_round_id_and_anonymized_slot')
        .take(2)
    })

    await t.mutation(internal.state.finalizeRound, {
      sessionId: created.sessionId,
      roundId: responses[0].roundId,
      triggeredBy: 'system',
    })
    const beforeStart = await admin.query(api.sessions.getAdminSession, {
      sessionId: created.sessionId,
    })
    expect(beforeStart?.currentRoundNumber).toBe(1)
    expect(beforeStart?.currentRoundStatus).toBe('aborted')
    expect(beforeStart?.canStartNextRound).toBe(true)

    await admin.mutation(api.rounds.startNextRound, {
      sessionId: created.sessionId,
    })
    const afterStart = await admin.query(api.sessions.getAdminSession, {
      sessionId: created.sessionId,
    })
    expect(afterStart?.currentRoundNumber).toBe(2)
    expect(afterStart?.currentRoundStatus).toBe('generating')
  })

  test('the admin reveals a scored round before starting the next one', async () => {
    vi.useFakeTimers()
    const t = convexTest({ schema, modules })
    const admin = t.withIdentity(adminIdentity)
    const created = await admin.mutation(api.sessions.create, {
      title: 'Reveal Before Next Round',
      theme: 'comedy',
      roundCount: 2,
      modelKeys: ['openai-gpt5', 'google-gemini-31-pro'],
      maxParticipants: 10,
    })
    await admin.mutation(api.sessions.start, { sessionId: created.sessionId })
    const responses = await t.run(async (ctx) => {
      return await ctx.db
        .query('roundResponses')
        .withIndex('by_round_id_and_anonymized_slot')
        .take(2)
    })
    for (const response of responses) {
      await t.mutation(internal.state.saveModelResponse, {
        sessionId: created.sessionId,
        roundId: response.roundId,
        modelKey: response.modelKey,
        status: 'success',
        responseText: `Successful response from ${response.modelKey}`,
        latencyMs: 10,
        tokenUsageInput: 20,
        tokenUsageOutput: 10,
        errorCode: null,
        errorMessage: null,
      })
    }
    await t.mutation(internal.state.openVoting, {
      sessionId: created.sessionId,
      roundId: responses[0].roundId,
    })
    await admin.mutation(api.rounds.endVotingEarly, {
      sessionId: created.sessionId,
    })

    const beforeReveal = await admin.query(api.sessions.getAdminSession, {
      sessionId: created.sessionId,
    })
    expect(beforeReveal?.canStartNextRound).toBe(false)
    await expect(
      admin.mutation(api.rounds.startNextRound, {
        sessionId: created.sessionId,
      }),
    ).rejects.toThrow('Reveal the current round')

    await admin.mutation(api.rounds.revealLatestScoredRound, {
      sessionId: created.sessionId,
    })
    const afterReveal = await admin.query(api.sessions.getAdminSession, {
      sessionId: created.sessionId,
    })
    expect(afterReveal?.canStartNextRound).toBe(true)
  })

  test('create rejects duplicate model selections', async () => {
    const t = convexTest({ schema, modules })
    const admin = t.withIdentity(adminIdentity)
    await expect(
      admin.mutation(api.sessions.create, {
        title: 'Duplicate Models',
        theme: 'comedy',
        roundCount: 1,
        modelKeys: ['openai-gpt5', 'openai-gpt5'],
        maxParticipants: 10,
      }),
    ).rejects.toThrow('Pick each model once')
  })

  test('scoring includes every vote above the previous 512 ballot limit', async () => {
    vi.useFakeTimers()
    const t = convexTest({ schema, modules })
    const admin = t.withIdentity(adminIdentity)
    const created = await admin.mutation(api.sessions.create, {
      title: 'Large Vote Tally',
      theme: 'comedy',
      roundCount: 1,
      modelKeys: ['openai-gpt5', 'google-gemini-31-pro'],
      maxParticipants: 600,
    })
    await admin.mutation(api.sessions.start, { sessionId: created.sessionId })
    const responses = await t.run(async (ctx) => {
      return await ctx.db
        .query('roundResponses')
        .withIndex('by_round_id_and_anonymized_slot')
        .take(2)
    })
    for (const response of responses) {
      await t.mutation(internal.state.saveModelResponse, {
        sessionId: created.sessionId,
        roundId: response.roundId,
        modelKey: response.modelKey,
        status: 'success',
        responseText: `Successful response from ${response.modelKey}`,
        latencyMs: 10,
        tokenUsageInput: 20,
        tokenUsageOutput: 10,
        errorCode: null,
        errorMessage: null,
      })
    }
    await t.mutation(internal.state.openVoting, {
      sessionId: created.sessionId,
      roundId: responses[0].roundId,
    })
    await t.run(async (ctx) => {
      for (let index = 0; index < 513; index += 1) {
        const participantId = await ctx.db.insert('sessionParticipants', {
          sessionId: created.sessionId,
          kind: 'guest',
          displayName: `Voter ${index}`,
          email: null,
          clerkTokenIdentifier: null,
          accessTokenHash: `hash-${index}`,
          joinedAt: index,
          lastSeenAt: index,
        })
        await ctx.db.insert('roundVotes', {
          roundId: responses[0].roundId,
          participantId,
          responseId: responses[1]._id,
          source: 'human',
          createdAt: index,
        })
      }
    })

    await admin.mutation(api.rounds.endVotingEarly, {
      sessionId: created.sessionId,
    })
    await admin.mutation(api.rounds.revealLatestScoredRound, {
      sessionId: created.sessionId,
    })
    const view = await t.query(api.sessions.getPublicSessionView, {
      slug: created.slug,
      participantToken: null,
    })

    expect(view?.currentRound?.totals.humanVotes).toBe(513)
    expect(
      view?.currentRound?.responses.find(
        (response) => response.id === responses[1]._id,
      )?.votes,
    ).toBe(513)
  })
})

describe('public leaderboard', () => {
  test('returns empty stats when no sessions exist', async () => {
    const t = convexTest({ schema, modules })
    const board = await t.query(api.stats.getModelLeaderboard, {})
    expect(board.rows).toHaveLength(0)
    expect(board.sessionsIncluded).toBe(0)
  })

  test('lists no completed sessions when no sessions exist', async () => {
    const t = convexTest({ schema, modules })
    const data = await t.query(api.stats.listCompletedSessions, { limit: 10 })
    expect(data.rows).toHaveLength(0)
  })
})
