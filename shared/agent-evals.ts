import type { SessionTheme } from './arena'

type EvalCheck = {
  name: string
  passed: boolean
}

export type AgentEvalResult = {
  passed: boolean
  checks: EvalCheck[]
}

const THEME_TONE_TERMS: Record<SessionTheme, string[]> = {
  comedy: ['joke', 'laugh', 'punchline', 'roast', 'funny', 'stage'],
  debate: ['argument', 'claim', 'evidence', 'position', 'rebuttal', 'case'],
  eli5: ['simple', 'kid', 'imagine', 'because', 'easy', 'learn'],
  freeform: ['arena', 'round', 'prompt', 'response', 'showcase', 'audience'],
}

function normalize(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

function includesAnyNeedle(content: string, needles: string[]) {
  const normalized = normalize(content)
  return needles.some((needle) => normalized.includes(normalize(needle)))
}

function topicNeedles(topic: string) {
  return normalize(topic)
    .split(' ')
    .filter((word) => word.length >= 4)
    .slice(0, 6)
}

function result(checks: EvalCheck[]): AgentEvalResult {
  return {
    passed: checks.every((check) => check.passed),
    checks,
  }
}

export function evaluateHostCopy(args: {
  output: string
  topic: string
  theme: SessionTheme
}) {
  const trimmed = args.output.trim()
  const checks: EvalCheck[] = [
    {
      name: 'non_empty_output',
      passed: trimmed.length > 0,
    },
    {
      name: 'references_topic',
      passed: includesAnyNeedle(trimmed, topicNeedles(args.topic)),
    },
    {
      name: 'theme_tone_match',
      passed: includesAnyNeedle(trimmed, THEME_TONE_TERMS[args.theme]),
    },
  ]

  return result(checks)
}

export function evaluateCriticCopy(args: {
  output: string
  modelLabels: string[]
  winnerLabels: string[]
}) {
  const trimmed = args.output.trim()
  const normalized = normalize(trimmed)
  const rationaleTerms = ['because', 'why', 'worked', 'strong', 'lacked']

  const checks: EvalCheck[] = [
    {
      name: 'non_empty_output',
      passed: trimmed.length > 0,
    },
    {
      name: 'mentions_all_models',
      passed: args.modelLabels.every((label) =>
        normalized.includes(normalize(label)),
      ),
    },
    {
      name: 'mentions_winner',
      passed: args.winnerLabels.every((label) =>
        normalized.includes(normalize(label)),
      ),
    },
    {
      name: 'provides_rationale',
      passed: includesAnyNeedle(trimmed, rationaleTerms),
    },
  ]

  return result(checks)
}
