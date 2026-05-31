import type { AdminSession } from '#/components/admin/AdminSessionTypes'

export function AdminSessionScoreboard({
  scoreboard,
}: {
  scoreboard: AdminSession['scoreboard']
}) {
  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between">
        <div>
          <p className="eyebrow">Scoreboard</p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight sm:text-2xl">
            Wins and votes by model
          </h2>
        </div>
      </div>

      <ul className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
        {scoreboard.map((entry, i) => (
          <li
            key={entry.modelKey}
            className="flex items-center gap-3 border-b border-border/40 pb-2.5 last:border-b-0 last:pb-0"
          >
            <span className="grid size-7 place-items-center rounded-md bg-muted/60 font-mono text-xs text-muted-foreground">
              {i + 1}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{entry.label}</p>
              <p className="font-mono text-xs text-muted-foreground">
                {entry.wins} wins &middot; {entry.totalVotes} votes
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
