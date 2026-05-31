export const SESSION_THEMES = ['comedy', 'debate', 'eli5', 'freeform'] as const
export type SessionTheme = (typeof SESSION_THEMES)[number]

export const RESPONSE_LANGUAGES = ['english', 'romanian'] as const
export type ResponseLanguage = (typeof RESPONSE_LANGUAGES)[number]

export const RESPONSE_LANGUAGE_COPY: Record<
  ResponseLanguage,
  { label: string; instruction: string }
> = {
  english: {
    label: 'English',
    instruction: 'Write all user-facing output in English.',
  },
  romanian: {
    label: 'Romana',
    instruction: 'Write all user-facing output in Romanian.',
  },
}

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
  'stats_summary',
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
    label: 'OpenAI GPT-5.5',
    modelId: 'gpt-5.5',
    description: 'Clean structure, high clarity, strong prompt following.',
    tagline: 'Precise and polished.',
    accent: 'var(--arena-openai)',
    judgeStyle: 'precise, structured, and outcome-focused',
  },
  {
    key: 'openai-gpt54-mini',
    providerKey: 'openai',
    label: 'OpenAI GPT-5.4 Mini',
    modelId: 'gpt-5.4-mini',
    description: 'Fast, capable reasoning for coding and agentic prompts.',
    tagline: 'Compact and capable.',
    accent: 'var(--arena-openai)',
    judgeStyle: 'practical, concise, and implementation-aware',
  },
  {
    key: 'openai-gpt5-mini',
    providerKey: 'openai',
    label: 'OpenAI GPT-5 Mini',
    modelId: 'gpt-5-mini',
    description: 'Cost-efficient GPT-5 reasoning for well-defined tasks.',
    tagline: 'Lean and reliable.',
    accent: 'var(--arena-openai)',
    judgeStyle: 'efficient, direct, and clarity-focused',
  },
  {
    key: 'anthropic-claude-opus-48',
    providerKey: 'anthropic',
    label: 'Claude Opus 4.8',
    modelId: 'claude-opus-4-8',
    description: 'Highest-end Anthropic model for nuance and creative polish.',
    tagline: 'Premium and expressive.',
    accent: 'var(--arena-anthropic)',
    judgeStyle: 'careful, original, and taste-aware',
  },
  {
    key: 'google-gemini-35-flash',
    providerKey: 'google',
    label: 'Gemini 3.5 Flash',
    modelId: 'gemini-3.5-flash',
    description: 'Fast Gemini model with strong live-response quality.',
    tagline: 'Fast and witty.',
    accent: 'var(--arena-google)',
    judgeStyle: 'broad, quick, and entertainment-aware',
  },
  {
    key: 'anthropic-claude-sonnet-4',
    providerKey: 'anthropic',
    label: 'Claude Sonnet 4.6',
    modelId: 'claude-sonnet-4-6',
    description: 'Balanced reasoning with strong nuance and tone control.',
    tagline: 'Nuanced and composed.',
    accent: 'var(--arena-anthropic)',
    judgeStyle: 'nuanced, empathetic, and articulate',
  },
  {
    key: 'anthropic-claude-haiku-45',
    providerKey: 'anthropic',
    label: 'Claude Haiku 4.5',
    modelId: 'claude-haiku-4-5-20251001',
    description: 'Fast Anthropic model with strong coding and agent skills.',
    tagline: 'Fast and sharp.',
    accent: 'var(--arena-anthropic)',
    judgeStyle: 'quick, crisp, and practical',
  },
  {
    key: 'google-gemini-31-pro',
    providerKey: 'google',
    label: 'Gemini 3.1 Pro',
    modelId: 'gemini-3.1-pro-preview',
    description: 'Deeper comparative reasoning with broad synthesis.',
    tagline: 'Deep and analytical.',
    accent: 'var(--arena-google)',
    judgeStyle: 'broad, rigorous, and comparative',
  },
  {
    key: 'google-gemini-31-flash-lite',
    providerKey: 'google',
    label: 'Gemini 3.1 Flash-Lite',
    modelId: 'gemini-3.1-flash-lite',
    description: 'Lowest-latency Gemini option for quick live rounds.',
    tagline: 'Light and quick.',
    accent: 'var(--arena-google)',
    judgeStyle: 'fast, simple, and crowd-aware',
  },
] as const satisfies readonly ArenaModelDefinition[]

