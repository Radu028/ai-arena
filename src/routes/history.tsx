import { useState } from 'react'
import { Link, createFileRoute } from '@tanstack/react-router'
import { useQuery } from 'convex/react'
import { ChevronLeftIcon, ChevronRightIcon, HistoryIcon } from 'lucide-react'
import { api } from '@convex/_generated/api'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
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
    <div className="page-frame space-y-6">
      <section className="hero-shell overflow-hidden px-6 py-8 md:px-10 md:py-12">
        <div className="space-y-4">
          <Badge className="rounded-full bg-[var(--arena-signal)] px-4 py-1.5 text-white">
            Public archive
          </Badge>
          <p className="eyebrow">Session history</p>
          <h1 className="display max-w-3xl text-balance">
            Every finished arena session, round-by-round.
          </h1>
          <p className="max-w-2xl text-base leading-7 text-muted-foreground">
            Browse past battles to see how each topic played out, who won, and
            which model the audience rallied behind.
          </p>
        </div>
      </section>

      <Card className="arena-panel">
        <CardHeader>
          <CardTitle className="font-serif text-3xl">
            <span className="inline-flex items-center gap-3">
              <HistoryIcon className="size-6 text-[var(--arena-cobalt)]" />
              Completed sessions
            </span>
          </CardTitle>
          <CardDescription>
            {data
              ? `${data.rows.length} session${data.rows.length === 1 ? '' : 's'} on page ${pageNumber}.`
              : 'Loading archive...'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {data && data.rows.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Theme</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Rounds</TableHead>
                  <TableHead>Models</TableHead>
                  <TableHead>Top winner</TableHead>
                  <TableHead>Total votes</TableHead>
                  <TableHead>Finished</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.rows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>
                      <Link
                        to="/sessions/$slug"
                        params={{ slug: row.slug }}
                        className="font-medium text-[var(--arena-cobalt)] no-underline"
                      >
                        {row.title}
                      </Link>
                    </TableCell>
                    <TableCell>{row.themeLabel}</TableCell>
                    <TableCell className="capitalize">{row.status}</TableCell>
                    <TableCell>
                      {row.completedRounds}/{row.roundCount}
                    </TableCell>
                    <TableCell>{row.modelCount}</TableCell>
                    <TableCell>
                      {row.overallWinner ? (
                        <span className="inline-flex items-center gap-2">
                          {row.overallWinner.label}
                          <Badge variant="outline">
                            {row.overallWinner.wins} wins
                          </Badge>
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>{row.totalHumanVotes}</TableCell>
                    <TableCell>{formatDateTime(row.finishedAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="rounded-[1.2rem] border border-dashed border-border/80 bg-muted/40 px-4 py-8 text-center text-muted-foreground">
              {data
                ? 'No completed sessions yet — run your first arena!'
                : 'Loading...'}
            </div>
          )}
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-border/70 pt-4">
            <p className="text-sm text-muted-foreground">
              Page {pageNumber}
              {data?.hasMore
                ? ' · more sessions available'
                : ' · end of archive'}
            </p>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={goToPreviousPage}
                disabled={previousCursors.length === 0}
              >
                <ChevronLeftIcon className="size-4" />
                Previous
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={goToNextPage}
                disabled={!data?.nextCursor}
              >
                Next
                <ChevronRightIcon className="size-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
