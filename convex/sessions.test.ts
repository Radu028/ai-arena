/// <reference types="vite/client" />
// @vitest-environment edge-runtime

import { convexTest } from 'convex-test'
import { describe, expect, test } from 'vitest'
import { api, internal } from './_generated/api'
import schema from './schema'

const modules = import.meta.glob('./**/*.ts')

const adminIdentity = {
  issuer: 'https://placeholder.clerk.accounts.dev',
  subject: 'admin_1',
  tokenIdentifier: 'test|admin_1',
  email: 'radupopa028@gmail.com',
  name: 'Arena Admin',
}

describe('sessions flow', () => {
  test('admin can create and start a waiting session', async () => {
    const t = convexTest({ schema, modules })
    const admin = t.withIdentity(adminIdentity)

    const created = await admin.mutation(api.sessions.create, {
      title: 'Arena Prime',
      theme: 'comedy',
      customPrompt: 'Make jokes about final exams and student life.',
      responseLanguage: 'romanian',
      roundCount: 3,
      modelKeys: [
        'openai-gpt5',
        'anthropic-claude-sonnet-4',
        'google-gemini-35-flash',
      ],
      maxParticipants: 50,
    })

    const waitingView = await t.query(api.sessions.getPublicSessionView, {
      slug: created.slug,
      participantToken: null,
    })

    expect(waitingView?.session.status).toBe('waiting')
    expect(waitingView?.session.joinCode).toHaveLength(6)
    expect(waitingView?.session.customPrompt).toBe(
      'Make jokes about final exams and student life.',
    )
    expect(waitingView?.session.responseLanguage).toBe('romanian')
    expect(waitingView?.session.responseLanguageLabel).toBe('Romana')

    await admin.mutation(api.sessions.start, {
      sessionId: created.sessionId,
    })

    const liveView = await t.query(api.sessions.getPublicSessionView, {
      slug: created.slug,
      participantToken: null,
    })

    expect(liveView?.session.status).toBe('active')
    expect(liveView?.currentRound?.status).toBe('generating')
    expect(liveView?.currentRound?.topic).toBe(
      'Make jokes about final exams and student life.',
    )
  })

  test('admin can schedule a session start time', async () => {
    const t = convexTest({ schema, modules })
    const admin = t.withIdentity(adminIdentity)
    const scheduledStartAt = Date.now() + 60_000

    const created = await admin.mutation(api.sessions.create, {
      title: 'Scheduled Arena',
      theme: 'comedy',
      customPrompt: 'Make jokes about launch timing.',
      responseLanguage: 'english',
      roundCount: 2,
      scheduledStartAt,
      modelKeys: ['openai-gpt5', 'google-gemini-31-pro'],
      maxParticipants: 20,
    })

    const waitingView = await admin.query(api.sessions.getAdminSession, {
      sessionId: created.sessionId,
    })
    expect(waitingView?.status).toBe('waiting')
    expect(waitingView?.scheduledStartAt).toBe(scheduledStartAt)

    await t.mutation(internal.sessionStart.startScheduled, {
      sessionId: created.sessionId,
      scheduledStartAt,
    })

    const liveView = await t.query(api.sessions.getPublicSessionView, {
      slug: created.slug,
      participantToken: null,
    })
    expect(liveView?.session.status).toBe('active')
    expect(liveView?.session.scheduledStartAt).toBeNull()
    expect(liveView?.currentRound?.status).toBe('generating')
  })

  test('starting a session locks the admin prompt for the round', async () => {
    const t = convexTest({ schema, modules })
    const admin = t.withIdentity(adminIdentity)

    const created = await admin.mutation(api.sessions.create, {
      title: 'Topic Lock Test',
      theme: 'eli5',
      roundCount: 2,
      modelKeys: ['openai-gpt5', 'google-gemini-31-pro'],
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

    await expect(
      t.mutation(api.rounds.submitTopic, {
        slug: created.slug,
        participantToken: guestOne.accessToken,
        topic: 'This should not win.',
      }),
    ).rejects.toThrow('already has a locked topic')

    const liveView = await t.query(api.sessions.getPublicSessionView, {
      slug: created.slug,
      participantToken: guestOne.accessToken,
    })

    expect(liveView?.currentRound?.topic).toBe('Topic Lock Test')
    expect(liveView?.currentRound?.status).not.toBe('collecting_topic')
  })

  test('blank display names fall back to an auto-generated participant name', async () => {
    const t = convexTest({ schema, modules })
    const admin = t.withIdentity(adminIdentity)

    const created = await admin.mutation(api.sessions.create, {
      title: 'Auto Name Test',
      theme: 'freeform',
      roundCount: 1,
      modelKeys: ['openai-gpt5', 'google-gemini-31-pro'],
      maxParticipants: 20,
    })

    const joined = await t.mutation(api.sessions.joinBySlug, {
      slug: created.slug,
      displayName: '   ',
      email: null,
      existingToken: null,
    })

    expect(joined.displayName).toMatch(/^[A-Z][a-z]+ [A-Z][a-z]+$/)
  })

  test('joining again with the same Clerk identity reuses the same participant', async () => {
    const t = convexTest({ schema, modules })
    const admin = t.withIdentity(adminIdentity)

    const created = await admin.mutation(api.sessions.create, {
      title: 'Identity Rejoin Test',
      theme: 'debate',
      roundCount: 1,
      modelKeys: ['openai-gpt5', 'anthropic-claude-sonnet-4'],
      maxParticipants: 20,
    })

    const firstJoin = await admin.mutation(api.sessions.joinBySlug, {
      slug: created.slug,
      displayName: 'Arena Admin',
      email: null,
      existingToken: null,
    })

    const secondJoin = await admin.mutation(api.sessions.joinBySlug, {
      slug: created.slug,
      displayName: 'Arena Admin Updated',
      email: 'radupopa028@gmail.com',
      existingToken: null,
    })

    expect(secondJoin.participantId).toBe(firstJoin.participantId)
    expect(secondJoin.accessToken).not.toBe(firstJoin.accessToken)

    const sessionView = await admin.query(api.sessions.getPublicSessionView, {
      slug: created.slug,
      participantToken: secondJoin.accessToken,
    })

    expect(sessionView?.viewer?.displayName).toBe('Arena Admin Updated')
  })

  test('an authenticated rejoin cannot claim another participant token', async () => {
    const t = convexTest({ schema, modules })
    const admin = t.withIdentity(adminIdentity)
    const created = await admin.mutation(api.sessions.create, {
      title: 'Identity Collision Test',
      theme: 'debate',
      roundCount: 1,
      modelKeys: ['openai-gpt5', 'anthropic-claude-sonnet-4'],
      maxParticipants: 20,
    })
    await admin.mutation(api.sessions.joinBySlug, {
      slug: created.slug,
      displayName: 'Arena Admin',
      email: null,
      existingToken: null,
    })
    const guestJoin = await t.mutation(api.sessions.joinBySlug, {
      slug: created.slug,
      displayName: 'Guest',
      email: null,
      existingToken: null,
    })

    await expect(
      admin.mutation(api.sessions.joinBySlug, {
        slug: created.slug,
        displayName: 'Arena Admin',
        email: null,
        existingToken: guestJoin.accessToken,
      }),
    ).rejects.toThrow('belongs to a different seat')
  })
})
