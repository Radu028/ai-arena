'use node'

import Anthropic from '@anthropic-ai/sdk'
import { GoogleGenAI, ThinkingLevel } from '@google/genai'
import { Mistral } from '@mistralai/mistralai'
import OpenAI from 'openai'
import type { Doc } from './_generated/dataModel'
import { internal } from './_generated/api'
import { internalAction } from './_generated/server'
import { v } from 'convex/values'
import {
  AGENT_TIMEOUT_MS,
  CRITIC_AGENT_DEFAULT_MODEL,
  AGENT_MAX_OUTPUT_TOKENS,
  HOST_AGENT_DEFAULT_MODEL,
  JUDGE_MAX_OUTPUT_TOKENS,
  PROVIDER_TIMEOUT_MS,
  ROUND_MAX_OUTPUT_TOKENS,
  RESPONSE_LANGUAGE_COPY,
  STATS_AGENT_DEFAULT_MODEL,
  getModelByKey,
  parseJudgeDecision,
} from '../shared/arena'
import type {
  ResponseLanguage,
  SessionModelSnapshot,
  ThemeCopy,
} from '../shared/arena'

type UsageShape = {
  input: number | null
  output: number | null
}

type TextResult = {
  status: 'success' | 'timeout' | 'error' | 'skipped'
  text: string | null
  usage: UsageShape
  errorCode: string | null
  errorMessage: string | null
  latencyMs: number | null
}

type RoundGenerationContext = {
  session: Doc<'sessions'>
  round: Doc<'rounds'>
  responses: Array<Doc<'roundResponses'>>
  themeCopy: ThemeCopy
}

type RoundReviewContext = {
  session: Doc<'sessions'>
  round: Doc<'rounds'>
  responses: Array<Doc<'roundResponses'>>
  humanVotes: Array<Doc<'roundVotes'>>
  aiVotes: Array<Doc<'roundAiVotes'>>
  nextRound: Doc<'rounds'> | null
  themeCopy: ThemeCopy
}

type JudgeCandidate = {
  responseId: Doc<'roundResponses'>['_id']
  slot: string
  modelKey: string
  text: string
}

function providerTimeout<T>(promise: Promise<T>, ms: number) {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error('TIMEOUT'))
    }, ms)

    promise.then(
      (value) => {
        clearTimeout(timer)
        resolve(value)
      },
      (error) => {
        clearTimeout(timer)
        reject(error)
      },
    )
  })
}

function getSessionResponseLanguage(
  session: Doc<'sessions'>,
): ResponseLanguage {
  return session.responseLanguage ?? 'english'
}

function getSessionCustomPrompt(session: Doc<'sessions'>) {
  const prompt = session.customPrompt?.trim()
  return prompt ? truncateForPrompt(prompt, 500) : null
}

function languageInstruction(language: ResponseLanguage) {
  return RESPONSE_LANGUAGE_COPY[language].instruction
}

function makeFallbackCopy(
  topic: string,
  modelLabel: string,
  language: ResponseLanguage,
) {
  if (language === 'romanian') {
    return `${modelLabel} nu a putut apela API-ul live, asa ca AI Arena foloseste un raspuns fallback pentru tema "${topic}". Varianta sigura este: fii clar, concret si termina cu o poanta memorabila.`
  }
  return `${modelLabel} missed the live API call, so AI Arena is using a house fallback on the topic "${topic}". The safest version is: stay clear, be specific, and land one memorable line.`
}

function makeDemoJudgeDecision(prompt: string) {
  const firstCandidateSlot = prompt.match(/^\[([A-Z]+)\]\s/m)?.[1] ?? 'A'
  return JSON.stringify({
    slot: firstCandidateSlot,
    rationale: 'Demo judge vote.',
  })
}

