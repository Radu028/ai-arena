import { describe, expect, test } from 'vitest'
import { AVAILABLE_MODELS } from './arena'
import { createSessionSchema, topicSchema } from './validation'

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

  test('trims and validates topics', () => {
    const result = topicSchema.parse({
      topic: '   Explain why build pipelines fail on Fridays.   ',
    })

    expect(result.topic).toBe('Explain why build pipelines fail on Fridays.')
  })
})
