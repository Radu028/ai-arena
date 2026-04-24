import { describe, expect, test } from 'vitest'
import { evaluateCriticCopy, evaluateHostCopy } from './agent-evals'

describe('agent evals', () => {
  test('host copy is non-empty, references the topic, and fits theme tone', () => {
    const evaluation = evaluateHostCopy({
      theme: 'comedy',
      topic: 'Debugging a smart toaster before breakfast',
      output:
        'Step onto the stage: this round turns debugging a smart toaster into a breakfast joke with a live punchline.',
    })

    expect(evaluation.passed).toBe(true)
    expect(evaluation.checks).toEqual(
      expect.arrayContaining([
        { name: 'non_empty_output', passed: true },
        { name: 'references_topic', passed: true },
        { name: 'theme_tone_match', passed: true },
      ]),
    )
  })

  test('critic copy mentions every model and gives a rationale for the winner', () => {
    const evaluation = evaluateCriticCopy({
      modelLabels: ['OpenAI GPT-5.2', 'Claude Sonnet 4', 'Mistral Large'],
      winnerLabels: ['Claude Sonnet 4'],
      output:
        'Claude Sonnet 4 worked best because it made the clearest case. OpenAI GPT-5.2 was strong but less focused, while Mistral Large lacked enough detail.',
    })

    expect(evaluation.passed).toBe(true)
    expect(evaluation.checks).toEqual(
      expect.arrayContaining([
        { name: 'mentions_all_models', passed: true },
        { name: 'mentions_winner', passed: true },
        { name: 'provides_rationale', passed: true },
      ]),
    )
  })
})
