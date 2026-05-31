import { cn } from '#/lib/utils'

/**
 * Single source of truth for status chips across the app.
 *
 * Previously every screen reimplemented its own pill, so the same state
 * (e.g. "ended") showed up in different colors on different pages. This maps
 * each known session/round status to one tone so they read identically
 * everywhere. Session and round statuses share no keys, so one map covers both.
 */
type StatusTone = 'neutral' | 'live' | 'primary' | 'danger' | 'warning' | 'info'

const STATUS_TONES: Record<string, { tone: StatusTone; pulse?: boolean }> = {
  // session statuses
  waiting: { tone: 'neutral' },
  active: { tone: 'live', pulse: true },
  ended: { tone: 'primary' },
  stopped: { tone: 'danger' },
  // round statuses
  collecting_topic: { tone: 'info' },
  collecting_responses: { tone: 'info', pulse: true },
  generating: { tone: 'info', pulse: true },
  voting: { tone: 'primary', pulse: true },
  scored: { tone: 'warning' },
}

const TONE_CLASS: Record<StatusTone, string> = {
  neutral: 'bg-muted text-muted-foreground',
  live: 'bg-success/12 text-success dark:bg-success/15',
  primary: 'bg-primary/12 text-primary dark:bg-primary/20',
  danger: 'bg-destructive/12 text-destructive dark:bg-destructive/20',
  warning: 'bg-warning/15 text-warning',
  info: 'bg-info/12 text-info dark:bg-info/15',
}

export function StatusPill({
  status,
  label,
  className,
}: {
  status: string
  /** Display text. Defaults to the humanized status (e.g. "collecting topic"). */
  label?: string
  className?: string
}) {
  const { tone, pulse } = STATUS_TONES[status] ?? { tone: 'neutral' as const }
  const text = label ?? status.replaceAll('_', ' ')

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium capitalize',
        TONE_CLASS[tone],
        className,
      )}
    >
      {pulse ? (
        <span className="pulse-dot" aria-hidden />
      ) : (
        <span className="size-1.5 rounded-full bg-current" aria-hidden />
      )}
      {text}
    </span>
  )
}
