import { describe, expect, test } from 'vitest'
import {
  evaluateCriticCopy,
  evaluateHostCopy,
  evaluateQualityJudgeScores,
  evaluateStatsCopy,
} from './agent-evals'

function check(result: ReturnType<typeof evaluateHostCopy>, name: string) {
  return result.checks.find((candidate) => candidate.name === name)
}

describe('deterministic agent quality evals', () => {
  test('host output meets length, structure, relevance, tone, and format thresholds', () => {
    const evaluation = evaluateHostCopy({
      theme: 'comedy',
      topic: 'Debugging a smart toaster before breakfast',
      output:
        'Welcome to the comedy stage, where debugging a smart toaster is the only thing standing between us and breakfast. Keep the punchline warm, the crumbs controlled, and let this ridiculous round begin!',
    })

    expect(evaluation.passed).toBe(true)
    expect(evaluation.score).toBe(100)
    expect(check(evaluation, 'word_count_in_range')).toMatchObject({
      passed: true,
      expected: '15-90 words',
    })
    expect(check(evaluation, 'sentence_count_in_range')).toMatchObject({
      passed: true,
      actual: 2,
    })
    expect(check(evaluation, 'topic_keyword_coverage')).toMatchObject({
      passed: true,
    })
  })

  test('host output fails when it is short, generic, single-sentence, and badly formatted', () => {
    const evaluation = evaluateHostCopy({
      theme: 'debate',
      topic: 'Regulating autonomous delivery drones in cities',
      output: '## Welcome back to the show.',
    })

    expect(evaluation.passed).toBe(false)
    expect(check(evaluation, 'word_count_in_range')?.passed).toBe(false)
    expect(check(evaluation, 'sentence_count_in_range')?.passed).toBe(false)
    expect(check(evaluation, 'topic_keyword_coverage')?.passed).toBe(false)
    expect(check(evaluation, 'theme_tone_match')?.passed).toBe(false)
    expect(check(evaluation, 'no_meta_or_markdown_formatting')?.passed).toBe(
      false,
    )
  })

  test('critic output covers the topic, every model, the winner, and comparative reasoning', () => {
    const evaluation = evaluateCriticCopy({
      topic: 'Should autonomous delivery drones be regulated in cities?',
      modelLabels: ['OpenAI GPT-5.5', 'Claude Sonnet 4.6', 'Gemini 3.1 Pro'],
      winnerLabels: ['Claude Sonnet 4.6'],
      output:
        'On regulating autonomous delivery drones in cities, Claude Sonnet 4.6 worked best because it balanced public safety with practical delivery benefits. OpenAI GPT-5.5 made a strong efficiency case but lacked detail on enforcement, while Gemini 3.1 Pro covered privacy concerns yet offered a weaker policy trade-off.',
    })

    expect(evaluation.passed).toBe(true)
    expect(evaluation.score).toBe(100)
    expect(check(evaluation, 'mentions_all_models')?.passed).toBe(true)
    expect(check(evaluation, 'provides_comparative_rationale')?.passed).toBe(
      true,
    )
  })

  test('critic output fails measurable quality checks when analysis is incomplete', () => {
    const evaluation = evaluateCriticCopy({
      topic: 'Should autonomous delivery drones be regulated in cities?',
      modelLabels: ['OpenAI GPT-5.5', 'Claude Sonnet 4.6', 'Gemini 3.1 Pro'],
      winnerLabels: ['Gemini 3.1 Pro'],
      output:
        'Gemini 3.1 Pro wins. OpenAI GPT-5.5 gets second place. Final result recorded.',
    })

    expect(evaluation.passed).toBe(false)
    expect(check(evaluation, 'word_count_in_range')?.passed).toBe(false)
    expect(check(evaluation, 'topic_keyword_coverage')?.passed).toBe(false)
    expect(check(evaluation, 'mentions_all_models')?.passed).toBe(false)
    expect(check(evaluation, 'provides_comparative_rationale')?.passed).toBe(
      false,
    )
  })

  test('stats output reports every model and only the supplied vote values', () => {
    const evaluation = evaluateStatsCopy({
      modelLabels: ['OpenAI GPT-5.5', 'Gemini 3 Flash'],
      requiredNumbers: [4, 2],
      output:
        'OpenAI GPT-5.5 wins the round with 4 votes, while Gemini 3 Flash finishes with 2 votes. The vote split shows a clear lead for OpenAI GPT-5.5 and no tie.',
    })

    expect(evaluation.passed).toBe(true)
    expect(evaluation.score).toBe(100)
    expect(check(evaluation, 'mentions_required_numbers')).toMatchObject({
      passed: true,
      actual: '4, 2',
    })
    expect(check(evaluation, 'no_hallucinated_numbers')?.passed).toBe(true)
  })

  test('stats output fails when it omits a model and invents a vote value', () => {
    const evaluation = evaluateStatsCopy({
      modelLabels: ['OpenAI GPT-5.5', 'Gemini 3 Flash'],
      requiredNumbers: [4, 2],
      output:
        'OpenAI GPT-5.5 wins this round with 7 votes. The result shows a decisive winner and a wide voting margin.',
    })

    expect(evaluation.passed).toBe(false)
    expect(check(evaluation, 'mentions_all_models')?.passed).toBe(false)
    expect(check(evaluation, 'mentions_required_numbers')?.passed).toBe(false)
    expect(check(evaluation, 'no_hallucinated_numbers')).toMatchObject({
      passed: false,
      actual: '7',
    })
  })

  test('LLM-as-judge scores must meet the minimum on every quality dimension', () => {
    const passing = evaluateQualityJudgeScores({
      relevance: 5,
      clarity: 4,
      tone: 4,
      usefulness: 5,
    })
    const failing = evaluateQualityJudgeScores({
      relevance: 5,
      clarity: 3,
      tone: 4,
      usefulness: 4,
    })

    expect(passing.passed).toBe(true)
    expect(passing.score).toBe(100)
    expect(failing.passed).toBe(false)
    expect(
      failing.checks.find(
        (evaluationCheck) => evaluationCheck.name === 'llm_judge_clarity',
      ),
    ).toMatchObject({
      passed: false,
      actual: 3,
      expected: '4-5',
    })
  })
})
