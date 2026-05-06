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

  test('host eval fails when copy ignores the topic and theme tone', () => {
    const evaluation = evaluateHostCopy({
      theme: 'debate',
      topic: 'Regulating autonomous delivery drones in cities',
      output: 'Welcome back. This round should be interesting.',
    })

    expect(evaluation.passed).toBe(false)
    expect(evaluation.checks).toEqual(
      expect.arrayContaining([
        { name: 'references_topic', passed: false },
        { name: 'theme_tone_match', passed: false },
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

  test('critic eval fails when a model is omitted or no rationale is given', () => {
    const evaluation = evaluateCriticCopy({
      modelLabels: ['OpenAI GPT-5.2', 'Claude Sonnet 4', 'Mistral Large'],
      winnerLabels: ['Mistral Large'],
      output:
        'Mistral Large wins. OpenAI GPT-5.2 gets second place. Final result recorded.',
    })

    expect(evaluation.passed).toBe(false)
    expect(evaluation.checks).toEqual(
      expect.arrayContaining([
        { name: 'mentions_all_models', passed: false },
        { name: 'provides_rationale', passed: false },
      ]),
    )
  })
})
