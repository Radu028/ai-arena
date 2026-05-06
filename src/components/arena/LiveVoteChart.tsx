import { cn } from '#/lib/utils'

export function LiveVoteChart({
  responses,
}: {
  responses: Array<{ slot: string; votes: number }>
}) {
  const total = Math.max(
    1,
    responses.reduce((acc, r) => acc + r.votes, 0),
  )

  return (
    <div
      className="grid gap-2.5"
      role="img"
      aria-label="Live voting distribution across anonymized response slots."
    >
      {responses.map((response) => {
        const ratio = response.votes / total
        const widthPercent = response.votes === 0 ? 4 : Math.max(6, ratio * 100)
        const sharePercent = Math.round(ratio * 100)

        return (
          <div
            key={response.slot}
            className="flex items-center gap-3 rounded-xl border border-border/60 bg-background/40 px-4 py-3"
          >
            <span className="inline-flex h-6 items-center rounded-full bg-muted px-2 font-mono text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground">
              {response.slot}
            </span>

            <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-muted">
              <div
                className={cn(
                  'absolute inset-y-0 left-0 rounded-full transition-[width] duration-700 ease-out',
                  response.votes === 0
                    ? 'bg-muted-foreground/30'
                    : 'bg-gradient-to-r from-primary to-primary/70',
                )}
                style={{ width: `${widthPercent}%` }}
              />
            </div>

            <div className="flex w-20 items-baseline justify-end gap-1.5">
              <span className="font-mono text-sm tabular-nums">
                {response.votes}
              </span>
              <span className="font-mono text-[0.65rem] tabular-nums text-muted-foreground">
                {sharePercent}%
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
