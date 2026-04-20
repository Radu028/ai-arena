import { cn } from '#/lib/utils'

export function LiveVoteChart({
  responses,
}: {
  responses: Array<{ slot: string; votes: number }>
}) {
  const highestVoteCount = Math.max(
    1,
    ...responses.map((response) => response.votes),
  )

  return (
    <div
      className="grid gap-4"
      role="img"
      aria-label="Live voting distribution across anonymized response slots."
    >
      {responses.map((response) => {
        const widthPercent = `${Math.max(
          8,
          Math.round((response.votes / highestVoteCount) * 100),
        )}%`

        return (
          <div
            key={response.slot}
            className="grid gap-2 rounded-[1.25rem] border border-border/60 bg-muted/30 p-4"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="font-mono text-sm tracking-[0.2em] text-muted-foreground uppercase">
                {response.slot}
              </div>
              <div className="text-sm font-semibold text-foreground">
                {response.votes} {response.votes === 1 ? 'vote' : 'votes'}
              </div>
            </div>
            <div
              className="h-3 overflow-hidden rounded-full bg-border/60"
              aria-hidden="true"
            >
              <div
                className={cn(
                  'h-full rounded-full bg-[var(--arena-cobalt)] transition-[width] duration-500 ease-out',
                  response.votes === 0 && 'bg-muted-foreground/40',
                )}
                style={{ width: response.votes === 0 ? '8%' : widthPercent }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
