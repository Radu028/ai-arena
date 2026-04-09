/// <reference types="vite/client" />
// @vitest-environment edge-runtime

import { convexTest } from 'convex-test'
import { describe, expect, test } from 'vitest'
import { api } from './_generated/api'
import schema from './schema'

const modules = import.meta.glob('./**/*.ts')

const adminIdentity = {
  issuer: 'https://placeholder.clerk.accounts.dev',
  subject: 'admin_1',
  tokenIdentifier: 'test|admin_1',
  email: 'admin@example.com',
  name: 'Arena Admin',
}

describe('sessions flow', () => {
  test('admin can create and start a waiting session', async () => {
    const t = convexTest({ schema, modules })
    const admin = t.withIdentity(adminIdentity)

    const created = await admin.mutation(api.sessions.create, {
      title: 'Arena Prime',
      theme: 'comedy',
      roundCount: 3,
      modelKeys: [
        'openai-gpt5',
        'anthropic-claude-sonnet-4',
        'google-gemini-25-pro',
      ],
      maxParticipants: 50,
    })

    const waitingView = await t.query(api.sessions.getPublicSessionView, {
      slug: created.slug,
      participantToken: null,
    })

    expect(waitingView?.session.status).toBe('waiting')
    expect(waitingView?.session.joinCode).toHaveLength(6)

    await admin.mutation(api.sessions.start, {
      sessionId: created.sessionId,
    })

    const liveView = await t.query(api.sessions.getPublicSessionView, {
      slug: created.slug,
      participantToken: null,
    })

    expect(liveView?.session.status).toBe('active')
    expect(liveView?.currentRound?.status).toBe('collecting_topic')
  })

  test('the first submitted topic locks the round', async () => {
    const t = convexTest({ schema, modules })
    const admin = t.withIdentity(adminIdentity)

    const created = await admin.mutation(api.sessions.create, {
      title: 'Topic Lock Test',
      theme: 'eli5',
      roundCount: 2,
      modelKeys: ['openai-gpt5', 'mistral-large'],
      maxParticipants: 20,
    })

    await admin.mutation(api.sessions.start, {
      sessionId: created.sessionId,
    })

    const guestOne = await t.mutation(api.sessions.joinBySlug, {
      slug: created.slug,
      displayName: 'Radu',
      email: null,
      existingToken: null,
    })

    const guestTwo = await t.mutation(api.sessions.joinBySlug, {
      slug: created.slug,
      displayName: 'Mara',
      email: null,
      existingToken: null,
    })

    await t.mutation(api.rounds.submitTopic, {
      slug: created.slug,
      participantToken: guestOne.accessToken,
      topic: 'Explain version control like I am five.',
    })

    await expect(
      t.mutation(api.rounds.submitTopic, {
        slug: created.slug,
        participantToken: guestTwo.accessToken,
        topic: 'This should not win.',
      }),
    ).rejects.toThrow('already has a locked topic')

    const liveView = await t.query(api.sessions.getPublicSessionView, {
      slug: created.slug,
      participantToken: guestOne.accessToken,
    })

    expect(liveView?.currentRound?.topic).toBe(
      'Explain version control like I am five.',
    )
    expect(liveView?.currentRound?.status).toBe('generating')
  })
})
