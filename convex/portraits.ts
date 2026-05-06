import { action } from './_generated/server'
import { v } from 'convex/values'
import OpenAI from 'openai'

const MODEL_PERSONAS: Record<string, { vibe: string; aesthetic: string }> = {
  'gpt-4o': {
    vibe: 'a sharp Silicon Valley tech visionary in a modern navy suit, confident smirk',
    aesthetic: 'sleek minimalist stage, cool blue-white spotlights, futuristic backdrop',
  },
  'gpt-4o-mini': {
    vibe: 'a nimble young tech prodigy in a hoodie and sneakers, energetic pose',
    aesthetic: 'neon-lit startup office background, dynamic blue lighting',
  },
  'claude-opus-4-5': {
    vibe: 'a wise philosopher-scientist with round glasses and an elegant coat',
    aesthetic: 'warm amber lighting, classical library backdrop, scholarly atmosphere',
  },
  'claude-sonnet-4-5': {
    vibe: 'a creative polymath in a modern blazer, holding a glowing pen',
    aesthetic: 'warm studio lighting, artsy backdrop with subtle geometric patterns',
  },
  'gemini-2-0-flash': {
    vibe: 'a vibrant innovator with colorful prismatic glasses and a bold jacket',
    aesthetic: 'colorful geometric shapes background, rainbow-spectrum lighting',
  },
  'gemini-2-5-pro-preview-05-06': {
    vibe: 'a brilliant futurist in a iridescent suit with cosmic energy',
    aesthetic: 'deep space backdrop, prismatic lighting, aurora effects',
  },
  'mistral-large-latest': {
    vibe: 'a sophisticated French intellectual in a perfectly tailored suit',
    aesthetic: 'elegant Parisian salon, warm café lighting, refined atmosphere',
  },
  'grok-3': {
    vibe: 'a rebellious tech maverick in all-black with a confident grin',
    aesthetic: 'dark dramatic stage, high-contrast spotlight, sleek futuristic',
  },
}

function buildPrompt(modelKey: string, modelLabel: string): string {
  const persona = MODEL_PERSONAS[modelKey] ?? {
    vibe: 'a triumphant AI champion in a futuristic suit',
    aesthetic: 'dramatic award ceremony stage, cinematic lighting',
  }

  return (
    `Photorealistic award ceremony portrait: ${persona.vibe}, ` +
    `holding a large gleaming gold trophy HIGH above their head with both hands clearly visible, ` +
    `triumphant victorious expression, feet planted on stage, full body visible from head to toe, ` +
    `${persona.aesthetic}, confetti falling, crowd cheering in background (blurred), ` +
    `professional sports photography style, 85mm lens, shallow depth of field, ` +
    `dramatic studio lighting, ultra sharp focus on subject, 4K photorealistic. ` +
    `The champion represents the AI model named "${modelLabel}".`
  )
}

export const generateWinnerPortrait = action({
  args: {
    modelKey: v.string(),
    modelLabel: v.string(),
  },
  handler: async (_ctx, { modelKey, modelLabel }) => {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is not set — add it to your Convex environment.')
    }

    const client = new OpenAI({ apiKey })
    const prompt = buildPrompt(modelKey, modelLabel)

    const response = await client.images.generate({
      model: 'dall-e-3',
      prompt,
      n: 1,
      size: '1024x1024',
      quality: 'hd',
      style: 'vivid',
    })

    const url = response.data?.[0]?.url
    if (!url) {
      throw new Error('DALL-E returned no image URL.')
    }

    return { url, prompt }
  },
})
