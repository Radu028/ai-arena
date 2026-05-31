import { describe, expect, test } from 'vitest'
import {
  AVAILABLE_MODELS,
  computeCostMicrosUsd,
  formatMicrosUsd,
  getModelByKey,
  getModelPricing,
  getThemeCopy,
  parseJudgeDecision,
  resolveModelSnapshots,
} from './arena'
import {
  createSessionSchema,
  joinSessionSchema,
  topicSchema,
} from './validation'

describe('shared validation', () => {
  test('rejects duplicate model selections', () => {
    const duplicateKey = AVAILABLE_MODELS[0].key
    const result = createSessionSchema.safeParse({
      title: 'Arena Prime',
      theme: 'comedy',
      roundCount: 3,
      modelKeys: [duplicateKey, duplicateKey],
      maxParticipants: 20,
    })

    expect(result.success).toBe(false)
  })

  test('requires at least two models', () => {
    const result = createSessionSchema.safeParse({
      title: 'Lonely Session',
      theme: 'comedy',
      roundCount: 3,
      modelKeys: [AVAILABLE_MODELS[0].key],
      maxParticipants: 20,
    })

    expect(result.success).toBe(false)
  })

  test('trims and validates topics', () => {
    const result = topicSchema.parse({
      topic: '   Explain why build pipelines fail on Fridays.   ',
    })

    expect(result.topic).toBe('Explain why build pipelines fail on Fridays.')
  })

  test('rejects empty topics', () => {
    const result = topicSchema.safeParse({ topic: '' })
    expect(result.success).toBe(false)
  })

  test('requires a username before joining from the client', () => {
    const result = joinSessionSchema.safeParse({
      displayName: '   ',
      email: '',
    })

    expect(result.success).toBe(false)
  })
})

describe('arena helpers', () => {
  test('each known model has pricing', () => {
    for (const model of AVAILABLE_MODELS) {
      expect(getModelPricing(model.key)).not.toBeNull()
    }
  })

  test('resolveModelSnapshots returns snapshots for valid keys only', () => {
    const snapshots = resolveModelSnapshots([
      AVAILABLE_MODELS[0].key,
      'nonexistent-model',
      AVAILABLE_MODELS[1].key,
    ])
    expect(snapshots).toHaveLength(2)
    expect(snapshots.map((s) => s.key)).toEqual([
      AVAILABLE_MODELS[0].key,
      AVAILABLE_MODELS[1].key,
    ])
  })

  test('getModelByKey returns undefined for unknown keys', () => {
    expect(getModelByKey('nope')).toBeUndefined()
  })

  test('computeCostMicrosUsd handles null tokens safely', () => {
    expect(computeCostMicrosUsd('openai-gpt5', null, null)).toBe(0)
    expect(computeCostMicrosUsd('unknown-model', 100, 100)).toBe(0)
  })

  test('computeCostMicrosUsd produces expected dollar amounts', () => {
    // GPT-5.5: $5.00 / 1M input + $30.00 / 1M output
    // 1000 input + 500 output = 1000 * 5e-6 + 500 * 30e-6 = 0.005 + 0.015 = 0.02 USD
    const micros = computeCostMicrosUsd('openai-gpt5', 1000, 500)
    expect(micros).toBe(20_000)
  })

  test('formatMicrosUsd formats small and large values', () => {
    expect(formatMicrosUsd(100)).toBe('$0.0001')
    expect(formatMicrosUsd(50_000)).toBe('$0.050')
    expect(formatMicrosUsd(5_000_000)).toBe('$5.00')
  })

  test('every theme has a non-empty copy bundle', () => {
    for (const theme of ['comedy', 'debate', 'eli5', 'freeform'] as const) {
      const copy = getThemeCopy(theme)
      expect(copy.label.length).toBeGreaterThan(0)
      expect(copy.hostTone.length).toBeGreaterThan(0)
      expect(copy.criticAngle.length).toBeGreaterThan(0)
    }
  })

  test('parseJudgeDecision accepts provider-wrapped JSON for allowed slots', () => {
    expect(
      parseJudgeDecision(
        '```json\n{"slot":"B","rationale":" Best punchline. "}\n```',
        ['A', 'B'],
      ),
    ).toEqual({ slot: 'B', rationale: 'Best punchline.' })
    expect(
      parseJudgeDecision('Decision: {"slot":"A","rationale":"Clearer."}', [
        'A',
        'B',
      ]),
    ).toEqual({ slot: 'A', rationale: 'Clearer.' })
  })

  test('parseJudgeDecision rejects invalid or disallowed votes', () => {
    expect(parseJudgeDecision('{"slot":"C"}', ['A', 'B'])).toBeNull()
    expect(parseJudgeDecision('Choose response A.', ['A', 'B'])).toBeNull()
  })
})
