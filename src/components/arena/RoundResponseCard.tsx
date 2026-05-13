import {
  AlertTriangleIcon,
  CheckIcon,
  CrownIcon,
  TimerIcon,
} from 'lucide-react'
import { cn } from '#/lib/utils'
import { formatDurationMs } from '#/lib/format'
import { Button } from '#/components/ui/button'
import { usePretextBlock } from '#/lib/pretext'

const MODEL_TEXT_PRETEXT_OPTIONS = {
  whiteSpace: 'pre-wrap',
} as const

export function RoundResponseCard({
  response,
  revealed,
  disabled,
  onVote,
  showVoteButton,
}: {
  response: {
    id: string
    slot: string
    status: string
    text: string | null
    label: string | null
    votes: number
    isWinner: boolean
    errorMessage: string | null
    latencyMs: number | null
  }
  revealed: boolean
  disabled?: boolean
  showVoteButton?: boolean
  onVote?: (responseId: string) => void
}) {
  const failed = response.status !== 'success'
  const { ref, metrics } = usePretextBlock<HTMLDivElement>(
    response.text,
    '400 15px "Source Serif 4"',
    28,
    MODEL_TEXT_PRETEXT_OPTIONS,
  )

  return (
    <div
      className={cn(
        'group relative flex min-h-full flex-col overflow-visible rounded-2xl border bg-card transition-all',
        response.isWinner && revealed
          ? 'border-amber-400/50 ring-amber-400/30 ring-amber-glow [box-shadow:0_24px_60px_-24px_color-mix(in_oklab,var(--arena-amber),transparent_55%),inset_0_0_0_1px_color-mix(in_oklab,var(--arena-amber),transparent_70%)]'
          : 'border-border/60 hover:border-border',
      )}
    >
      {response.isWinner && revealed ? (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_85%_-20%,color-mix(in_oklab,var(--arena-amber),transparent_55%),transparent_45%)]"
        />
      ) : null}

      <div className="relative flex items-center justify-between gap-2 px-5 pt-4">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'inline-flex h-6 items-center gap-1.5 rounded-full px-2 font-mono text-[0.65rem] uppercase tracking-[0.2em]',
              revealed
                ? 'bg-muted text-muted-foreground'
                : 'bg-foreground/8 text-foreground/70',
            )}
          >
            slot {response.slot}
          </span>
          {failed ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2 py-0.5 text-[0.65rem] font-medium uppercase tracking-wider text-red-600 dark:text-red-300">
              <AlertTriangleIcon className="size-3" />
              {response.status}
            </span>
          ) : null}
        </div>

        {response.isWinner && revealed ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 text-[0.7rem] font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-300">
            <CrownIcon className="size-3" />
            Winner
          </span>
        ) : null}
      </div>

      <div className="relative flex-1 px-5 pt-3">
        <p className="text-sm font-semibold tracking-tight">
          {revealed ? (
            <>{response.label ?? `Response ${response.slot}`}</>
          ) : (
            <span className="text-muted-foreground">
              Anonymous · revealed after voting
            </span>
          )}
        </p>

        <div className="mt-3 text-pretty">
          {failed ? (
            <p className="rounded-xl border border-dashed border-border/60 bg-muted/40 px-3 py-3 text-xs leading-6 text-muted-foreground">
              {response.errorMessage ??
                'This model did not return a valid answer in time.'}
            </p>
          ) : (
            <div
              ref={ref}
              data-line-count={metrics?.lineCount}
              className="overflow-visible"
            >
              <p className="font-editorial whitespace-pre-wrap wrap-anywhere text-[0.95rem] leading-7 text-foreground/95">
                {response.text}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="relative mt-4 flex items-center justify-between gap-3 border-t border-border/60 bg-muted/20 px-5 py-3">
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {revealed ? (
            <span className="font-mono tabular-nums text-foreground">
              {response.votes}{' '}
              <span className="text-muted-foreground">
                {response.votes === 1 ? 'vote' : 'votes'}
              </span>
            </span>
          ) : (
            <span>Anonymous until reveal</span>
          )}
          {response.latencyMs ? (
            <span className="inline-flex items-center gap-1 font-mono">
              <TimerIcon className="size-3" />
              {formatDurationMs(response.latencyMs)}
            </span>
          ) : null}
        </div>
        {showVoteButton ? (
          <Button
            size="sm"
            disabled={disabled || failed}
            onClick={() => onVote?.(response.id)}
            className="rounded-full"
          >
            <CheckIcon className="size-3.5" />
            Vote
          </Button>
        ) : null}
      </div>
    </div>
  )
}
