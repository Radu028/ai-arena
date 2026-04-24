'use node'

import Anthropic from '@anthropic-ai/sdk'
import { GoogleGenAI } from '@google/genai'
import { Mistral } from '@mistralai/mistralai'
import OpenAI from 'openai'
import type { Doc } from './_generated/dataModel'
import { internal } from './_generated/api'
import { internalAction } from './_generated/server'
import { v } from 'convex/values'
import {
  AGENT_TIMEOUT_MS,
  CRITIC_AGENT_DEFAULT_MODEL,
  HOST_AGENT_DEFAULT_MODEL,
  PROVIDER_TIMEOUT_MS,
} from '../shared/arena'
import type { SessionModelSnapshot, ThemeCopy } from '../shared/arena'

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

function makeFallbackCopy(topic: string, modelLabel: string) {
  return `${modelLabel} missed the live API call, so AI Arena is using a house fallback on the topic "${topic}". The safest version is: stay clear, be specific, and land one memorable line.`
}

function getAgentFallback(role: 'host' | 'critic') {
  if (role === 'host') {
    return 'Host temporarily offline. The round continues without commentary.'
  }
  return 'Critic temporarily offline. The round result still stands without analysis.'
}

function buildRoundPrompt(args: {
  theme: ThemeCopy
  topic: string
  model: SessionModelSnapshot
}) {
  return [
    `You are competing in an AI Arena round.`,
    `Theme: ${args.theme.label}.`,
    `Theme guidance: focus on ${args.theme.criticAngle}.`,
    `Your style brief: ${args.model.description}.`,
    `Topic: ${args.topic}`,
    `Write one strong answer. Keep it concise, high-signal, audience-ready, and original.`,
    `Do not mention your model name.`,
  ].join('\n')
}

function buildHostPrompt(args: {
  phase: 'intro' | 'transition' | 'recap'
  themeLabel: string
  hostTone: string
  topic?: string
  models?: string[]
  winnerSummary?: string
  scoreboardSummary?: string
}) {
  const lines = [
    `You are the Host / MC for a live AI Arena.`,
    `Adopt a ${args.hostTone} voice.`,
    `Theme: ${args.themeLabel}.`,
  ]
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
}) {
  return [
    `You are the Critic for AI Arena.`,
    `Theme: ${args.themeLabel}.`,
    `Explain the result in terms of ${args.criticAngle}.`,
    `Topic: ${args.topic}`,
    `Winning slot(s): ${args.winnerSlots.join(', ') || 'none'}.`,
    `Responses:`,
    ...args.responses.map(
      (response) =>
        `[${response.slot}] ${response.modelLabel}: ${response.text}`,
    ),
    `Write one compact analysis that covers every response, why the winner worked, and what the others lacked.`,
  ].join('\n')
}