function cleanModelResponseText(text: string) {
  return text
    .trim()
    .replace(/^```(?:\w+)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .replace(
      /^(sigur|desigur|bineinteles|bineînțeles|sure|of course|certainly)[,!\s:.–-]*(uite|iat[ăa]|here(?:'s| is))?[^:\n]{0,80}:\s*/i,
      '',
    )
    .replace(/^\s*(?:[-*_]\s*){3,}$/gm, '')
    .replace(/^[*_#\s-]*(glum[ăa]|joke)\s*:\s*/i, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function getAgentFallback(
  role: 'host' | 'critic' | 'stats',
  language: ResponseLanguage,
) {
  if (language === 'romanian') {
    if (role === 'host') {
      return 'Hostul este temporar offline. Runda continua fara comentariu.'
    }
    if (role === 'stats') {
      return 'Stats Analyst este temporar offline. Totalurile voturilor salvate raman sursa de adevar.'
    }
    return 'Criticul este temporar offline. Rezultatul rundei ramane valid fara analiza.'
  }
  if (role === 'host') {
    return 'Host temporarily offline. The round continues without commentary.'
  }
  if (role === 'stats') {
    return 'Stats Analyst temporarily offline. The saved vote totals remain the source of truth.'
  }
  return 'Critic temporarily offline. The round result still stands without analysis.'
}

function truncateForPrompt(value: string, maxChars: number) {
  if (value.length <= maxChars) {
    return value
  }
  return `${value.slice(0, maxChars).trimEnd()}...`
}

function narrowModelSnapshots(
  snapshots: Doc<'sessions'>['selectedModelsSnapshot'],
): SessionModelSnapshot[] {
  return snapshots.map((snapshot) => {
    const model = getModelByKey(snapshot.key)
    if (!model || model.providerKey !== snapshot.providerKey) {
      throw new Error(`Unsupported model snapshot: ${snapshot.key}`)
    }
    return {
      ...snapshot,
      providerKey: model.providerKey,
    }
  })
}

function buildRoundPrompt(args: {
  theme: ThemeCopy
  topic: string
  model: SessionModelSnapshot
  customPrompt: string | null
  responseLanguage: ResponseLanguage
}) {
  const formatInstruction =
    args.theme.label === 'Comedy Roast'
      ? `For comedy, write one short joke with a fast setup and punchline. Stay under 240 characters and never add commentary after the punchline.`
      : `Keep the answer compact enough to read and compare quickly during a live vote.`
  const lines = [
    `You are competing in an AI Arena round.`,
    `Theme: ${args.theme.label}.`,
    `Theme guidance: focus on ${args.theme.criticAngle}.`,
    `Your style brief: ${args.model.description}.`,
    `Topic: ${args.topic}`,
    languageInstruction(args.responseLanguage),
    `Write one strong answer. Keep it concise, high-signal, audience-ready, and original.`,
    formatInstruction,
    `Return only the final audience-facing text. Do not preface it with "sure", "here is", explanations, labels, markdown fences, horizontal rules, or decorative separators.`,
    `If this is a comedy prompt, output only the joke itself.`,
    `Do not mention your model name.`,
  ]
  if (args.customPrompt) {
    lines.splice(
      5,
      0,
      `Custom arena brief: ${args.customPrompt}`,
      `Follow the custom brief when choosing examples, jokes, framing, and tone.`,
    )
  }
  return lines.join('\n')
}

function buildHostPrompt(args: {
  phase: 'intro' | 'transition' | 'recap'
  themeLabel: string
  hostTone: string
  topic?: string
  models?: string[]
  winnerSummary?: string
  scoreboardSummary?: string
  customPrompt: string | null
  responseLanguage: ResponseLanguage
}) {
  const lines = [
    `You are the Host / MC for a live AI Arena.`,
    `Adopt a ${args.hostTone} voice.`,
    `Theme: ${args.themeLabel}.`,
    languageInstruction(args.responseLanguage),
  ]
  if (args.customPrompt) {
    lines.push(`Custom arena brief: ${args.customPrompt}`)
  }
  if (args.phase === 'intro' && args.topic) {
    lines.push(`Introduce the round topic: ${args.topic}`)
    lines.push(
      `Mention the participating models without giving away any result: ${args.models?.join(', ') ?? 'AI models'}.`,
    )
  }
  if (args.phase === 'transition' && args.winnerSummary) {
    lines.push(
      `Bridge from the previous round using this outcome: ${args.winnerSummary}`,
    )
  }
  if (args.phase === 'recap' && args.scoreboardSummary) {
    lines.push(
      `Recap the finished session using this scoreboard summary: ${args.scoreboardSummary}`,
    )
  }
  lines.push('Keep it to 2-4 sentences and make it feel like live event copy.')
  return lines.join('\n')
}

function buildCriticPrompt(args: {
  themeLabel: string
  criticAngle: string
  topic: string
  responses: Array<{ slot: string; modelLabel: string; text: string }>
  winnerSlots: string[]
  customPrompt: string | null
  responseLanguage: ResponseLanguage
}) {
  const lines = [
    `You are the Critic for AI Arena.`,
    `Theme: ${args.themeLabel}.`,
    `Explain the result in terms of ${args.criticAngle}.`,
    `Topic: ${args.topic}`,
    languageInstruction(args.responseLanguage),
    `Winning slot(s): ${args.winnerSlots.join(', ') || 'none'}.`,
    `Responses:`,
    ...args.responses.map(
      (response) =>
        `[${response.slot}] ${response.modelLabel}: ${truncateForPrompt(response.text, 800)}`,
    ),
    `Write one compact analysis that covers every response, why the winner worked, and what the others lacked.`,
  ]
  if (args.customPrompt) {
    lines.splice(4, 0, `Custom arena brief: ${args.customPrompt}`)
  }
  return lines.join('\n')
}

function buildStatsPrompt(args: {
  roundNumber: number
  topic: string
  winnerLabels: string[]
  rows: Array<{
    slot: string
    modelLabel: string
    status: string
    votes: number
    latencyMs: number | null
    isWinner: boolean
  }>
  humanVotes: number
  aiVotes: number
  customPrompt: string | null
  responseLanguage: ResponseLanguage
}) {
  const lines = [
    `You are the Stats Analyst agent for AI Arena.`,
    `Round: ${args.roundNumber}.`,
    `Topic: ${args.topic}`,
    languageInstruction(args.responseLanguage),
    `Human votes: ${args.humanVotes}. AI judge votes: ${args.aiVotes}.`,
    `Winner(s): ${args.winnerLabels.join(', ') || 'none'}.`,
    `Rows:`,
    ...args.rows.map((row) =>
      [
        `[${row.slot}] ${row.modelLabel}`,
        `status=${row.status}`,
        `votes=${row.votes}`,
        `latencyMs=${row.latencyMs ?? 'n/a'}`,
        `winner=${row.isWinner ? 'yes' : 'no'}`,
      ].join(' | '),
    ),
    `Write 2-3 concise sentences with the key voting/statistical takeaway. Do not critique writing quality; focus on numbers, winners, vote split, and reliability.`,
  ]
  if (args.customPrompt) {
    lines.splice(3, 0, `Custom arena brief: ${args.customPrompt}`)
  }
  return lines.join('\n')
}

function buildJudgePrompt(args: {
  themeLabel: string
  judgeStyle: string
  topic: string
  candidates: Array<{ slot: string; text: string }>
  customPrompt: string | null
  responseLanguage: ResponseLanguage
}) {
  const lines = [
    `You are judging an AI Arena round.`,
    `Theme: ${args.themeLabel}.`,
    `Judge style: ${args.judgeStyle}.`,
    `Topic: ${args.topic}`,
    languageInstruction(args.responseLanguage),
    `Choose the best response among the candidates.`,
    `Return strict JSON like {"slot":"A","rationale":"..."} and nothing else. Keep the rationale under 120 characters.`,
    ...args.candidates.map(
      (candidate) =>
        `[${candidate.slot}] ${truncateForPrompt(candidate.text, 700)}`,
    ),
  ]
  if (args.customPrompt) {
    lines.splice(4, 0, `Custom arena brief: ${args.customPrompt}`)
  }
  return lines.join('\n')
}

function summarizeScoreboard(
  entries: Array<{ label: string; wins: number; totalVotes: number }>,
) {
  return entries
    .map(
      (entry) =>
        `${entry.label}: ${entry.wins} wins, ${entry.totalVotes} votes`,
    )
    .join(' | ')
}

function buildStatsFallback(args: {
  roundNumber: number
  winnerLabels: string[]
  humanVotes: number
  aiVotes: number
  rows: Array<{ modelLabel: string; votes: number; isWinner: boolean }>
  responseLanguage: ResponseLanguage
}) {
  const winners = args.winnerLabels.join(', ') || 'No winner'
  const voteSplit = args.rows
    .map((row) => `${row.modelLabel}: ${row.votes}`)
    .join(' | ')
  if (args.responseLanguage === 'romanian') {
    return `Stats Analyst: Runda ${args.roundNumber} s-a incheiat cu ${args.humanVotes} vot(uri) umane si ${args.aiVotes} vot(uri) AI. Castigator: ${winners}. Impartirea voturilor: ${voteSplit}.`
  }
  return `Stats Analyst: Round ${args.roundNumber} finished with ${args.humanVotes} human vote(s) and ${args.aiVotes} AI judge vote(s). Winner: ${winners}. Vote split: ${voteSplit}.`
}

async function generateWithOpenAI(
  modelId: string,
  apiKey: string,
  prompt: string,
  maxOutputTokens: number,
  baseURL?: string,
) {
  const client = new OpenAI({
    apiKey,
    baseURL,
  })
  const response = await client.responses.create({
    model: modelId,
    input: prompt,
    max_output_tokens: maxOutputTokens,
    reasoning: {
      effort: modelId === 'gpt-5-mini' ? 'minimal' : 'none',
    },
  })
  return {
    text: response.output_text,
    usage: {
      input: response.usage?.input_tokens ?? null,
      output: response.usage?.output_tokens ?? null,
    },
  }
}

async function generateWithOpenAICompatibleChat(
  modelId: string,
  apiKey: string,
  prompt: string,
  maxOutputTokens: number,
  baseURL: string,
) {
  const client = new OpenAI({
    apiKey,
    baseURL,
  })
  const response = await client.chat.completions.create({
    model: modelId,
    messages: [{ role: 'user', content: prompt }],
    max_completion_tokens: maxOutputTokens,
    temperature: 0.8,
  })
  return {
    text: response.choices[0]?.message?.content ?? '',
    usage: {
      input: response.usage?.prompt_tokens ?? null,
      output: response.usage?.completion_tokens ?? null,
    },
  }
}

async function generateWithAnthropic(
  modelId: string,
  apiKey: string,
  prompt: string,
  maxOutputTokens: number,
) {
  const client = new Anthropic({ apiKey })
  const response = await client.messages.create({
    model: modelId,
    max_tokens: maxOutputTokens,
    messages: [{ role: 'user', content: prompt }],
  })
  const blocks = response.content
    .filter((block) => block.type === 'text')
    .map((block) => block.text)
  return {
    text: blocks.join('\n\n'),
    usage: {
      input: response.usage.input_tokens,
      output: response.usage.output_tokens,
    },
  }
}

async function generateWithGoogle(
  modelId: string,
  apiKey: string,
  prompt: string,
  maxOutputTokens: number,
  responseJsonSchema?: unknown,
) {
  const client = new GoogleGenAI({ apiKey })
  const thinkingLevel = getGeminiThinkingLevel(
    modelId,
    Boolean(responseJsonSchema),
  )
  const response = await client.models.generateContent({
    model: modelId,
    contents: prompt,
    config: {
      maxOutputTokens,
      ...(thinkingLevel
        ? {
            thinkingConfig: {
              thinkingLevel,
            },
          }
        : {}),
      ...(responseJsonSchema
        ? {
            responseMimeType: 'application/json',
            responseJsonSchema,
          }
        : {}),
    },
  })
  return {
    text: response.text ?? '',
    usage: {
      input: response.usageMetadata?.promptTokenCount ?? null,
      output: response.usageMetadata?.candidatesTokenCount ?? null,
    },
  }
}

function getGeminiThinkingLevel(
  modelId: string,
  structuredOutput: boolean,
): ThinkingLevel | null {
  if (!modelId.startsWith('gemini-3')) {
    return null
  }

  if (modelId.includes('flash-lite')) {
    return ThinkingLevel.MINIMAL
  }

  if (modelId.includes('flash')) {
    return structuredOutput ? ThinkingLevel.MINIMAL : ThinkingLevel.LOW
  }

  return ThinkingLevel.LOW
}

function buildJudgeResponseJsonSchema(prompt: string) {
  const slots = Array.from(prompt.matchAll(/^\[([A-Z]+)\]\s/gm), (match) => {
    return match[1]
  })
  return {
    type: 'object',
    properties: {
      slot: {
        type: 'string',
        enum: slots,
      },
      rationale: {
        type: 'string',
      },
    },
    required: ['slot', 'rationale'],
    additionalProperties: false,
  }
}

async function generateWithMistral(
  modelId: string,
  apiKey: string,
  prompt: string,
  maxOutputTokens: number,
) {
  const client = new Mistral({ apiKey })
  const response = await client.chat.complete({
    model: modelId,
    messages: [{ role: 'user', content: prompt }],
    maxTokens: maxOutputTokens,
    responseFormat: { type: 'text' },
  })
  const content = response.choices[0]?.message?.content
  const text =
    typeof content === 'string'
      ? content
      : Array.isArray(content)
        ? content
            .map((item) =>
              typeof item === 'string' ? item : 'text' in item ? item.text : '',
            )
            .join('\n')
        : ''
  return {
    text,
    usage: {
      input: response.usage.promptTokens ?? null,
      output: response.usage.completionTokens ?? null,
    },
  }
}

async function callProvider(
  model: SessionModelSnapshot,
  prompt: string,
  topic: string,
  responseLanguage: ResponseLanguage,
  purpose: 'round' | 'judge' = 'round',
): Promise<TextResult> {
  const start = Date.now()
  try {
    const demoMode = process.env.AI_ARENA_DEMO_MODE === 'true'
    if (demoMode) {
      return {
        status: 'success',
        text:
          purpose === 'judge'
            ? makeDemoJudgeDecision(prompt)
            : makeFallbackCopy(topic, model.label, responseLanguage),
        usage: { input: null, output: null },
        errorCode: null,
        errorMessage: null,
        latencyMs: Date.now() - start,
      }
    }

    let result: { text: string; usage: UsageShape } | null = null
    const maxOutputTokens =
      purpose === 'judge' ? JUDGE_MAX_OUTPUT_TOKENS : ROUND_MAX_OUTPUT_TOKENS

    switch (model.providerKey) {
      case 'openai': {
        const apiKey = process.env.OPENAI_API_KEY
        if (!apiKey) {
          return {
            status: 'skipped',
            text: makeFallbackCopy(topic, model.label, responseLanguage),
            usage: { input: null, output: null },
            errorCode: 'OPENAI_KEY_MISSING',
            errorMessage: 'OPENAI_API_KEY is not configured.',
            latencyMs: Date.now() - start,
          }
        }
        result = await providerTimeout(
          generateWithOpenAI(model.modelId, apiKey, prompt, maxOutputTokens),
          PROVIDER_TIMEOUT_MS,
        )
        break
      }
      case 'xai': {
        const apiKey = process.env.XAI_API_KEY
        if (!apiKey) {
          return {
            status: 'skipped',
            text: makeFallbackCopy(topic, model.label, responseLanguage),
            usage: { input: null, output: null },
            errorCode: 'XAI_KEY_MISSING',
            errorMessage: 'XAI_API_KEY is not configured.',
            latencyMs: Date.now() - start,
          }
        }
        result = await providerTimeout(
          generateWithOpenAICompatibleChat(
            model.modelId,
            apiKey,
            prompt,
            maxOutputTokens,
            'https://api.x.ai/v1',
          ),
          PROVIDER_TIMEOUT_MS,
        )
        break
      }
      case 'anthropic': {
        const apiKey = process.env.ANTHROPIC_API_KEY
        if (!apiKey) {
          return {
            status: 'skipped',
            text: makeFallbackCopy(topic, model.label, responseLanguage),
            usage: { input: null, output: null },
            errorCode: 'ANTHROPIC_KEY_MISSING',
            errorMessage: 'ANTHROPIC_API_KEY is not configured.',
            latencyMs: Date.now() - start,
          }
        }
        result = await providerTimeout(
          generateWithAnthropic(model.modelId, apiKey, prompt, maxOutputTokens),
          PROVIDER_TIMEOUT_MS,
        )
        break
      }
      case 'google': {
        const apiKey = process.env.GOOGLE_AI_API_KEY
        if (!apiKey) {
          return {
            status: 'skipped',
            text: makeFallbackCopy(topic, model.label, responseLanguage),
            usage: { input: null, output: null },
            errorCode: 'GOOGLE_KEY_MISSING',
            errorMessage: 'GOOGLE_AI_API_KEY is not configured.',
            latencyMs: Date.now() - start,
          }
        }
        result = await providerTimeout(
          generateWithGoogle(
            model.modelId,
            apiKey,
            prompt,
            maxOutputTokens,
            purpose === 'judge'
              ? buildJudgeResponseJsonSchema(prompt)
              : undefined,
          ),
          PROVIDER_TIMEOUT_MS,
        )
        break
      }
      case 'mistral': {
        const apiKey = process.env.MISTRAL_API_KEY
        if (!apiKey) {
          return {
            status: 'skipped',
            text: makeFallbackCopy(topic, model.label, responseLanguage),
            usage: { input: null, output: null },
            errorCode: 'MISTRAL_KEY_MISSING',
            errorMessage: 'MISTRAL_API_KEY is not configured.',
            latencyMs: Date.now() - start,
          }
        }
        result = await providerTimeout(
          generateWithMistral(model.modelId, apiKey, prompt, maxOutputTokens),
          PROVIDER_TIMEOUT_MS,
        )
        break
      }
    }

    const text = cleanModelResponseText(result.text)
    if (!text) {
      return {
        status: 'error',
        text: null,
        usage: result.usage,
        errorCode: 'EMPTY_RESPONSE',
        errorMessage: 'The provider returned an empty response.',
        latencyMs: Date.now() - start,
      }
    }

    return {
      status: 'success',
      text,
      usage: result.usage,
      errorCode: null,
      errorMessage: null,
      latencyMs: Date.now() - start,
    }
  } catch (error) {
    if (error instanceof Error && error.message === 'TIMEOUT') {
      return {
        status: 'timeout',
        text: null,
        usage: { input: null, output: null },
        errorCode: 'TIMEOUT',
        errorMessage: `Generation timed out after ${PROVIDER_TIMEOUT_MS / 1000} seconds.`,
        latencyMs: Date.now() - start,
      }
    }

    return {
      status: 'error',
      text: null,
      usage: { input: null, output: null },
      errorCode: 'PROVIDER_ERROR',
      errorMessage:
        error instanceof Error ? error.message : 'Unknown provider failure.',
      latencyMs: Date.now() - start,
    }
  }
}

async function generateAgentCopy(args: {
  role: 'host' | 'critic'
  prompt: string
  fallback: string
}) {
  const start = Date.now()
  const modelId =
    args.role === 'host'
      ? (process.env.HOST_AGENT_MODEL ?? HOST_AGENT_DEFAULT_MODEL)
      : (process.env.CRITIC_AGENT_MODEL ?? CRITIC_AGENT_DEFAULT_MODEL)

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey || process.env.AI_ARENA_DEMO_MODE === 'true') {
    return {
      status: 'fallback' as const,
      content: args.fallback,
      modelId,
      failureReason: apiKey
        ? 'Demo mode is enabled.'
        : 'OPENAI_API_KEY is not configured.',
      latencyMs: Date.now() - start,
    }
  }

  try {
    const result = await providerTimeout(
      generateWithOpenAI(modelId, apiKey, args.prompt, AGENT_MAX_OUTPUT_TOKENS),
      AGENT_TIMEOUT_MS,
    )
    const content = cleanModelResponseText(result.text)
    if (!content) {
      return {
        status: 'fallback' as const,
        content: args.fallback,
        modelId,
        failureReason: 'The agent returned an empty response.',
        latencyMs: Date.now() - start,
      }
    }
    return {
      status: 'success' as const,
      content,
      modelId,
      failureReason: null,
      latencyMs: Date.now() - start,
    }
  } catch (error) {
    return {
      status: 'fallback' as const,
      content: args.fallback,
      modelId,
      failureReason: error instanceof Error ? error.message : 'Agent failure.',
      latencyMs: Date.now() - start,
    }
  }
}

async function generateStatsAgentCopy(args: {
  prompt: string
  fallback: string
}) {
  const start = Date.now()
  const modelId = process.env.STATS_AGENT_MODEL ?? STATS_AGENT_DEFAULT_MODEL
  const apiKey = process.env.GOOGLE_AI_API_KEY

  if (!apiKey || process.env.AI_ARENA_DEMO_MODE === 'true') {
    return {
      status: 'fallback' as const,
      content: args.fallback,
      modelId,
      failureReason: apiKey
        ? 'Demo mode is enabled.'
        : 'GOOGLE_AI_API_KEY is not configured.',
      latencyMs: Date.now() - start,
    }
  }

  try {
    const result = await providerTimeout(
      generateWithGoogle(modelId, apiKey, args.prompt, AGENT_MAX_OUTPUT_TOKENS),
      AGENT_TIMEOUT_MS,
    )
    const content = cleanModelResponseText(result.text)
    if (!content) {
      return {
        status: 'fallback' as const,
        content: args.fallback,
        modelId,
        failureReason: 'The stats agent returned an empty response.',
        latencyMs: Date.now() - start,
      }
    }
    return {
      status: 'success' as const,
      content,
      modelId,
      failureReason: null,
      latencyMs: Date.now() - start,
    }
  } catch (error) {
    return {
      status: 'fallback' as const,
      content: args.fallback,
      modelId,
      failureReason:
        error instanceof Error ? error.message : 'Stats agent failure.',
      latencyMs: Date.now() - start,
    }
  }
}

export const generateRound = internalAction({
  args: {
    sessionId: v.id('sessions'),
    roundId: v.id('rounds'),
  },
  handler: async (ctx, args) => {
    const context: RoundGenerationContext | null = await ctx.runQuery(
      internal.state.getRoundGenerationContext,
      args,
    )
    if (
      !context ||
      context.session.status !== 'active' ||
      context.round.status !== 'generating'
    ) {
      return null
    }
    const responseLanguage = getSessionResponseLanguage(context.session)
    const customPrompt = getSessionCustomPrompt(context.session)

    const hostPrompt = buildHostPrompt({
      phase: 'intro',
      themeLabel: context.themeCopy.label,
      hostTone: context.themeCopy.hostTone,
      topic: context.round.topic ?? 'Untitled topic',
      models: narrowModelSnapshots(context.session.selectedModelsSnapshot).map(
        (model) => model.label,
      ),
      customPrompt,
      responseLanguage,
    })
    const hostCopy = await generateAgentCopy({
      role: 'host',
      prompt: hostPrompt,
      fallback: getAgentFallback('host', responseLanguage),
    })
    await ctx.runMutation(internal.state.saveArtifact, {
      sessionId: context.session._id,
      roundId: context.round._id,
      type: 'host_intro',
      status: hostCopy.status,
      content: hostCopy.content,
      modelId: hostCopy.modelId,
      failureReason: hostCopy.failureReason,
    })

    const sessionModels = narrowModelSnapshots(
      context.session.selectedModelsSnapshot,
    )

    await Promise.all(
      sessionModels.map(async (model) => {
        const prompt = buildRoundPrompt({
          theme: context.themeCopy,
          topic: context.round.topic ?? 'Untitled topic',
          model,
          customPrompt,
          responseLanguage,
        })
        const result = await callProvider(
          model,
          prompt,
          context.round.topic ?? 'Untitled topic',
          responseLanguage,
        )
        await ctx.runMutation(internal.state.saveModelResponse, {
          sessionId: context.session._id,
          roundId: context.round._id,
          modelKey: model.key,
          status: result.status,
          responseText: result.text,
          latencyMs: result.latencyMs,
          tokenUsageInput: result.usage.input,
          tokenUsageOutput: result.usage.output,
          errorCode: result.errorCode,
          errorMessage: result.errorMessage,
        })
      }),
    )

    const refreshed: RoundGenerationContext | null = await ctx.runQuery(
      internal.state.getRoundGenerationContext,
      args,
    )
    if (!refreshed) {
      return null
    }

    const eligibleResponses = refreshed.responses.filter(
      (response) =>
        response.status === 'success' && Boolean(response.responseText),
    )

    if (eligibleResponses.length === 0) {
      await ctx.runMutation(internal.state.finalizeRound, {
        sessionId: refreshed.session._id,
        roundId: refreshed.round._id,
        triggeredBy: 'system',
      })
      return null
    }

    const reviewContext: RoundReviewContext | null = await ctx.runQuery(
      internal.state.getRoundReviewContext,
      args,
    )
    if (!reviewContext || reviewContext.round.status !== 'generating') {
      return null
    }
    const reviewResponseLanguage = getSessionResponseLanguage(
      reviewContext.session,
    )
    const reviewCustomPrompt = getSessionCustomPrompt(reviewContext.session)

    const candidates: JudgeCandidate[] = reviewContext.responses
      .filter(
        (response) =>
          response.status === 'success' && Boolean(response.responseText),
      )
      .map((response) => ({
        responseId: response._id,
        slot: response.anonymizedSlot,
        modelKey: response.modelKey,
        text: response.responseText ?? '',
      }))

    await Promise.all(
      reviewContext.responses
        .filter(
          (response) =>
            response.status === 'success' && Boolean(response.responseText),
        )
        .map(async (voter) => {
          const reviewModels = narrowModelSnapshots(
            reviewContext.session.selectedModelsSnapshot,
          )
          const voterModel = reviewModels.find(
            (model) => model.key === voter.modelKey,
          )
          if (!voterModel) {
            return
          }
          const candidatePool = candidates.filter(
            (candidate) => candidate.modelKey !== voter.modelKey,
          )
          if (candidatePool.length === 0) {
            return
          }

          const judgePrompt = buildJudgePrompt({
            themeLabel: reviewContext.themeCopy.label,
            judgeStyle:
              reviewModels.find((model) => model.key === voter.modelKey)
                ?.description ?? 'clear and fair',
            topic: reviewContext.round.topic ?? 'Untitled topic',
            candidates: candidatePool.map((candidate) => ({
              slot: candidate.slot,
              text: candidate.text,
            })),
            customPrompt: reviewCustomPrompt,
            responseLanguage: reviewResponseLanguage,
          })

          const decision = await callProvider(
            voterModel,
            judgePrompt,
            reviewContext.round.topic ?? 'Untitled topic',
            reviewResponseLanguage,
            'judge',
          )
          const parsed = decision.text
            ? parseJudgeDecision(
                decision.text,
                candidatePool.map((candidate) => candidate.slot),
              )
            : null
          if (decision.status !== 'success' || !parsed) {
            console.warn(
              `AI judge skipped for ${voter.modelKey}: ${
                decision.errorCode ??
                (decision.status === 'success'
                  ? 'INVALID_JUDGE_DECISION'
                  : 'UNKNOWN_JUDGE_FAILURE')
              }`,
            )
            return
          }
          const chosen = candidatePool.find(
            (candidate) => candidate.slot === parsed.slot,
          )

          if (!chosen) {
            return
          }

          await ctx.runMutation(internal.state.saveAiVote, {
            roundId: reviewContext.round._id,
            voterModelKey: voter.modelKey,
            responseId: chosen.responseId,
            rationale: parsed.rationale,
          })
        }),
    )

    await ctx.runMutation(internal.state.openVoting, {
      sessionId: refreshed.session._id,
      roundId: refreshed.round._id,
    })

    return null
  },
})

export const afterRoundFinalized = internalAction({
  args: {
    sessionId: v.id('sessions'),
    roundId: v.id('rounds'),
    nextRoundId: v.union(v.id('rounds'), v.null()),
    isLastRound: v.boolean(),
  },
  handler: async (ctx, args) => {
    const reviewContext: RoundReviewContext | null = await ctx.runQuery(
      internal.state.getRoundReviewContext,
      {
        sessionId: args.sessionId,
        roundId: args.roundId,
      },
    )
    if (!reviewContext) {
      return null
    }
    const responseLanguage = getSessionResponseLanguage(reviewContext.session)
    const customPrompt = getSessionCustomPrompt(reviewContext.session)

    const winnerSlots = reviewContext.responses
      .filter((response) =>
        reviewContext.round.winnerResponseIds.includes(response._id),
      )
      .map((response) => response.anonymizedSlot)
    const criticPrompt = buildCriticPrompt({
      themeLabel: reviewContext.themeCopy.label,
      criticAngle: reviewContext.themeCopy.criticAngle,
      topic: reviewContext.round.topic ?? 'Untitled topic',
      winnerSlots,
      customPrompt,
      responseLanguage,
      responses: reviewContext.responses
        .filter(
          (response) =>
            response.status === 'success' && Boolean(response.responseText),
        )
        .map((response) => ({
          slot: response.anonymizedSlot,
          modelLabel: response.modelLabel,
          text: response.responseText ?? '',
        })),
    })

    const criticCopy = await generateAgentCopy({
      role: 'critic',
      prompt: criticPrompt,
      fallback: getAgentFallback('critic', responseLanguage),
    })

    await ctx.runMutation(internal.state.saveArtifact, {
      sessionId: args.sessionId,
      roundId: args.roundId,
      type: 'critic_analysis',
      status: criticCopy.status,
      content: criticCopy.content,
      modelId: criticCopy.modelId,
      failureReason: criticCopy.failureReason,
    })

    const votesByResponseId = new Map<string, number>()
    for (const response of reviewContext.responses) {
      votesByResponseId.set(response._id, 0)
    }
    for (const vote of reviewContext.humanVotes) {
      votesByResponseId.set(
        vote.responseId,
        (votesByResponseId.get(vote.responseId) ?? 0) + 1,
      )
    }
    for (const vote of reviewContext.aiVotes) {
      votesByResponseId.set(
        vote.responseId,
        (votesByResponseId.get(vote.responseId) ?? 0) + 1,
      )
    }

    const statsRows = reviewContext.responses
      .filter((response) => response.status !== 'pending')
      .map((response) => ({
        slot: response.anonymizedSlot,
        modelLabel: response.modelLabel,
        status: response.status,
        votes: votesByResponseId.get(response._id) ?? 0,
        latencyMs: response.latencyMs,
        isWinner: reviewContext.round.winnerResponseIds.includes(response._id),
      }))
    const winnerLabels = reviewContext.responses
      .filter((response) =>
        reviewContext.round.winnerResponseIds.includes(response._id),
      )
      .map((response) => response.modelLabel)
    const statsCopy = await generateStatsAgentCopy({
      prompt: buildStatsPrompt({
        roundNumber: reviewContext.round.roundNumber,
        topic: reviewContext.round.topic ?? 'Untitled topic',
        winnerLabels,
        rows: statsRows,
        humanVotes: reviewContext.humanVotes.length,
        aiVotes: reviewContext.aiVotes.length,
        customPrompt,
        responseLanguage,
      }),
      fallback: buildStatsFallback({
        roundNumber: reviewContext.round.roundNumber,
        winnerLabels,
        humanVotes: reviewContext.humanVotes.length,
        aiVotes: reviewContext.aiVotes.length,
        rows: statsRows,
        responseLanguage,
      }),
    })
    await ctx.runMutation(internal.state.saveArtifact, {
      sessionId: args.sessionId,
      roundId: args.roundId,
      type: 'stats_summary',
      status: statsCopy.status,
      content: statsCopy.content,
      modelId: statsCopy.modelId,
      failureReason: statsCopy.failureReason,
    })

    if (args.isLastRound) {
      const scoreboard = await ctx.runQuery(
        internal.state.getSessionScoreboard,
        {
          sessionId: args.sessionId,
        },
      )
      const recapCopy = await generateAgentCopy({
        role: 'host',
        prompt: buildHostPrompt({
          phase: 'recap',
          themeLabel: reviewContext.themeCopy.label,
          hostTone: reviewContext.themeCopy.hostTone,
          scoreboardSummary: summarizeScoreboard(scoreboard),
          customPrompt,
          responseLanguage,
        }),
        fallback:
          responseLanguage === 'romanian'
            ? 'Recapitularea hostului este indisponibila. Verifica scoreboard-ul final pentru rezultatul oficial.'
            : 'Host recap unavailable. Check the final scoreboard for the official result.',
      })
      await ctx.runMutation(internal.state.saveArtifact, {
        sessionId: args.sessionId,
        roundId: args.roundId,
        type: 'host_recap',
        status: recapCopy.status,
        content: recapCopy.content,
        modelId: recapCopy.modelId,
        failureReason: recapCopy.failureReason,
      })
      return null
    }

    if (args.nextRoundId) {
      const winningLabels = reviewContext.responses
        .filter((response) =>
          reviewContext.round.winnerResponseIds.includes(response._id),
        )
        .map((response) => response.modelLabel)
      const transitionCopy = await generateAgentCopy({
        role: 'host',
        prompt: buildHostPrompt({
          phase: 'transition',
          themeLabel: reviewContext.themeCopy.label,
          hostTone: reviewContext.themeCopy.hostTone,
          winnerSummary:
            reviewContext.round.resultStatus === 'tie'
              ? `Round ${reviewContext.round.roundNumber} ended in a tie between ${winningLabels.join(' and ')}.`
              : winningLabels.length > 0
                ? `${winningLabels[0]} won round ${reviewContext.round.roundNumber}.`
                : `Round ${reviewContext.round.roundNumber} had no valid winner.`,
          customPrompt,
          responseLanguage,
        }),
        fallback:
          responseLanguage === 'romanian'
            ? 'Tranzitia hostului este indisponibila. Urmatoarea runda este gata.'
            : 'Host transition unavailable. Next round is ready.',
      })
      await ctx.runMutation(internal.state.saveArtifact, {
        sessionId: args.sessionId,
        roundId: args.nextRoundId,
        type: 'host_transition',
        status: transitionCopy.status,
        content: transitionCopy.content,
        modelId: transitionCopy.modelId,
        failureReason: transitionCopy.failureReason,
      })
    }

    return null
  },
})
