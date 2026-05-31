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

const bootstrapAdminPreferredUsernameIdentity = {
  issuer: 'https://placeholder.clerk.accounts.dev',
  subject: 'admin_bootstrap_google',
  tokenIdentifier: 'test|admin_bootstrap_google',
  preferredUsername: 'radupopa028@gmail.com',
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
  test('bootstrap Google admin has access without a stored admin row', async () => {
    const t = convexTest({ schema, modules })
    const bootstrapAdmin = t.withIdentity(bootstrapAdminIdentity)

    const list = await bootstrapAdmin.query(api.admins.list, {})

    expect(list.isAuthenticated).toBe(true)
    expect(list.viewerEmail).toBe('radupopa028@gmail.com')
    expect(list.bootstrapAdmins).toContain('radupopa028@gmail.com')
  })

  test('bootstrap admin also works when Clerk maps email as preferred username', async () => {
    const t = convexTest({ schema, modules })
    const bootstrapAdmin = t.withIdentity(
      bootstrapAdminPreferredUsernameIdentity,
    )

    const list = await bootstrapAdmin.query(api.admins.list, {})

    expect(list.isAuthenticated).toBe(true)
    expect(list.viewerEmail).toBe('radupopa028@gmail.com')
  })

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

  test('bootstrap admin grant is always treated as already active', async () => {
    const t = convexTest({ schema, modules })
    const bootstrapAdmin = t.withIdentity(bootstrapAdminIdentity)

    const granted = await bootstrapAdmin.mutation(api.admins.grant, {
      email: 'RADUPOPA028@gmail.com',
    })
    const list = await bootstrapAdmin.query(api.admins.list, {})

    expect(granted).toMatchObject({
      ok: true,
      email: 'radupopa028@gmail.com',
      alreadyAdmin: true,
    })
    expect(list.admins.map((admin) => admin.email)).not.toContain(
      'radupopa028@gmail.com',
    )
    expect(list.bootstrapAdmins).toContain('radupopa028@gmail.com')
  })

  test('admins can remove granted admins but not the bootstrap admin', async () => {
    const t = convexTest({ schema, modules })
    const bootstrapAdmin = t.withIdentity(bootstrapAdminIdentity)

    await bootstrapAdmin.mutation(api.admins.grant, {
      email: 'teammate@example.com',
    })
    await bootstrapAdmin.mutation(api.admins.revoke, {
      email: 'teammate@example.com',
    })

    const teammate = t.withIdentity(teammateIdentity)
    const teammateList = await teammate.query(api.admins.list, {})
    expect(teammateList.isAuthenticated).toBe(false)

    await expect(
      bootstrapAdmin.mutation(api.admins.revoke, {
        email: 'radupopa028@gmail.com',
      }),
    ).rejects.toThrow('bootstrap admin cannot be removed')
  })

  test('non-admin users cannot create sessions', async () => {
    const t = convexTest({ schema, modules })
    const teammate = t.withIdentity(teammateIdentity)

    await expect(
      teammate.mutation(api.sessions.create, {
        title: 'Unauthorized Arena',
        theme: 'comedy',
        roundCount: 1,
        modelKeys: ['openai-gpt5', 'google-gemini-35-flash'],
        maxParticipants: 20,
      }),
    ).rejects.toThrow('not an admin')
  })

  test('non-admin users cannot grant admin access', async () => {
    const t = convexTest({ schema, modules })
    const teammate = t.withIdentity(teammateIdentity)

    await expect(
      teammate.mutation(api.admins.grant, {
        email: 'another@example.com',
      }),
    ).rejects.toThrow('not an admin')
  })

  test('non-admin users cannot remove admin access', async () => {
    const t = convexTest({ schema, modules })
    const teammate = t.withIdentity(teammateIdentity)

    await expect(
      teammate.mutation(api.admins.revoke, {
        email: 'another@example.com',
      }),
    ).rejects.toThrow('not an admin')
  })
})