function buildJudgePrompt(args: {
  themeLabel: string
  judgeStyle: string
  topic: string
  candidates: Array<{ slot: string; text: string }>
}) {
  return [
    `You are judging an AI Arena round.`,
    `Theme: ${args.themeLabel}.`,
    `Judge style: ${args.judgeStyle}.`,
    `Topic: ${args.topic}`,
    `Choose the best response among the candidates.`,
    `Return strict JSON like {"slot":"A","rationale":"..."} and nothing else.`,
    ...args.candidates.map(
      (candidate) => `[${candidate.slot}] ${candidate.text}`,
    ),
  ].join('\n')
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

async function generateWithOpenAI(
  modelId: string,
  apiKey: string,
  prompt: string,
  baseURL?: string,
) {
  const client = new OpenAI({
    apiKey,
    baseURL,
  })
  const response = await client.responses.create({
    model: modelId,
    input: prompt,
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
  baseURL: string,
) {
  const client = new OpenAI({
    apiKey,
    baseURL,
  })
  const response = await client.chat.completions.create({
    model: modelId,
    messages: [{ role: 'user', content: prompt }],
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
) {
  const client = new Anthropic({ apiKey })
  const response = await client.messages.create({
    model: modelId,
    max_tokens: 400,
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
) {
  const client = new GoogleGenAI({ apiKey })
  const response = await client.models.generateContent({
    model: modelId,
    contents: prompt,
  })
  return {
    text: response.text ?? '',
    usage: {
      input: response.usageMetadata?.promptTokenCount ?? null,
      output: response.usageMetadata?.candidatesTokenCount ?? null,
    },
  }
}

async function generateWithMistral(
  modelId: string,
  apiKey: string,
  prompt: string,
) {
  const client = new Mistral({ apiKey })
  const response = await client.chat.complete({
    model: modelId,
    messages: [{ role: 'user', content: prompt }],
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
): Promise<TextResult> {
  const start = Date.now()
  try {
    const demoMode = process.env.AI_ARENA_DEMO_MODE === 'true'
    if (demoMode) {
      return {
        status: 'success',
        text: makeFallbackCopy(topic, model.label),
        usage: { input: null, output: null },
        errorCode: null,
        errorMessage: null,
        latencyMs: Date.now() - start,
      }
    }

    let result: { text: string; usage: UsageShape } | null = null

    switch (model.providerKey) {
      case 'openai': {
        const apiKey = process.env.OPENAI_API_KEY
        if (!apiKey) {
          return {
            status: 'skipped',
            text: makeFallbackCopy(topic, model.label),
            usage: { input: null, output: null },
            errorCode: 'OPENAI_KEY_MISSING',
            errorMessage: 'OPENAI_API_KEY is not configured.',
            latencyMs: Date.now() - start,
          }
        }
        result = await providerTimeout(
          generateWithOpenAI(model.modelId, apiKey, prompt),
          PROVIDER_TIMEOUT_MS,
        )
        break
      }
      case 'xai': {
        const apiKey = process.env.XAI_API_KEY
        if (!apiKey) {
          return {
            status: 'skipped',
            text: makeFallbackCopy(topic, model.label),
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
            text: makeFallbackCopy(topic, model.label),
            usage: { input: null, output: null },
            errorCode: 'ANTHROPIC_KEY_MISSING',
            errorMessage: 'ANTHROPIC_API_KEY is not configured.',
            latencyMs: Date.now() - start,
          }
        }
        result = await providerTimeout(
          generateWithAnthropic(model.modelId, apiKey, prompt),
          PROVIDER_TIMEOUT_MS,
        )
        break
      }
      case 'google': {
        const apiKey = process.env.GOOGLE_AI_API_KEY
        if (!apiKey) {
          return {
            status: 'skipped',
            text: makeFallbackCopy(topic, model.label),
            usage: { input: null, output: null },
            errorCode: 'GOOGLE_KEY_MISSING',
            errorMessage: 'GOOGLE_AI_API_KEY is not configured.',
            latencyMs: Date.now() - start,
          }
        }
        result = await providerTimeout(
          generateWithGoogle(model.modelId, apiKey, prompt),
          PROVIDER_TIMEOUT_MS,
        )
        break
      }
      case 'mistral': {
        const apiKey = process.env.MISTRAL_API_KEY
        if (!apiKey) {
          return {
            status: 'skipped',
            text: makeFallbackCopy(topic, model.label),
            usage: { input: null, output: null },
            errorCode: 'MISTRAL_KEY_MISSING',
            errorMessage: 'MISTRAL_API_KEY is not configured.',
            latencyMs: Date.now() - start,
          }
        }
        result = await providerTimeout(
          generateWithMistral(model.modelId, apiKey, prompt),
          PROVIDER_TIMEOUT_MS,
        )
        break
      }
    }

    return {
      status: 'success',
      text: result.text,
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
        errorMessage: 'Generation timed out after 15 seconds.',
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
      generateWithOpenAI(modelId, apiKey, args.prompt),
      AGENT_TIMEOUT_MS,
    )
    return {
      status: 'success' as const,
      content: result.text,
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

function parseJudgeDecision(payload: string, allowedSlots: string[]) {
  try {
    const parsed = JSON.parse(payload) as { slot?: string; rationale?: string }
    if (parsed.slot && allowedSlots.includes(parsed.slot)) {
      return {
        slot: parsed.slot,
        rationale: parsed.rationale?.trim() || null,
      }
    }
  } catch {
    return null
  }
  return null
}

export const generateRound = internalAction({
  args: {
    sessionId: v.id('sessions'),
    roundId: v.id('rounds'),
  },
  handler: async (ctx, args) => {
    const context = (await ctx.runQuery(
      internal.state.getRoundGenerationContext,
      args,
    )) as RoundGenerationContext | null
    if (
      !context ||
      context.session.status !== 'active' ||
      context.round.status !== 'generating'
    ) {
      return null
    }

    const hostPrompt = buildHostPrompt({
      phase: 'intro',
      themeLabel: context.themeCopy.label,
      hostTone: context.themeCopy.hostTone,
      topic: context.round.topic ?? 'Untitled topic',
      models: (
        context.session.selectedModelsSnapshot as SessionModelSnapshot[]
      ).map((model) => model.label),
    })
    const hostCopy = await generateAgentCopy({
      role: 'host',
      prompt: hostPrompt,
      fallback: getAgentFallback('host'),
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

    const sessionModels = context.session
      .selectedModelsSnapshot as SessionModelSnapshot[]

    await Promise.all(
      sessionModels.map(async (model) => {
        const prompt = buildRoundPrompt({
          theme: context.themeCopy,
          topic: context.round.topic ?? 'Untitled topic',
          model,
        })
        const result = await callProvider(
          model,
          prompt,
          context.round.topic ?? 'Untitled topic',
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

    const refreshed = (await ctx.runQuery(
      internal.state.getRoundGenerationContext,
      args,
    )) as RoundGenerationContext | null
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

    await ctx.runMutation(internal.state.openVoting, {
      sessionId: refreshed.session._id,
      roundId: refreshed.round._id,
    })

    const reviewContext = (await ctx.runQuery(
      internal.state.getRoundReviewContext,
      args,
    )) as RoundReviewContext | null
    if (!reviewContext || reviewContext.round.status !== 'voting') {
      return null
    }

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
          const reviewModels = reviewContext.session
            .selectedModelsSnapshot as SessionModelSnapshot[]
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
          })

          const decision = await callProvider(
            voterModel,
            judgePrompt,
            reviewContext.round.topic ?? 'Untitled topic',
          )
          const parsed = decision.text
            ? parseJudgeDecision(
                decision.text,
                candidatePool.map((candidate) => candidate.slot),
              )
            : null
          const fallbackTarget = candidatePool
            .slice()
            .sort((left, right) => right.text.length - left.text.length)[0]
          const chosenSlot = parsed?.slot ?? fallbackTarget.slot
          const chosen = chosenSlot
            ? candidatePool.find((candidate) => candidate.slot === chosenSlot)
            : null

          if (!chosen) {
            return
          }

          await ctx.runMutation(internal.state.saveAiVote, {
            roundId: reviewContext.round._id,
            voterModelKey: voter.modelKey,
            responseId: chosen.responseId,
            rationale: parsed?.rationale ?? decision.errorMessage ?? null,
          })
        }),
    )

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
    const reviewContext = (await ctx.runQuery(
      internal.state.getRoundReviewContext,
      {
        sessionId: args.sessionId,
        roundId: args.roundId,
      },
    )) as RoundReviewContext | null
    if (!reviewContext) {
      return null
    }

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
      fallback: getAgentFallback('critic'),
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
        }),
        fallback:
          'Host recap unavailable. Check the final scoreboard for the official result.',
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
        }),
        fallback: 'Host transition unavailable. Next round is ready.',
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
