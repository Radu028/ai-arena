import type { MutationCtx, QueryCtx } from './_generated/server'
import type { Doc, Id } from './_generated/dataModel'
import {
  DEFAULT_MAX_PARTICIPANTS,
  DEFAULT_SESSION_TITLE,
  DEFAULT_VOTING_WINDOW_SECONDS,
  getModelByKey,
  getRoundSlotLabel,
  resolveModelSnapshots,
} from '../shared/arena'
import type { SessionModelSnapshot } from '../shared/arena'

const RANDOM_ALPHABET = 'abcdefghjkmnpqrstuvwxyz23456789'
const JOIN_CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
const DISPLAY_ADJECTIVES = [
  'Bright',
  'Rapid',
  'Curious',
  'Electric',
  'Clever',
  'Velvet',
  'Golden',
  'Neon',
]
const DISPLAY_NOUNS = [
  'Comet',
  'Otter',
  'Falcon',
  'Echo',
  'Nova',
  'Raven',
  'Tiger',
  'Signal',
]

export function now() {
  return Date.now()
}

export function defaultSessionTitle(themeLabel: string) {
  return `${DEFAULT_SESSION_TITLE} · ${themeLabel}`
}

export function clampParticipantLimit(value?: number | null) {
  if (!value) {
    return DEFAULT_MAX_PARTICIPANTS
  }
  return Math.max(2, Math.min(1000, Math.floor(value)))
}

export function defaultVotingWindowSeconds() {
  return DEFAULT_VOTING_WINDOW_SECONDS
}

export function randomString(length: number, alphabet = RANDOM_ALPHABET) {
  const bytes = new Uint8Array(length)
  crypto.getRandomValues(bytes)
  let output = ''
  for (const byte of bytes) {
    output += alphabet[byte % alphabet.length]
  }
  return output
}

export function generateJoinCode() {
  return randomString(6, JOIN_CODE_ALPHABET)
}

export function generateGuestAccessToken() {
  return `guest_${randomString(32)}`
}

export function autoDisplayName() {
  const adjective =
    DISPLAY_ADJECTIVES[Math.floor(Math.random() * DISPLAY_ADJECTIVES.length)]
  const noun = DISPLAY_NOUNS[Math.floor(Math.random() * DISPLAY_NOUNS.length)]
  return `${adjective} ${noun}`
}

export async function hashToken(token: string) {
  const data = new TextEncoder().encode(token)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(digest))
    .map((value) => value.toString(16).padStart(2, '0'))
    .join('')
}

export function shuffle<T>(items: readonly T[]) {
  const copy = [...items]
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1))
    const current = copy[index]
    copy[index] = copy[swapIndex]
    copy[swapIndex] = current
  }
  return copy
}

export function buildAnonymizedSlots(count: number) {
  return shuffle(
    Array.from({ length: count }, (_, index) => getRoundSlotLabel(index)),
  )
}

export function createSlug(baseTitle: string) {
  const normalized = baseTitle
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48)
  return `${normalized || 'arena'}-${randomString(6)}`
}

export async function getSessionBySlug(
  ctx: QueryCtx | MutationCtx,
  slug: string,
) {
  return await ctx.db
    .query('sessions')
    .withIndex('by_slug', (query) => query.eq('slug', slug))
    .unique()
}

export async function getSessionByJoinCode(
  ctx: QueryCtx | MutationCtx,
  joinCode: string,
) {
  return await ctx.db
    .query('sessions')
    .withIndex('by_join_code', (query) => query.eq('joinCode', joinCode))
    .unique()
}

export async function requireAdminIdentity(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity()
  if (!identity) {
    throw new Error('You must be signed in as an admin to do that.')
  }
  return identity
}

