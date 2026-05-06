/// <reference types="vite/client" />
// @vitest-environment edge-runtime

import { convexTest } from 'convex-test'
import { describe, expect, test } from 'vitest'
import { api } from './_generated/api'
import schema from './schema'

const modules = import.meta.glob('./**/*.ts')

const bootstrapAdminIdentity = {
  issuer: 'https://placeholder.clerk.accounts.dev',
  subject: 'admin_bootstrap',
  tokenIdentifier: 'test|admin_bootstrap',
  email: 'radupopa028@gmail.com',
  name: 'Radu Popa',
}

const teammateIdentity = {
  issuer: 'https://placeholder.clerk.accounts.dev',
  subject: 'admin_teammate',
  tokenIdentifier: 'test|admin_teammate',
  email: 'teammate@example.com',
  name: 'Team Mate',
}

describe('admin access control', () => {
  test('bootstrap admin can grant admin access by email', async () => {
    const t = convexTest({ schema, modules })
    const bootstrapAdmin = t.withIdentity(bootstrapAdminIdentity)

    const granted = await bootstrapAdmin.mutation(api.admins.grant, {
      email: 'TEAMMATE@example.com',
    })

    expect(granted).toMatchObject({
      ok: true,
      email: 'teammate@example.com',
      alreadyAdmin: false,
    })

    const teammate = t.withIdentity(teammateIdentity)
    const list = await teammate.query(api.admins.list, {})

    expect(list.isAuthenticated).toBe(true)
    expect(list.admins.map((admin) => admin.email)).toContain(
      'teammate@example.com',
    )
  })

  test('non-admin users cannot create sessions', async () => {
    const t = convexTest({ schema, modules })
    const teammate = t.withIdentity(teammateIdentity)

    await expect(
      teammate.mutation(api.sessions.create, {
        title: 'Unauthorized Arena',
        theme: 'comedy',
        roundCount: 1,
        modelKeys: ['openai-gpt5', 'google-gemini-3-flash'],
        maxParticipants: 20,
      }),
    ).rejects.toThrow('not an admin')
  })
})