const LEGACY_MODEL_DEFINITIONS = [
  {
    key: 'google-gemini-3-flash',
    providerKey: 'google',
    label: 'Gemini 3 Flash',
    modelId: 'gemini-3-flash-preview',
    description: 'Legacy Gemini Flash preview kept for historical sessions.',
    tagline: 'Legacy preview model.',
    accent: 'var(--arena-google)',
    judgeStyle: 'broad, insightful, and comparative',
  },
  {
    key: 'google-gemini-25-pro',
    providerKey: 'google',
    label: 'Gemini 2.5 Pro',
    modelId: 'gemini-2.5-pro',
    description: 'Legacy Gemini Pro slot kept for historical sessions.',
    tagline: 'Legacy model.',
    accent: 'var(--arena-google)',
    judgeStyle: 'broad, insightful, and comparative',
  },
  {
    key: 'xai-grok-41-fast',
    providerKey: 'xai',
    label: 'Grok 4.1 Fast',
    modelId: 'grok-4-1-fast-reasoning',
    description: 'Legacy xAI slot kept for historical sessions.',
    tagline: 'Legacy model.',
    accent: 'var(--arena-xai)',
    judgeStyle: 'punchy, direct, and entertainment-aware',
  },
  {
    key: 'mistral-large',
    providerKey: 'mistral',
    label: 'Mistral Large',
    modelId: 'mistral-large-2512',
    description: 'Legacy Mistral slot kept for historical sessions.',
    tagline: 'Legacy model.',
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
export const MAX_CUSTOM_PROMPT_LENGTH = 500
export const PROVIDER_TIMEOUT_MS = 65_000
export const AGENT_TIMEOUT_MS = 8_000
export const ROUND_MAX_OUTPUT_TOKENS = 180
export const AGENT_MAX_OUTPUT_TOKENS = 500
export const JUDGE_MAX_OUTPUT_TOKENS = 1_024
export const HOST_AGENT_DEFAULT_MODEL = 'gpt-5-mini'
export const CRITIC_AGENT_DEFAULT_MODEL = 'gpt-5-mini'
export const STATS_AGENT_DEFAULT_MODEL = 'gemini-3.1-flash-lite'

// Approximate USD pricing per 1M tokens as of early 2026. Kept intentionally
// coarse so the dashboard can show meaningful budget estimates without
// pretending to be a real billing system.
export type ModelPricing = {
  inputUsdPerMillionTokens: number
  outputUsdPerMillionTokens: number
}

export const MODEL_PRICING: Record<string, ModelPricing> = {
  'openai-gpt5': {
    inputUsdPerMillionTokens: 5,
    outputUsdPerMillionTokens: 30,
  },
  'openai-gpt54-mini': {
    inputUsdPerMillionTokens: 0.75,
    outputUsdPerMillionTokens: 4.5,
  },
  'openai-gpt5-mini': {
    inputUsdPerMillionTokens: 0.25,
    outputUsdPerMillionTokens: 2,
  },
  'anthropic-claude-opus-48': {
    inputUsdPerMillionTokens: 15,
    outputUsdPerMillionTokens: 75,
  },
  'anthropic-claude-sonnet-4': {
    inputUsdPerMillionTokens: 3,
    outputUsdPerMillionTokens: 15,
  },
  'anthropic-claude-haiku-45': {
    inputUsdPerMillionTokens: 1,
    outputUsdPerMillionTokens: 5,
  },
  'google-gemini-3-flash': {
    inputUsdPerMillionTokens: 0.5,
    outputUsdPerMillionTokens: 3,
  },
  'google-gemini-35-flash': {
    inputUsdPerMillionTokens: 0.5,
    outputUsdPerMillionTokens: 3,
  },
  'google-gemini-31-pro': {
    inputUsdPerMillionTokens: 2,
    outputUsdPerMillionTokens: 12,
  },
  'google-gemini-31-flash-lite': {
    inputUsdPerMillionTokens: 0.15,
    outputUsdPerMillionTokens: 0.6,
  },
  'google-gemini-25-pro': {
    inputUsdPerMillionTokens: 1.25,
    outputUsdPerMillionTokens: 5,
  },
  'xai-grok-41-fast': {
    inputUsdPerMillionTokens: 0.5,
    outputUsdPerMillionTokens: 1.5,
  },
  'mistral-large': {
    inputUsdPerMillionTokens: 2,
    outputUsdPerMillionTokens: 6,
  },
}

export function getModelPricing(modelKey: string): ModelPricing | null {
  return MODEL_PRICING[modelKey] ?? null
}

export function computeCostMicrosUsd(
  modelKey: string,
  inputTokens: number | null,
  outputTokens: number | null,
): number {
  const pricing = getModelPricing(modelKey)
  if (!pricing) return 0
  const inputUsd =
    ((inputTokens ?? 0) * pricing.inputUsdPerMillionTokens) / 1_000_000
  const outputUsd =
    ((outputTokens ?? 0) * pricing.outputUsdPerMillionTokens) / 1_000_000
  return Math.round((inputUsd + outputUsd) * 1_000_000)
}

export function formatMicrosUsd(micros: number): string {
  const usd = micros / 1_000_000
  if (usd < 0.01) return `$${usd.toFixed(4)}`
  if (usd < 1) return `$${usd.toFixed(3)}`
  return `$${usd.toFixed(2)}`
}

export function parseJudgeDecision(
  payload: string,
  allowedSlots: readonly string[],
) {
  const parseCandidate = (candidate: string) => {
    try {
      const parsed = JSON.parse(candidate) as {
        slot?: unknown
        rationale?: unknown
      }
      if (
        typeof parsed.slot !== 'string' ||
        !allowedSlots.includes(parsed.slot)
      ) {
        return null
      }
      return {
        slot: parsed.slot,
        rationale:
          typeof parsed.rationale === 'string'
            ? parsed.rationale.trim() || null
            : null,
      }
    } catch {
      return null
    }
  }

  const trimmed = payload
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim()
  const strict = parseCandidate(trimmed)
  if (strict) {
    return strict
  }

  for (
    let start = trimmed.indexOf('{');
    start !== -1;
    start = trimmed.indexOf('{', start + 1)
  ) {
    for (
      let end = trimmed.lastIndexOf('}');
      end > start;
      end = trimmed.lastIndexOf('}', end - 1)
    ) {
      const extracted = parseCandidate(trimmed.slice(start, end + 1))
      if (extracted) {
        return extracted
      }
    }
  }
  return null
}

const MODEL_MAP = new Map<string, ArenaModelDefinition>(
  [...AVAILABLE_MODELS, ...LEGACY_MODEL_DEFINITIONS].map((model) => [
    model.key,
    model,
  ]),
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