export async function requireSessionOwner(
  ctx: QueryCtx | MutationCtx,
  sessionId: Id<'sessions'>,
) {
  const identity = await requireAdminIdentity(ctx)
  const session = await ctx.db.get(sessionId)
  if (!session) {
    throw new Error('Session not found.')
  }
  if (session.createdByIdentity !== identity.tokenIdentifier) {
    throw new Error('This session belongs to a different admin.')
  }
  return { identity, session }
}

export function ensureModelSnapshots(modelKeys: string[]) {
  const models = resolveModelSnapshots(modelKeys)
  if (models.length !== modelKeys.length) {
    throw new Error('One or more selected models are not supported.')
  }
  return models
}

export function getModelSnapshot(key: string): SessionModelSnapshot {
  const model = getModelByKey(key)
  if (!model) {
    throw new Error(`Unknown model key: ${key}`)
  }
  return {
    key: model.key,
    providerKey: model.providerKey,
    label: model.label,
    modelId: model.modelId,
    description: model.description,
    tagline: model.tagline,
    accent: model.accent,
  }
}

export async function generateUniqueSessionSlug(
  ctx: MutationCtx,
  title: string,
) {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const slug = createSlug(title)
    const existing = await ctx.db
      .query('sessions')
      .withIndex('by_slug', (query) => query.eq('slug', slug))
      .unique()
    if (!existing) {
      return slug
    }
  }
  throw new Error('Could not create a unique session slug.')
}

export async function generateUniqueJoinCode(ctx: MutationCtx) {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const joinCode = generateJoinCode()
    const existing = await ctx.db
      .query('sessions')
      .withIndex('by_join_code', (query) => query.eq('joinCode', joinCode))
      .unique()
    if (!existing) {
      return joinCode
    }
  }
  throw new Error('Could not create a unique join code.')
}

export async function getParticipantByToken(
  ctx: QueryCtx | MutationCtx,
  sessionId: Id<'sessions'>,
  participantToken: string | null,
) {
  if (!participantToken) {
    return null
  }
  const accessTokenHash = await hashToken(participantToken)
  return await ctx.db
    .query('sessionParticipants')
    .withIndex('by_session_id_and_access_token_hash', (query) =>
      query.eq('sessionId', sessionId).eq('accessTokenHash', accessTokenHash),
    )
    .unique()
}

export async function getRoundByNumber(
  ctx: QueryCtx | MutationCtx,
  sessionId: Id<'sessions'>,
  roundNumber: number,
) {
  return await ctx.db
    .query('rounds')
    .withIndex('by_session_id_and_round_number', (query) =>
      query.eq('sessionId', sessionId).eq('roundNumber', roundNumber),
    )
    .unique()
}

export async function listRoundsForSession(
  ctx: QueryCtx | MutationCtx,
  sessionId: Id<'sessions'>,
  limit: number,
) {
  return await ctx.db
    .query('rounds')
    .withIndex('by_session_id_and_round_number', (query) =>
      query.eq('sessionId', sessionId),
    )
    .take(limit)
}

export async function countParticipantsForSession(
  ctx: QueryCtx | MutationCtx,
  sessionId: Id<'sessions'>,
  limit: number,
) {
  const participants = await ctx.db
    .query('sessionParticipants')
    .withIndex('by_session_id', (query) => query.eq('sessionId', sessionId))
    .take(limit)
  return participants.length
}

export async function appendSessionEvent(
  ctx: MutationCtx,
  args: {
    sessionId: Id<'sessions'>
    roundId?: Id<'rounds'> | null
    type: string
    title: string
    description: string
    meta?: Record<string, string>
  },
) {
  await ctx.db.insert('sessionEvents', {
    sessionId: args.sessionId,
    roundId: args.roundId ?? null,
    type: args.type,
    title: args.title,
    description: args.description,
    meta: args.meta ?? {},
    createdAt: now(),
  })
}

export function getEligibleResponses(responses: Array<Doc<'roundResponses'>>) {
  return responses.filter(
    (response) =>
      response.status === 'success' && Boolean(response.responseText),
  )
}
