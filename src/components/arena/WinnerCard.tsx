import { useRef, useState } from 'react'
import { toPng } from 'html-to-image'
import { DownloadIcon, ImageIcon, ShareIcon, TrophyIcon } from 'lucide-react'
import { ArenaLogo } from '#/components/ArenaLogo'
import { Button } from '#/components/ui/button'
import type { PublicSessionView } from './SessionPageSections'

type Winner = PublicSessionView['scoreboard'][number]

interface WinnerCardProps {
  session: PublicSessionView['session']
  winner: Winner
}

const MODEL_PERSONAS: Record<string, string> = {
  'gpt-4o': 'sharp Silicon Valley tech visionary in a modern navy suit, confident smirk, award ceremony stage',
  'gpt-4o-mini': 'nimble young tech prodigy in a hoodie and sneakers, energetic pose, neon-lit stage',
  'claude-opus-4-5': 'wise philosopher-scientist with round glasses and elegant coat, warm amber lighting, library backdrop',
  'claude-sonnet-4-5': 'creative polymath in a modern blazer holding a glowing pen, warm studio lighting',
  'gemini-2-0-flash': 'vibrant innovator with colorful prismatic glasses and bold jacket, rainbow-spectrum stage',
  'gemini-2-5-pro-preview-05-06': 'brilliant futurist in an iridescent suit with cosmic energy, deep space backdrop',
  'mistral-large-latest': 'sophisticated French intellectual in a perfectly tailored suit, Parisian salon lighting',
  'grok-3': 'rebellious tech maverick in all-black with a confident grin, dark dramatic spotlight',
}

function buildPortraitUrl(modelKey: string, modelLabel: string): string {
  const persona = MODEL_PERSONAS[modelKey] ?? 'triumphant AI champion in futuristic suit, award ceremony stage'
  const prompt =
    `Photorealistic award ceremony portrait: ${persona}, ` +
    `holding a large gleaming gold trophy HIGH above their head with both hands clearly visible, ` +
    `triumphant victorious expression, full body visible from head to toe showing hands and feet, ` +
    `confetti falling, crowd cheering blurred in background, professional sports photography, ` +
    `85mm lens shallow depth of field, dramatic studio lighting, 4K photorealistic. ` +
    `Subject represents AI model "${modelLabel}".`

  return (
    `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}` +
    `?width=1024&height=1024&model=flux&nologo=true&seed=${Date.now()}`
  )
}

