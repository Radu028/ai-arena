// @vitest-environment node

import { GoogleGenAI, ThinkingLevel } from '@google/genai'
import OpenAI from 'openai'
import { describe, expect, test } from 'vitest'
import {
  evaluateCriticCopy,
  evaluateHostCopy,
  evaluateQualityJudgeScores,
  evaluateStatsCopy,
} from './agent-evals'
import type { AgentEvalResult, QualityJudgeScores } from './agent-evals'

const runLiveEvals = process.env.RUN_LIVE_AGENT_EVALS === 'true'
const liveTest = runLiveEvals ? test : test.skip

function requireEnvironment(name: 'OPENAI_API_KEY' | 'GOOGLE_AI_API_KEY') {
  const value = process.env[name]
  if (!value) {
    throw new Error(`${name} is required when RUN_LIVE_AGENT_EVALS=true.`)
  }
  return value
}

async function generateOpenAiOutput(prompt: string) {
  const client = new OpenAI({ apiKey: requireEnvironment('OPENAI_API_KEY') })
  const response = await client.responses.create({
    model: 'gpt-5-mini',
    input: prompt,
    max_output_tokens: 500,
    reasoning: { effort: 'minimal' },
  })
  return response.output_text.trim()
}

async function generateGoogleOutput(prompt: string) {
  const client = new GoogleGenAI({
    apiKey: requireEnvironment('GOOGLE_AI_API_KEY'),
  })
  const response = await client.models.generateContent({
    model: 'gemini-3.1-flash-lite',
    contents: prompt,
    config: {
      maxOutputTokens: 500,
      thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL },
    },
  })
  return (response.text ?? '').trim()
}

function parseJudgeScores(output: string): QualityJudgeScores {
  const cleaned = output
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim()
  const parsed = JSON.parse(cleaned) as Partial<QualityJudgeScores>
  const scores = {
    relevance: parsed.relevance,
    clarity: parsed.clarity,
    tone: parsed.tone,
    usefulness: parsed.usefulness,
  }

  for (const [name, score] of Object.entries(scores)) {
    if (typeof score !== 'number' || !Number.isFinite(score)) {
      throw new Error(`The quality judge returned an invalid ${name} score.`)
    }
  }

  return scores as QualityJudgeScores
}

async function judgeOutput(args: {
  role: string
  task: string
  output: string
}) {
  const prompt = [
    'You are an impartial evaluator of an AI agent response.',
    `Agent role: ${args.role}.`,
    `Task: ${args.task}`,
    `Response: ${args.output}`,
    'Score relevance, clarity, tone, and usefulness from 1 to 5.',
    'Use 4 only for a response that is clearly good and 5 only for excellent.',
    'Return only JSON with numeric keys relevance, clarity, tone, usefulness.',
  ].join('\n')
  return parseJudgeScores(await generateOpenAiOutput(prompt))
}

function expectPassing(
  output: string,
  deterministic: AgentEvalResult,
  judged: AgentEvalResult,
) {
  expect(
    {
      output,
      deterministicScore: deterministic.score,
      deterministicChecks: deterministic.checks,
      judgeScore: judged.score,
      judgeChecks: judged.checks,
    },
    'Live agent output did not meet the committed quality thresholds.',
  ).toSatisfy(() => deterministic.passed && judged.passed)
}

describe('live agent output evals', () => {
  liveTest(
    'Host output meets deterministic metrics and LLM quality scores',
    async () => {
      const topic = 'Debugging a smart toaster before breakfast'
      const task =
        'Introduce a comedy round in 2-4 sentences and 15-90 words. Mention the topic and use a playful stage-ready tone.'
      const output = await generateOpenAiOutput(
        `You are the Host of AI Arena. ${task} Topic: ${topic}. Return only audience-facing copy.`,
      )

      expectPassing(
        output,
        evaluateHostCopy({ output, topic, theme: 'comedy' }),
        evaluateQualityJudgeScores(
          await judgeOutput({ role: 'Host', task, output }),
        ),
      )
    },
    60_000,
  )

  liveTest(
    'Critic output meets coverage, reasoning, and LLM quality scores',
    async () => {
      const topic = 'Should autonomous delivery drones be regulated in cities?'
      const modelLabels = [
        'OpenAI GPT-5.5',
        'Claude Sonnet 4.6',
        'Gemini 3.1 Pro',
      ]
      const winnerLabels = ['Claude Sonnet 4.6']
      const task =
        'Write a 2-6 sentence, 25-180 word comparative analysis. Discuss every model, explain why the winner worked, and stay focused on the topic.'
      const output = await generateOpenAiOutput(
        [
          'You are the Critic for AI Arena.',
          task,
          `Topic: ${topic}`,
          `Winner: ${winnerLabels.join(', ')}`,
          'OpenAI GPT-5.5 argued for unrestricted delivery efficiency.',
          'Claude Sonnet 4.6 balanced safety rules with practical benefits.',
          'Gemini 3.1 Pro focused on privacy but gave few enforcement details.',
          'Return only the final analysis.',
        ].join('\n'),
      )

      expectPassing(
        output,
        evaluateCriticCopy({
          output,
          topic,
          modelLabels,
          winnerLabels,
        }),
        evaluateQualityJudgeScores(
          await judgeOutput({ role: 'Critic', task, output }),
        ),
      )
    },
    60_000,
  )

  liveTest(
    'Stats output preserves supplied facts and meets LLM quality scores',
    async () => {
      const modelLabels = ['OpenAI GPT-5.5', 'Gemini 3 Flash']
      const requiredNumbers = [4, 2]
      const task =
        'Summarize the result in 2-4 sentences and 20-100 words. Mention both models, preserve the exact vote values, add no other numeric values, identify the winner, and explain the relative margin in plain language.'
      const output = await generateGoogleOutput(
        [
          'You are the Stats Analyst for AI Arena.',
          task,
          'OpenAI GPT-5.5 received 4 votes.',
          'Gemini 3 Flash received 2 votes.',
          'Explain that the winner received twice as many votes and had a clear lead.',
          'Return only the final audience-facing summary.',
        ].join('\n'),
      )

      expectPassing(
        output,
        evaluateStatsCopy({ output, modelLabels, requiredNumbers }),
        evaluateQualityJudgeScores(
          await judgeOutput({ role: 'Stats Analyst', task, output }),
        ),
      )
    },
    60_000,
  )
})
