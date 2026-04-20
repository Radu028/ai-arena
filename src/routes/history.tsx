import { Link, createFileRoute } from '@tanstack/react-router'
import { useQuery } from 'convex/react'
import { HistoryIcon } from 'lucide-react'
import { api } from '@convex/_generated/api'
import { Badge } from '#/components/ui/badge'
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

function HistoryPage() {
  const data = useQuery(api.stats.listCompletedSessions, { limit: 50 })

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
              ? `${data.rows.length} session${data.rows.length === 1 ? '' : 's'} finished.`
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
                    <TableCell>{formatDateTime(row.endedAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="rounded-[1.2rem] border border-dashed border-border/80 bg-muted/40 px-4 py-8 text-center text-muted-foreground">
              {data ? 'No completed sessions yet — run your first arena!' : 'Loading...'}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
