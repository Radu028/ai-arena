import { useRef, useState } from 'react'
import { toPng } from 'html-to-image'
import {
  CrownIcon,
  DownloadIcon,
  ImageIcon,
  ShareIcon,
  SparklesIcon,
} from 'lucide-react'
import { ArenaLogo } from '#/components/ArenaLogo'
import { Button } from '#/components/ui/button'
import type { PublicSessionView } from './SessionPageSections'

type Winner = PublicSessionView['scoreboard'][number]

interface WinnerCardProps {
  session: PublicSessionView['session']
  winner: Winner
}

const MODEL_PERSONAS: Record<string, string> = {
  'openai-gpt5':
    'sharp Silicon Valley tech visionary in a modern navy suit, confident smirk, award ceremony stage',
  'anthropic-claude-sonnet-4':
    'creative polymath in a modern blazer holding a glowing pen, warm studio lighting',
  'google-gemini-3-flash':
    'vibrant innovator with colorful prismatic glasses and bold jacket, rainbow-spectrum stage',
  'google-gemini-31-pro':
    'brilliant futurist in an iridescent suit with cosmic energy, deep space backdrop',
}

function buildPortraitUrl(modelKey: string, modelLabel: string): string {
  const persona =
    MODEL_PERSONAS[modelKey] ??
    'triumphant AI champion in futuristic suit, award ceremony stage'
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
    img.onload = () => {
      setPortraitUrl(url)
      setLoading(false)
    }
    img.onerror = () => {
      setPortraitUrl(url)
      setLoading(false)
    }
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
    <div className="space-y-3">
      {/* Exportable card */}
      <div
        ref={cardRef}
        className="relative overflow-hidden rounded-3xl"
        style={{
          background:
            'linear-gradient(150deg, oklch(0.18 0.05 290) 0%, oklch(0.16 0.06 280) 40%, oklch(0.22 0.08 60) 100%)',
          fontFamily: 'Geist Variable, system-ui, -apple-system, sans-serif',
          width: '100%',
          maxWidth: 480,
        }}
      >
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(circle at 18% 18%, rgba(168,85,247,0.32) 0%, transparent 50%),' +
              'radial-gradient(circle at 82% 82%, rgba(251,191,36,0.30) 0%, transparent 50%)',
            pointerEvents: 'none',
          }}
        />

        {/* Top bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '18px 22px 0',
            position: 'relative',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <ArenaLogo size={30} />
            <span
              style={{
                color: 'rgba(255,255,255,0.6)',
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
              }}
            >
              AI Arena
            </span>
          </div>
          <span
            style={{
              background: 'rgba(251,191,36,0.18)',
              border: '1px solid rgba(251,191,36,0.45)',
              borderRadius: 999,
              color: '#fcd34d',
              fontSize: 10,
              fontWeight: 700,
              padding: '4px 11px',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <CrownIcon size={11} /> Champion
          </span>
        </div>

        {/* Portrait */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            aspectRatio: '1',
            overflow: 'hidden',
            marginTop: 10,
          }}
        >
          {portraitUrl ? (
            <>
              <img
                src={portraitUrl}
                alt={`${winner.label} champion portrait`}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                }}
                crossOrigin="anonymous"
              />
              <div
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: '45%',
                  background:
                    'linear-gradient(to top, oklch(0.18 0.05 290), transparent)',
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
                color: 'rgba(255,255,255,0.45)',
              }}
            >
              <ImageIcon size={36} />
              <span style={{ fontSize: 12 }}>Portrait not generated yet</span>
            </div>
          )}
        </div>

        {/* Winner info */}
        <div
          style={{
            padding: '0 22px 22px',
            marginTop: portraitUrl ? -36 : 0,
            position: 'relative',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 6,
            }}
          >
            <CrownIcon size={16} color="#fcd34d" />
            <span
              style={{
                color: 'rgba(255,255,255,0.5)',
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
              }}
            >
              Winner
            </span>
          </div>
          <h2
            style={{
              color: '#ffffff',
              fontSize: 30,
              fontWeight: 700,
              letterSpacing: '-0.025em',
              lineHeight: 1.05,
              margin: '0 0 4px',
            }}
          >
            {winner.label}
          </h2>
          <p
            style={{
              color: 'rgba(255,255,255,0.55)',
              fontSize: 13,
              margin: '0 0 18px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {session.title}
          </p>

          <div
            style={{
              display: 'flex',
              gap: 10,
            }}
          >
            {[
              {
                label: 'Rounds won',
                value: `${winner.wins}/${winner.roundsPlayed}`,
              },
              { label: 'Win rate', value: `${winRate}%` },
              { label: 'Total votes', value: String(winner.totalVotes) },
            ].map((stat) => (
              <div
                key={stat.label}
                style={{
                  flex: 1,
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 12,
                  padding: '10px 11px',
                }}
              >
                <div
                  style={{
                    color: '#ffffff',
                    fontSize: 18,
                    fontWeight: 700,
                    letterSpacing: '-0.015em',
                  }}
                >
                  {stat.value}
                </div>
                <div
                  style={{
                    color: 'rgba(255,255,255,0.4)',
                    fontSize: 10,
                    fontWeight: 600,
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                    marginTop: 3,
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
          <SparklesIcon className="size-4" />
          {loading
            ? 'Generating portrait...'
            : portraitUrl
              ? 'Regenerate'
              : 'Generate AI portrait'}
        </Button>

        {portraitUrl ? (
          <>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleDownload}
              disabled={downloading}
            >
              <DownloadIcon className="size-4" />
              {downloading ? 'Saving...' : 'Download card'}
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
        ) : null}
      </div>
    </div>
  )
}
