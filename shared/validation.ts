import { z } from 'zod'
import {
  MAX_CUSTOM_PROMPT_LENGTH,
  MAX_MODELS_PER_SESSION,
  MAX_ROUNDS,
  MAX_TOPIC_LENGTH,
  MIN_MODELS_PER_SESSION,
  MIN_ROUNDS,
  MIN_TOPIC_LENGTH,
  RESPONSE_LANGUAGES,
  SESSION_THEMES,
} from './arena'

export const createSessionSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, 'Give the session a clear title.')
    .max(80, 'Keep the session title under 80 characters.'),
  theme: z.enum(SESSION_THEMES),
  customPrompt: z
    .string()
    .trim()
    .max(
      MAX_CUSTOM_PROMPT_LENGTH,
      `Keep the custom prompt under ${MAX_CUSTOM_PROMPT_LENGTH} characters.`,
    )
    .optional()
    .default(''),
  responseLanguage: z.enum(RESPONSE_LANGUAGES).default('english'),
  roundCount: z.coerce.number().int().min(MIN_ROUNDS).max(MAX_ROUNDS),
  modelKeys: z
    .array(z.string().min(1))
    .min(MIN_MODELS_PER_SESSION, 'Select at least two models.')
    .max(MAX_MODELS_PER_SESSION)
    .refine(
      (items) => new Set(items).size === items.length,
      'Pick each model once.',
    ),
  maxParticipants: z.coerce.number().int().min(2).max(1000).default(200),
})

export const joinSessionSchema = z.object({
  displayName: z
    .string()
    .trim()
    .max(40, 'Display names must stay under 40 characters.'),
  email: z
    .string()
    .trim()
    .email('Use a valid email address.')
    .max(120)
    .or(z.literal(''))
    .optional()
    .default(''),
})

export const joinCodeSchema = z.object({
  code: z
    .string()
    .trim()
    .min(4, 'Join codes are short, but not that short.')
    .max(12, 'Join code looks too long.'),
  displayName: joinSessionSchema.shape.displayName,
  email: joinSessionSchema.shape.email,
})

export const topicSchema = z.object({
  topic: z
    .string()
    .trim()
    .min(
      MIN_TOPIC_LENGTH,
      `Topic must be at least ${MIN_TOPIC_LENGTH} characters.`,
    )
    .max(
      MAX_TOPIC_LENGTH,
      `Topic must stay under ${MAX_TOPIC_LENGTH} characters.`,
    ),
})

export function normalizeOptionalEmail(email?: string) {
  const normalized = email?.trim() ?? ''
  return normalized.length > 0 ? normalized : null
}
