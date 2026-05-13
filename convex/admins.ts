import { action, internalQuery, query, mutation } from './_generated/server'
import { v } from 'convex/values'
import { internal } from './_generated/api'
import { getIdentityEmail, now, requireAdminIdentity } from './lib'

function normalizeEmail(email: string) {
  const normalized = email.trim().toLowerCase()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
    throw new Error('Enter a valid admin email.')
  }
  return normalized
}

export const list = query({
  args: {},
  handler: async (ctx) => {
    let identity: Awaited<ReturnType<typeof requireAdminIdentity>>
    try {
      identity = await requireAdminIdentity(ctx)
    } catch {
      return {
        isAuthenticated: false,
        viewerEmail: null,
        bootstrapAdmins: ['radupopa028@gmail.com'],
        admins: [],
      }
    }
    const admins = await ctx.db.query('adminUsers').take(200)
    const viewerEmail = getIdentityEmail(identity)
    return {
      isAuthenticated: true,
      viewerEmail,
      bootstrapAdmins: ['radupopa028@gmail.com'],
      admins: admins
        .filter((admin) => admin.revokedAt === null)
        .sort((left, right) => left.email.localeCompare(right.email))
        .map((admin) => ({
          id: admin._id,
          email: admin.email,
          grantedByEmail: admin.grantedByEmail,
          createdAt: admin.createdAt,
        })),
    }
  },
})

export const requireAdminForAction = internalQuery({
  args: {},
  handler: async (ctx) => {
    const identity = await requireAdminIdentity(ctx)
    return {
      viewerEmail: getIdentityEmail(identity),
    }
  },
})

export const listSignedUpUsers = action({
  args: {
    query: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await ctx.runQuery(internal.admins.requireAdminForAction, {})

    const secretKey = process.env.CLERK_SECRET_KEY
    if (!secretKey) {
      throw new Error('CLERK_SECRET_KEY is not configured in Convex.')
    }

    const limit = Math.max(1, Math.min(100, Math.floor(args.limit ?? 50)))
    const search = args.query?.trim()
    const url = new URL('https://api.clerk.com/v1/users')
    url.searchParams.set('limit', String(limit))
    url.searchParams.set('order_by', '-created_at')
    if (search) {
      url.searchParams.set('query', search)
    }

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${secretKey}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const body = await response.text()
      throw new Error(
        `Could not load Clerk users (${response.status}). ${body.slice(0, 240)}`,
      )
    }

    const payload: unknown = await response.json()
    const { users, totalCount } = parseClerkUsersPayload(payload)

    return {
      query: search ?? '',
      totalCount,
      users: users.map(formatClerkUser).filter(hasEmail),
    }
  },
})

export const grant = mutation({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await requireAdminIdentity(ctx)
    const email = normalizeEmail(args.email)
    const existing = await ctx.db
      .query('adminUsers')
      .withIndex('by_email', (q) => q.eq('email', email))
      .unique()

    if (existing) {
      if (existing.revokedAt === null) {
        return { ok: true, email, alreadyAdmin: true }
      }
      await ctx.db.patch(existing._id, {
        grantedByIdentity: identity.tokenIdentifier,
        grantedByEmail: getIdentityEmail(identity),
        revokedAt: null,
        createdAt: now(),
      })
      return { ok: true, email, alreadyAdmin: false }
    }

    await ctx.db.insert('adminUsers', {
      email,
      grantedByIdentity: identity.tokenIdentifier,
      grantedByEmail: getIdentityEmail(identity),
      createdAt: now(),
      revokedAt: null,
    })
    return { ok: true, email, alreadyAdmin: false }
  },
})

type ClerkUsersPayload = {
  data?: unknown
  total_count?: unknown
}

type ClerkUserPayload = {
  id?: unknown
  first_name?: unknown
  last_name?: unknown
  username?: unknown
  image_url?: unknown
  created_at?: unknown
  last_sign_in_at?: unknown
  primary_email_address_id?: unknown
  email_addresses?: unknown
}

type ClerkEmailAddressPayload = {
  id?: unknown
  email_address?: unknown
}

function parseClerkUsersPayload(payload: unknown) {
  if (Array.isArray(payload)) {
    return { users: payload as ClerkUserPayload[], totalCount: payload.length }
  }

  if (payload && typeof payload === 'object') {
    const candidate = payload as ClerkUsersPayload
    const users = Array.isArray(candidate.data)
      ? (candidate.data as ClerkUserPayload[])
      : []
    const totalCount =
      typeof candidate.total_count === 'number'
        ? candidate.total_count
        : users.length
    return { users, totalCount }
  }

  return { users: [], totalCount: 0 }
}

function formatClerkUser(user: ClerkUserPayload) {
  const email = getPrimaryEmail(user)
  const firstName = asString(user.first_name)
  const lastName = asString(user.last_name)
  const fullName = [firstName, lastName].filter(Boolean).join(' ')
  const username = asString(user.username)

  return {
    id: asString(user.id) ?? '',
    name: fullName || username || email || 'Unknown user',
    email,
    imageUrl: asString(user.image_url),
    createdAt: asNumber(user.created_at),
    lastSignInAt: asNumber(user.last_sign_in_at),
  }
}

function hasEmail(
  user: ReturnType<typeof formatClerkUser>,
): user is ReturnType<typeof formatClerkUser> & { email: string } {
  return user.email !== null
}

function getPrimaryEmail(user: ClerkUserPayload) {
  const emailAddresses = Array.isArray(user.email_addresses)
    ? (user.email_addresses as ClerkEmailAddressPayload[])
    : []
  if (emailAddresses.length === 0) {
    return null
  }
  const primaryEmailId = asString(user.primary_email_address_id)
  const primaryEmail =
    emailAddresses.find((email) => asString(email.id) === primaryEmailId) ??
    emailAddresses[0]
  return asString(primaryEmail.email_address)
}

function asString(value: unknown) {
  return typeof value === 'string' && value.trim() ? value : null
}

function asNumber(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}
