export const SESSION_THEMES = ['comedy', 'debate', 'eli5', 'freeform'] as const
export type SessionTheme = (typeof SESSION_THEMES)[number]

export const SESSION_STATUSES = [
  'waiting',
  'active',
  'stopped',
  'ended',
] as const
export type SessionStatus = (typeof SESSION_STATUSES)[number]

export const ROUND_STATUSES = [
  'pending',
  'collecting_topic',
  'generating',
  'voting',
  'scored',
  'aborted',
] as const
export type RoundStatus = (typeof ROUND_STATUSES)[number]

export const ROUND_RESULT_STATUSES = [
  'pending',
  'winner',
  'tie',
  'aborted',
] as const
export type RoundResultStatus = (typeof ROUND_RESULT_STATUSES)[number]

export const RESPONSE_STATUSES = [
  'pending',
  'success',
  'timeout',
  'error',
  'skipped',
  'stopped',
] as const
export type ResponseStatus = (typeof RESPONSE_STATUSES)[number]

export const ARTIFACT_TYPES = [
  'host_intro',
  'host_transition',
  'critic_analysis',
  'host_recap',
] as const
export type ArtifactType = (typeof ARTIFACT_TYPES)[number]

export const ARTIFACT_STATUSES = ['pending', 'success', 'fallback'] as const
export type ArtifactStatus = (typeof ARTIFACT_STATUSES)[number]

export const PARTICIPANT_KINDS = ['guest', 'admin'] as const
export type ParticipantKind = (typeof PARTICIPANT_KINDS)[number]

export const ARENA_PROVIDERS = [
  'openai',
  'anthropic',
  'google',
  'xai',
  'mistral',
] as const
export type ArenaProviderKey = (typeof ARENA_PROVIDERS)[number]

export type ArenaModelDefinition = {
  key: string
  providerKey: ArenaProviderKey
  label: string
  modelId: string
  description: string
  tagline: string
  accent: string
  judgeStyle: string
}

export const AVAILABLE_MODELS = [
  {
    key: 'openai-gpt5',
    providerKey: 'openai',
    label: 'OpenAI GPT-5.2',
    modelId: 'gpt-5.2',
    description: 'Clean structure, high clarity, strong prompt following.',
    tagline: 'Precise and polished.',
    accent: 'var(--arena-openai)',
    judgeStyle: 'precise, structured, and outcome-focused',
  },
  {
    key: 'anthropic-claude-sonnet-4',
    providerKey: 'anthropic',
    label: 'Claude Sonnet 4',
    modelId: 'claude-sonnet-4-20250514',
    description: 'Balanced reasoning with strong nuance and tone control.',
    tagline: 'Nuanced and composed.',
    accent: 'var(--arena-anthropic)',
    judgeStyle: 'nuanced, empathetic, and articulate',
  },
  {
    key: 'google-gemini-25-pro',
    providerKey: 'google',
    label: 'Gemini 2.5 Pro',
    modelId: 'gemini-2.5-pro',
    description: 'Wide-angle synthesis with confident explanation.',
    tagline: 'Big-picture and expressive.',
    accent: 'var(--arena-google)',
    judgeStyle: 'broad, insightful, and comparative',
  },
  {
    key: 'xai-grok-41-fast',
    providerKey: 'xai',
    label: 'Grok 4.1 Fast',
    modelId: 'grok-4-1-fast-reasoning',
    description: 'Edgier phrasing and punchier comedic instincts.',
    tagline: 'Fast and sharp.',
    accent: 'var(--arena-xai)',
    judgeStyle: 'punchy, direct, and entertainment-aware',
  },
  {
    key: 'mistral-large',
    providerKey: 'mistral',
    label: 'Mistral Large',
    modelId: 'mistral-large-2512',
    description: 'Compact, elegant answers with disciplined voice.',
    tagline: 'Lean and elegant.',
    accent: 'var(--arena-mistral)',
    judgeStyle: 'concise, stylish, and disciplined',
  },
] as const satisfies readonly ArenaModelDefinition[]

export type ArenaModelKey = (typeof AVAILABLE_MODELS)[number]['key']

export type SessionModelSnapshot = Pick<
  ArenaModelDefinition,
  | 'key'
  | 'providerKey'
  | 'label'
  | 'modelId'
  | 'description'
  | 'tagline'
  | 'accent'
>

export type ThemeCopy = {
  label: string
  hostTone: string
  criticAngle: string
  topicHint: string
}

export const THEME_COPY: Record<SessionTheme, ThemeCopy> = {
  comedy: {
    label: 'Comedy Roast',
    hostTone: 'playful, mischievous, and stage-ready',
    criticAngle: 'timing, originality, rhythm, and surprise',
    topicHint: 'Set up a premise the audience can immediately picture.',
  },
  debate: {
    label: 'Debate Night',
    hostTone: 'formal, sharp, and moderator-like',
    criticAngle: 'logic, framing, persuasion, and rebuttal quality',
    topicHint: 'Choose a claim worth arguing, not a vague theme.',
  },
  eli5: {
    label: "Explain Like I'm 5",
    hostTone: 'warm, friendly, and educational',
    criticAngle: 'clarity, simplicity, metaphors, and accessibility',
    topicHint: 'Pick something complex enough to simplify.',
  },
  freeform: {
    label: 'Open Arena',
    hostTone: 'confident, modern, and adaptable',
    criticAngle: 'effectiveness relative to the prompt and audience',
    topicHint: 'Anything goes if the prompt is concrete.',
  },
}

export const DEFAULT_SESSION_TITLE = 'AI Arena Live Session'
export const DEFAULT_MAX_PARTICIPANTS = 200
export const DEFAULT_VOTING_WINDOW_SECONDS = 60
export const MIN_MODELS_PER_SESSION = 2
export const MAX_MODELS_PER_SESSION = AVAILABLE_MODELS.length
export const MIN_ROUNDS = 1
export const MAX_ROUNDS = 10
export const MAX_TOPIC_LENGTH = 300
export const MIN_TOPIC_LENGTH = 5
export const PROVIDER_TIMEOUT_MS = 15_000
export const AGENT_TIMEOUT_MS = 8_000
export const HOST_AGENT_DEFAULT_MODEL = 'gpt-5-mini'
export const CRITIC_AGENT_DEFAULT_MODEL = 'gpt-5-mini'

const MODEL_MAP = new Map<string, (typeof AVAILABLE_MODELS)[number]>(
  AVAILABLE_MODELS.map((model) => [model.key, model]),
)

export function getModelByKey(key: string) {
  return MODEL_MAP.get(key)
}

export function isArenaModelKey(key: string): key is ArenaModelKey {
  return MODEL_MAP.has(key)
}

export function resolveModelSnapshots(keys: string[]): SessionModelSnapshot[] {
  return keys
    .map((key) => MODEL_MAP.get(key))
    .filter((model): model is (typeof AVAILABLE_MODELS)[number] =>
      Boolean(model),
    )
    .map((model) => ({
      key: model.key,
      providerKey: model.providerKey,
      label: model.label,
      modelId: model.modelId,
      description: model.description,
      tagline: model.tagline,
      accent: model.accent,
    }))
}

export function getThemeCopy(theme: SessionTheme) {
  return THEME_COPY[theme]
}

export function getRoundSlotLabel(index: number) {
  return String.fromCharCode(65 + index)
}

export function statusTone(status: SessionStatus) {
  switch (status) {
    case 'waiting':
      return 'Queued'
    case 'active':
      return 'Live'
    case 'stopped':
      return 'Stopped'
    case 'ended':
      return 'Finished'
  }
}
