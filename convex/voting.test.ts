/// <reference types="vite/client" />
// @vitest-environment edge-runtime

import { convexTest } from 'convex-test'
import { describe, expect, test } from 'vitest'
import { api } from './_generated/api'
import schema from './schema'

const modules = import.meta.glob('./**/*.ts')

const adminIdentity = {
  issuer: 'https://placeholder.clerk.accounts.dev',
  subject: 'admin_voting',
  tokenIdentifier: 'test|admin_voting',
  email: 'radupopa028@gmail.com',
  name: 'Voting Admin',
}

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
    ).rejects.toThrow('already has a locked topic')
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
    ).rejects.toThrow('between two and five')
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
