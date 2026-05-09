import { useState } from 'react'
import { Link, createFileRoute } from '@tanstack/react-router'
import { useQuery } from 'convex/react'
import {
  ArrowRightIcon,
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  HistoryIcon,
  TrophyIcon,
} from 'lucide-react'
import { api } from '@convex/_generated/api'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
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
import { formatDateTime } from '#/lib/format'

export const Route = createFileRoute('/history')({
  component: HistoryPage,
})

const PAGE_SIZE = 24

function HistoryPage() {
  const [cursor, setCursor] = useState<string | null>(null)
  const [previousCursors, setPreviousCursors] = useState<Array<string | null>>(
    [],
  )
  const data = useQuery(api.stats.listCompletedSessions, {
    limit: PAGE_SIZE,
    cursor,
  })

  const pageNumber = previousCursors.length + 1

  function goToNextPage() {
    if (!data?.nextCursor) return
    setPreviousCursors((current) => [...current, cursor])
    setCursor(data.nextCursor)
  }

  function goToPreviousPage() {
    setCursor(previousCursors.at(-1) ?? null)
    setPreviousCursors((current) => current.slice(0, -1))
  }

  return (
    <div className="shell space-y-12">
      <section data-reveal className="mx-auto max-w-3xl text-center">
        <p className="eyebrow">Public archive</p>
        <h1 className="display mt-3 text-balance">
          Every finished arena,{' '}
          <span className="gradient-text">round by round.</span>
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-pretty text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
          Browse past battles to see how each topic landed, who won, and which
          model the audience rallied behind.
        </p>
      </section>

      <section data-reveal className="space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="eyebrow">Completed sessions</p>
            <h2 className="mt-2 text-xl font-semibold tracking-tight sm:text-2xl">
              {data
                ? `Page ${pageNumber} · ${data.rows.length} session${data.rows.length === 1 ? '' : 's'}`
                : 'Loading session archive…'}
            </h2>
          </div>
          {data?.hasMore ? (
            <p className="text-xs text-muted-foreground">more available →</p>
          ) : data ? (
            <p className="text-xs text-muted-foreground">end of archive</p>
          ) : null}
        </div>

        {data && data.rows.length > 0 ? (
          <div className="overflow-hidden rounded-xl border border-border/40">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Theme</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Rounds</TableHead>
                  <TableHead className="text-right">Models</TableHead>
                  <TableHead>Top winner</TableHead>
                  <TableHead className="text-right">Votes</TableHead>
                  <TableHead>Finished</TableHead>
                </TableRow>
              </TableHeader>
                <TableBody>
                  {data.rows.map((row) => (
                    <TableRow key={row.id} className="group">
                      <TableCell className="max-w-xs">
                        <Link
                          to="/sessions/$slug"
                          params={{ slug: row.slug }}
                          className="font-medium text-foreground transition-colors hover:text-primary"
                        >
                          <span className="truncate">{row.title}</span>
                          <ArrowRightIcon className="ml-2 inline size-3 -translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-normal">
                          {row.themeLabel}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <StatusPill status={row.status} />
                      </TableCell>
                      <TableCell className="text-right font-mono tabular-nums text-muted-foreground">
                        {row.completedRounds}/{row.roundCount}
                      </TableCell>
                      <TableCell className="text-right font-mono tabular-nums text-muted-foreground">
                        {row.modelCount}
                      </TableCell>
                      <TableCell>
                        {row.overallWinner ? (
                          <span className="inline-flex items-center gap-2">
                            <TrophyIcon className="size-3.5 text-amber-500 dark:text-amber-300" />
                            <span className="font-medium">
                              {row.overallWinner.label}
                            </span>
                            <Badge variant="secondary" className="font-mono">
                              {row.overallWinner.wins}
                            </Badge>
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-mono tabular-nums">
                        {row.totalHumanVotes}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        <span className="inline-flex items-center gap-1.5">
                          <CalendarIcon className="size-3" />
                          {formatDateTime(row.finishedAt)}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        ) : data ? (
          <Empty className="rounded-xl border border-dashed border-border/50 py-12">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <HistoryIcon />
              </EmptyMedia>
              <EmptyTitle>No completed sessions yet</EmptyTitle>
              <EmptyDescription>
                Run your first arena and it&rsquo;ll show up here.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <p className="text-xs text-muted-foreground">
            Page <span className="font-mono">{pageNumber}</span>
          </p>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={goToPreviousPage}
              disabled={previousCursors.length === 0}
            >
              <ChevronLeftIcon className="size-3.5" />
              Prev
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={goToNextPage}
              disabled={!data?.nextCursor}
            >
              Next
              <ChevronRightIcon className="size-3.5" />
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}

function StatusPill({ status }: { status: string }) {
  const tone =
    status === 'ended'
      ? 'bg-emerald-500/12 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300'
      : status === 'stopped'
        ? 'bg-red-500/12 text-red-700 dark:bg-red-400/15 dark:text-red-300'
        : 'bg-muted text-muted-foreground'
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${tone}`}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {status}
    </span>
  )
}
