import { describe, expect, test } from 'vitest'
import {
  evaluateCriticCopy,
  evaluateHostCopy,
  evaluateStatsCopy,
} from './agent-evals'

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
      modelLabels: ['OpenAI GPT-5.5', 'Claude Sonnet 4.6', 'Gemini 3.1 Pro'],
      winnerLabels: ['Claude Sonnet 4.6'],
      output:
        'Claude Sonnet 4.6 worked best because it made the clearest case. OpenAI GPT-5.5 was strong but less focused, while Gemini 3.1 Pro lacked enough detail.',
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
      modelLabels: ['OpenAI GPT-5.5', 'Claude Sonnet 4.6', 'Gemini 3.1 Pro'],
      winnerLabels: ['Gemini 3.1 Pro'],
      output:
        'Gemini 3.1 Pro wins. OpenAI GPT-5.5 gets second place. Final result recorded.',
    })

    expect(evaluation.passed).toBe(false)
    expect(evaluation.checks).toEqual(
      expect.arrayContaining([
        { name: 'mentions_all_models', passed: false },
        { name: 'provides_rationale', passed: false },
      ]),
    )
  })

  test('stats copy mentions models, vote counts, and a statistical takeaway', () => {
    const evaluation = evaluateStatsCopy({
      modelLabels: ['OpenAI GPT-5.5', 'Gemini 3 Flash'],
      requiredNumbers: [4, 2],
      output:
        'Stats Analyst: OpenAI GPT-5.5 wins the round with 4 votes, while Gemini 3 Flash lands at 2 votes. The vote split shows a clear winner rather than a tie.',
    })

    expect(evaluation.passed).toBe(true)
    expect(evaluation.checks).toEqual(
      expect.arrayContaining([
        { name: 'mentions_a_model', passed: true },
        { name: 'mentions_required_numbers', passed: true },
        { name: 'stats_focused', passed: true },
      ]),
    )
  })

  test('stats eval fails when output has no numbers or model reference', () => {
    const evaluation = evaluateStatsCopy({
      modelLabels: ['OpenAI GPT-5.5', 'Gemini 3 Flash'],
      requiredNumbers: [4, 2],
      output: 'This was an exciting round with a confident result.',
    })

    expect(evaluation.passed).toBe(false)
    expect(evaluation.checks).toEqual(
      expect.arrayContaining([
        { name: 'mentions_a_model', passed: false },
        { name: 'mentions_required_numbers', passed: false },
      ]),
    )
  })
})
