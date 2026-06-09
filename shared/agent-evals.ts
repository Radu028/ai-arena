import type { SessionTheme } from './arena'

type EvalValue = boolean | number | string

export type EvalCheck = {
  name: string
  passed: boolean
  actual: EvalValue
  expected: string
}

export type AgentEvalResult = {
  passed: boolean
  score: number
  checks: EvalCheck[]
}

export type QualityJudgeScores = {
  relevance: number
  clarity: number
  tone: number
  usefulness: number
}

const THEME_TONE_TERMS: Record<SessionTheme, string[]> = {
  comedy: ['joke', 'laugh', 'punchline', 'roast', 'funny', 'stage', 'playful'],
  debate: [
    'argument',
    'claim',
    'evidence',
    'position',
    'rebuttal',
    'case',
    'debate',
  ],
  eli5: ['simple', 'kid', 'imagine', 'because', 'easy', 'learn', 'friendly'],
  freeform: [
    'arena',
    'round',
    'prompt',
    'response',
    'showcase',
    'audience',
    'welcome',
  ],
}

const TOPIC_STOP_WORDS = new Set([
  'about',
  'after',
  'before',
  'between',
  'from',
  'into',
  'that',
  'the',
  'this',
  'using',
  'with',
  'despre',
  'dintre',
  'pentru',
  'printr',
  'care',
  'este',
])

