import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from 'convex/react'
import { CrownIcon, MedalIcon, TrophyIcon } from 'lucide-react'
import { api } from '@convex/_generated/api'
import { formatMicrosUsd } from '@shared/arena'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '#/components/ui/empty'
import { Skeleton } from '#/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '#/components/ui/table'
import { cn } from '#/lib/utils'

export const Route = createFileRoute('/leaderboard')({
  component: LeaderboardPage,
})

type LeaderboardRow = {
  modelKey: string
  label: string
  accent: string
  wins: number
  ties: number
  roundsPlayed: number
  winRate: number
  totalVotes: number
  reliability: number
  costMicrosUsd: number
}

function LeaderboardPage() {
  const data = useQuery(api.stats.getModelLeaderboard, {})

  const top = data?.rows[0]

  return (
    <div className="shell space-y-14">
      <section data-reveal className="mx-auto max-w-3xl text-center">
        <p className="eyebrow">Cross-session standings</p>
        <h1 className="display mt-3 text-balance">
          The all-time <span className="gradient-text">model leaderboard.</span>
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-pretty text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
          Win rates aggregate across every completed AI Arena session. Ties are
          counted separately. Cost is approximated from public provider pricing
          and stored token usage.
        </p>
      </section>

      <section
        data-reveal
        className="mx-auto grid w-full max-w-3xl grid-cols-3 sm:divide-x sm:divide-border/50"
      >
        <SummaryStat
          label="Models tracked"
          value={data ? String(data.rows.length) : null}
        />
        <SummaryStat
          label="Sessions counted"
          value={data ? String(data.sessionsIncluded) : null}
        />
        <SummaryStat
          label="Top win rate"
          value={
            data
              ? top
                ? `${top.winRate.toFixed(1)}%`
                : '0.0%'
              : null
          }
        />
      </section>

      <section data-reveal className="space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="eyebrow">Model standings</p>
            <h2 className="mt-2 text-xl font-semibold tracking-tight sm:text-2xl">
              Sorted by win rate
            </h2>
          </div>
          <p className="text-xs text-muted-foreground">
            {data?.rows.length ?? 0} models
          </p>
        </div>

        {data && data.rows.length > 0 ? (
          <div className="overflow-hidden rounded-xl border border-border/40">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Model</TableHead>
                    <TableHead className="text-right">Wins</TableHead>
                    <TableHead className="text-right">Ties</TableHead>
                    <TableHead className="text-right">Rounds</TableHead>
                    <TableHead className="text-right">Win %</TableHead>
                    <TableHead className="text-right">Total votes</TableHead>
                    <TableHead className="text-right">Reliability</TableHead>
                    <TableHead className="text-right">Est. cost</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.rows.map((row, index) => (
                    <LeaderboardRowItem
                      key={row.modelKey}
                      row={row}
                      rank={index + 1}
                    />
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        ) : data ? (
          <Empty className="rounded-xl border border-dashed border-border/50 py-12">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <TrophyIcon />
              </EmptyMedia>
              <EmptyTitle>No completed sessions yet</EmptyTitle>
              <EmptyDescription>
                Run your first AI Arena session and the leaderboard will start
                tracking automatically.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

function LeaderboardRowItem({
  row,
  rank,
}: {
  row: LeaderboardRow
  rank: number
}) {
  return (
    <TableRow>
      <TableCell>
        <RankBadge rank={rank} />
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-3">
          <span
            aria-hidden
            className="size-2.5 rounded-full ring-2 ring-background"
            style={{ backgroundColor: row.accent }}
          />
          <span className="font-medium">{row.label}</span>
        </div>
      </TableCell>
      <TableCell className="text-right font-mono tabular-nums">
        {row.wins}
      </TableCell>
      <TableCell className="text-right font-mono tabular-nums text-muted-foreground">
        {row.ties}
      </TableCell>
      <TableCell className="text-right font-mono tabular-nums text-muted-foreground">
        {row.roundsPlayed}
      </TableCell>
      <TableCell className="text-right">
        <WinRateBar value={row.winRate} />
      </TableCell>
      <TableCell className="text-right font-mono tabular-nums text-muted-foreground">
        {row.totalVotes.toLocaleString()}
      </TableCell>
      <TableCell className="text-right font-mono tabular-nums text-muted-foreground">
        {row.reliability.toFixed(0)}%
      </TableCell>
      <TableCell className="text-right font-mono tabular-nums">
        {formatMicrosUsd(row.costMicrosUsd)}
      </TableCell>
    </TableRow>
  )
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <span className="inline-flex size-7 items-center justify-center rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-300">
        <CrownIcon className="size-3.5" />
      </span>
    )
  }
  if (rank === 2 || rank === 3) {
    return (
      <span className="inline-flex size-7 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <MedalIcon className="size-3.5" />
      </span>
    )
  }
  return (
    <span className="inline-flex size-7 items-center justify-center font-mono text-xs text-muted-foreground">
      {rank}
    </span>
  )
}

function WinRateBar({ value }: { value: number }) {
  const clamped = Math.max(0, Math.min(100, value))
  return (
    <div className="ml-auto flex items-center gap-2">
      <div
        className="relative h-1.5 w-24 overflow-hidden rounded-full bg-muted"
        aria-hidden
      >
        <div
          className={cn(
            'absolute inset-y-0 left-0 rounded-full transition-[width] duration-700',
            clamped >= 50
              ? 'bg-primary'
              : clamped >= 25
                ? 'bg-primary/70'
                : 'bg-muted-foreground/40',
          )}
          style={{ width: `${clamped}%` }}
        />
      </div>
      <span className="font-mono text-xs tabular-nums text-foreground">
        {value.toFixed(1)}%
      </span>
    </div>
  )
}

function SummaryStat({
  label,
  value,
}: {
  label: string
  value: string | null
}) {
  return (
    <div className="px-3 text-center sm:px-6">
      <p className="text-[0.65rem] uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </p>
      {value === null ? (
        <Skeleton className="mx-auto mt-2 h-7 w-20" />
      ) : (
        <p className="display mt-1 text-2xl tabular-nums sm:text-3xl">
          {value}
        </p>
      )}
    </div>
  )
}
