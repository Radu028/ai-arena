import { v } from 'convex/values'

export const nullableStringValidator = v.union(v.string(), v.null())
export const nullableNumberValidator = v.union(v.number(), v.null())

export const participantKindValidator = v.union(
  v.literal('guest'),
  v.literal('admin'),
)
export const sessionThemeValidator = v.union(
  v.literal('comedy'),
  v.literal('debate'),
  v.literal('eli5'),
  v.literal('freeform'),
)
export const sessionStatusValidator = v.union(
  v.literal('waiting'),
  v.literal('active'),
  v.literal('stopped'),
  v.literal('ended'),
)
export const roundStatusValidator = v.union(
  v.literal('pending'),
  v.literal('collecting_topic'),
  v.literal('generating'),
  v.literal('voting'),
  v.literal('scored'),
  v.literal('aborted'),
)
export const roundResultStatusValidator = v.union(
  v.literal('pending'),
  v.literal('winner'),
  v.literal('tie'),
  v.literal('aborted'),
)
export const responseStatusValidator = v.union(
  v.literal('pending'),
  v.literal('success'),
  v.literal('timeout'),
  v.literal('error'),
  v.literal('skipped'),
  v.literal('stopped'),
)
export const artifactTypeValidator = v.union(
  v.literal('host_intro'),
  v.literal('host_transition'),
  v.literal('critic_analysis'),
  v.literal('host_recap'),
)
export const artifactStatusValidator = v.union(
  v.literal('pending'),
  v.literal('success'),
  v.literal('fallback'),
)

export const sessionModelSnapshotValidator = v.object({
  key: v.string(),
  providerKey: v.string(),
  label: v.string(),
  modelId: v.string(),
  description: v.string(),
  tagline: v.string(),
  accent: v.string(),
})