const META_OR_FORMATTING_PATTERNS = [
  /```/,
  /^\s{0,3}#{1,6}\s/m,
  /^\s*[-*]\s+/m,
  /\bas an ai(?: language model)?\b/i,
  /\bsystem prompt\b/i,
  /\binstructions above\b/i,
]

function normalize(value: string) {
  return value
    .toLocaleLowerCase()
    .normalize('NFKD')
    .replace(/\p{M}/gu, '')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim()
}

function words(value: string) {
  return value.match(/[\p{L}\p{N}]+(?:['’-][\p{L}\p{N}]+)*/gu) ?? []
}

function sentenceCount(value: string) {
  const trimmed = value.trim()
  if (!trimmed) {
    return 0
  }

  const terminalMarks = trimmed.match(/[.!?]+(?=\s|$)/g)?.length ?? 0
  return Math.max(1, terminalMarks)
}

function includesAnyNeedle(content: string, needles: string[]) {
  const normalized = normalize(content)
  return needles.some((needle) => normalized.includes(normalize(needle)))
}

function topicTerms(topic: string) {
  return Array.from(
    new Set(
      normalize(topic)
        .split(' ')
        .filter((word) => word.length >= 4 && !TOPIC_STOP_WORDS.has(word))
        .slice(0, 8),
    ),
  )
}

function topicCoverage(output: string, topic: string) {
  const terms = topicTerms(topic)
  if (terms.length === 0) {
    return 1
  }

  const normalizedOutput = normalize(output)
  const matches = terms.filter((term) => normalizedOutput.includes(term))
  return matches.length / terms.length
}

function hasMetaOrFormatting(output: string) {
  return META_OR_FORMATTING_PATTERNS.some((pattern) => pattern.test(output))
}

function wordRangeCheck(output: string, min: number, max: number): EvalCheck {
  const actual = words(output).length
  return {
    name: 'word_count_in_range',
    passed: actual >= min && actual <= max,
    actual,
    expected: `${min}-${max} words`,
  }
}

function sentenceRangeCheck(
  output: string,
  min: number,
  max: number,
): EvalCheck {
  const actual = sentenceCount(output)
  return {
    name: 'sentence_count_in_range',
    passed: actual >= min && actual <= max,
    actual,
    expected: `${min}-${max} sentences`,
  }
}

function cleanFormatCheck(output: string): EvalCheck {
  const detected = hasMetaOrFormatting(output)
  return {
    name: 'no_meta_or_markdown_formatting',
    passed: !detected,
    actual: detected,
    expected: 'false',
  }
}

function result(checks: EvalCheck[]): AgentEvalResult {
  const passedChecks = checks.filter((check) => check.passed).length
  return {
    passed: passedChecks === checks.length,
    score:
      checks.length === 0
        ? 0
        : Math.round((passedChecks / checks.length) * 100),
    checks,
  }
}

function stripModelLabels(output: string, modelLabels: string[]) {
  let stripped = output
  for (const label of modelLabels) {
    stripped = stripped.replaceAll(label, ' ')
  }
  return stripped
}

function extractNumbers(value: string) {
  return (
    value.match(/(?<![\p{L}\p{N}.])\d+(?:\.\d+)?(?![\p{L}\p{N}.])/gu) ?? []
  ).map(Number)
}

export function evaluateHostCopy(args: {
  output: string
  topic: string
  theme: SessionTheme
}) {
  const trimmed = args.output.trim()
  const coverage = topicCoverage(trimmed, args.topic)
  const checks: EvalCheck[] = [
    {
      name: 'non_empty_output',
      passed: trimmed.length > 0,
      actual: trimmed.length,
      expected: 'more than 0 characters',
    },
    wordRangeCheck(trimmed, 15, 90),
    sentenceRangeCheck(trimmed, 2, 4),
    {
      name: 'topic_keyword_coverage',
      passed: coverage >= 0.25,
      actual: Number(coverage.toFixed(2)),
      expected: 'at least 0.25',
    },
    {
      name: 'theme_tone_match',
      passed: includesAnyNeedle(trimmed, THEME_TONE_TERMS[args.theme]),
      actual: includesAnyNeedle(trimmed, THEME_TONE_TERMS[args.theme]),
      expected: `at least one ${args.theme} tone marker`,
    },
    cleanFormatCheck(trimmed),
  ]

  return result(checks)
}

export function evaluateCriticCopy(args: {
  output: string
  topic: string
  modelLabels: string[]
  winnerLabels: string[]
}) {
  const trimmed = args.output.trim()
  const normalized = normalize(trimmed)
  const coverage = topicCoverage(trimmed, args.topic)
  const rationaleTerms = [
    'because',
    'why',
    'worked',
    'strong',
    'lacked',
    'weaker',
    'clearer',
    'while',
    'whereas',
    'deoarece',
    'fiindca',
    'pentru ca',
    'mai clar',
  ]
  const mentionsAllModels = args.modelLabels.every((label) =>
    normalized.includes(normalize(label)),
  )
  const mentionsWinners = args.winnerLabels.every((label) =>
    normalized.includes(normalize(label)),
  )

  const checks: EvalCheck[] = [
    {
      name: 'non_empty_output',
      passed: trimmed.length > 0,
      actual: trimmed.length,
      expected: 'more than 0 characters',
    },
    wordRangeCheck(trimmed, 25, 180),
    sentenceRangeCheck(trimmed, 2, 6),
    {
      name: 'topic_keyword_coverage',
      passed: coverage >= 0.2,
      actual: Number(coverage.toFixed(2)),
      expected: 'at least 0.20',
    },
    {
      name: 'mentions_all_models',
      passed: mentionsAllModels,
      actual: mentionsAllModels,
      expected: `all ${args.modelLabels.length} model labels`,
    },
    {
      name: 'mentions_winner',
      passed: mentionsWinners,
      actual: mentionsWinners,
      expected: `all ${args.winnerLabels.length} winner labels`,
    },
    {
      name: 'provides_comparative_rationale',
      passed: includesAnyNeedle(trimmed, rationaleTerms),
      actual: includesAnyNeedle(trimmed, rationaleTerms),
      expected: 'at least one causal or comparative marker',
    },
    cleanFormatCheck(trimmed),
  ]

  return result(checks)
}

export function evaluateStatsCopy(args: {
  output: string
  modelLabels: string[]
  requiredNumbers: number[]
}) {
  const trimmed = args.output.trim()
  const normalized = normalize(trimmed)
  const outputWithoutLabels = stripModelLabels(trimmed, args.modelLabels)
  const reportedNumbers = extractNumbers(outputWithoutLabels)
  const mentionsAllModels = args.modelLabels.every((label) =>
    normalized.includes(normalize(label)),
  )
  const containsRequiredNumbers = args.requiredNumbers.every((value) =>
    reportedNumbers.includes(value),
  )
  const hasUnexpectedNumbers = reportedNumbers.some(
    (value) => !args.requiredNumbers.includes(value),
  )

  const checks: EvalCheck[] = [
    {
      name: 'non_empty_output',
      passed: trimmed.length > 0,
      actual: trimmed.length,
      expected: 'more than 0 characters',
    },
    wordRangeCheck(trimmed, 20, 100),
    sentenceRangeCheck(trimmed, 2, 4),
    {
      name: 'mentions_all_models',
      passed: mentionsAllModels,
      actual: mentionsAllModels,
      expected: `all ${args.modelLabels.length} model labels`,
    },
    {
      name: 'mentions_required_numbers',
      passed: containsRequiredNumbers,
      actual: reportedNumbers.join(', '),
      expected: args.requiredNumbers.join(', '),
    },
    {
      name: 'no_hallucinated_numbers',
      passed: !hasUnexpectedNumbers,
      actual: reportedNumbers.join(', '),
      expected: `only ${args.requiredNumbers.join(', ')}`,
    },
    {
      name: 'stats_focused',
      passed: includesAnyNeedle(trimmed, [
        'vote',
        'votes',
        'split',
        'winner',
        'latency',
        'round',
        'vot',
        'castigator',
        'runda',
      ]),
      actual: includesAnyNeedle(trimmed, [
        'vote',
        'votes',
        'split',
        'winner',
        'latency',
        'round',
        'vot',
        'castigator',
        'runda',
      ]),
      expected: 'a voting or statistical takeaway',
    },
    cleanFormatCheck(trimmed),
  ]

  return result(checks)
}

export function evaluateQualityJudgeScores(
  scores: QualityJudgeScores,
  minimumScore = 4,
) {
  const dimensions = Object.entries(scores) as Array<
    [keyof QualityJudgeScores, number]
  >
  const checks: EvalCheck[] = dimensions.map(([name, score]) => ({
    name: `llm_judge_${name}`,
    passed: score >= minimumScore && score <= 5,
    actual: score,
    expected: `${minimumScore}-5`,
  }))
  const average =
    dimensions.reduce((total, [, score]) => total + score, 0) /
    dimensions.length

  checks.push({
    name: 'llm_judge_average',
    passed: average >= minimumScore && average <= 5,
    actual: Number(average.toFixed(2)),
    expected: `${minimumScore}-5`,
  })

  return result(checks)
}
