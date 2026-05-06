import { query, mutation } from './_generated/server'
import { v } from 'convex/values'
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