export function WinnerCard({ session, winner }: WinnerCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [portraitUrl, setPortraitUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [downloading, setDownloading] = useState(false)

  function handleGenerate() {
    setLoading(true)
    const url = buildPortraitUrl(winner.modelKey, winner.label)
    const img = new Image()
    img.onload = () => { setPortraitUrl(url); setLoading(false) }
    img.onerror = () => { setPortraitUrl(url); setLoading(false) }
    img.src = url
  }

  async function handleDownload() {
    if (!cardRef.current) return
    setDownloading(true)
    try {
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        pixelRatio: 2,
      })
      const link = document.createElement('a')
      link.download = `ai-arena-winner-${winner.modelKey}.png`
      link.href = dataUrl
      link.click()
    } finally {
      setDownloading(false)
    }
  }

  async function handleShare() {
    if (!portraitUrl) return
    try {
      await navigator.share({
        title: `AI Arena — ${winner.label} wins!`,
        text: `${winner.label} won "${session.title}" with ${winner.wins} rounds and ${winner.totalVotes} votes. #AIArena`,
        url: window.location.href,
      })
    } catch {
      await navigator.clipboard.writeText(window.location.href)
    }
  }

  const winRate =
    winner.roundsPlayed > 0
      ? Math.round((winner.wins / winner.roundsPlayed) * 100)
      : 0

  return (
    <div className="space-y-4">
      {/* The card itself — this is what gets exported as image */}
      <div
        ref={cardRef}
        className="relative overflow-hidden rounded-2xl"
        style={{
          background: 'linear-gradient(135deg, #0f0c29, #1a1040, #24243e)',
          fontFamily: 'Manrope Variable, system-ui, sans-serif',
          width: '100%',
          maxWidth: 480,
        }}
      >
        {/* Background glow orbs */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(circle at 20% 20%, rgba(251,146,60,0.25) 0%, transparent 50%),' +
              'radial-gradient(circle at 80% 80%, rgba(99,102,241,0.2) 0%, transparent 50%)',
            pointerEvents: 'none',
          }}
        />

        {/* Top bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px 0',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <ArenaLogo size={28} />
            <span
              style={{
                color: 'rgba(255,255,255,0.6)',
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
              }}
            >
              AI Arena
            </span>
          </div>
          <span
            style={{
              background: 'rgba(251,146,60,0.2)',
              border: '1px solid rgba(251,146,60,0.4)',
              borderRadius: 999,
              color: '#fb923c',
              fontSize: 11,
              fontWeight: 700,
              padding: '3px 10px',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}
          >
            Champion
          </span>
        </div>

        {/* Portrait */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            aspectRatio: '1',
            overflow: 'hidden',
            marginTop: 8,
          }}
        >
          {portraitUrl ? (
            <>
              <img
                src={portraitUrl}
                alt={`${winner.label} champion portrait`}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                crossOrigin="anonymous"
              />
              {/* Bottom fade overlay */}
              <div
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: '40%',
                  background: 'linear-gradient(to top, #0f0c29, transparent)',
                }}
              />
            </>
          ) : (
            <div
              style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 12,
                background: 'rgba(255,255,255,0.04)',
                color: 'rgba(255,255,255,0.35)',
              }}
            >
              <ImageIcon size={40} />
              <span style={{ fontSize: 13 }}>Portrait not generated yet</span>
            </div>
          )}
        </div>

        {/* Winner info */}
        <div style={{ padding: '0 20px 20px', marginTop: portraitUrl ? -32 : 0, position: 'relative' }}>
          {/* Trophy + model name */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <TrophyIcon size={18} color="#fbbf24" />
            <span
              style={{
                color: 'rgba(255,255,255,0.5)',
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
              }}
            >
              Winner
            </span>
          </div>
          <h2
            style={{
              color: '#ffffff',
              fontSize: 28,
              fontWeight: 700,
              lineHeight: 1.1,
              margin: '0 0 4px',
              fontFamily: 'Source Serif 4, Georgia, serif',
            }}
          >
            {winner.label}
          </h2>
          <p
            style={{
              color: 'rgba(255,255,255,0.5)',
              fontSize: 13,
              margin: '0 0 16px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {session.title}
          </p>

          {/* Stats row */}
          <div
            style={{
              display: 'flex',
              gap: 10,
            }}
          >
            {[
              { label: 'Rounds won', value: `${winner.wins}/${winner.roundsPlayed}` },
              { label: 'Win rate', value: `${winRate}%` },
              { label: 'Total votes', value: String(winner.totalVotes) },
            ].map((stat) => (
              <div
                key={stat.label}
                style={{
                  flex: 1,
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 10,
                  padding: '8px 10px',
                }}
              >
                <div style={{ color: '#ffffff', fontSize: 18, fontWeight: 700 }}>
                  {stat.value}
                </div>
                <div
                  style={{
                    color: 'rgba(255,255,255,0.4)',
                    fontSize: 10,
                    fontWeight: 600,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    marginTop: 2,
                  }}
                >
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Action buttons — outside the exportable card */}
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleGenerate}
          disabled={loading}
        >
          <ImageIcon className="size-4" />
          {loading ? 'Generating portrait…' : portraitUrl ? 'Regenerate portrait' : 'Generate AI portrait'}
        </Button>

        {portraitUrl && (
          <>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleDownload}
              disabled={downloading}
            >
              <DownloadIcon className="size-4" />
              {downloading ? 'Saving…' : 'Download card'}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleShare}
            >
              <ShareIcon className="size-4" />
              Share
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
