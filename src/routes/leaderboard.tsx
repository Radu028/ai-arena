import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from 'convex/react'
import { TrophyIcon } from 'lucide-react'
import { api } from '@convex/_generated/api'
import { formatMicrosUsd } from '@shared/arena'
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

export const Route = createFileRoute('/leaderboard')({
  component: LeaderboardPage,
})

function LeaderboardPage() {
  const data = useQuery(api.stats.getModelLeaderboard, {})

  return (
    <div className="page-frame space-y-6">
      <section className="hero-shell overflow-hidden px-6 py-8 md:px-10 md:py-12">
        <div className="space-y-4">
          <Badge className="rounded-full bg-[var(--arena-signal)] px-4 py-1.5 text-white">
            Cross-session rankings
          </Badge>
          <p className="eyebrow">All-time leaderboard</p>
          <h1 className="display max-w-3xl text-balance">
            Which model wins the most rounds across every arena session?
          </h1>
          <p className="max-w-2xl text-base leading-7 text-muted-foreground">
            Win rate is calculated across all completed sessions. Ties count
            separately. Cost estimates use public provider pricing and saved
            token usage per response.
          </p>
        </div>
      </section>

      <Card className="arena-panel">
        <CardHeader>
          <CardTitle className="font-serif text-3xl">
            <span className="inline-flex items-center gap-3">
              <TrophyIcon className="size-6 text-[var(--arena-signal)]" />
              Model standings
            </span>
          </CardTitle>
          <CardDescription>
            {data
              ? `${data.rows.length} models across ${data.sessionsIncluded} completed session${data.sessionsIncluded === 1 ? '' : 's'}.`
              : 'Loading aggregate stats...'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {data && data.rows.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Model</TableHead>
                  <TableHead>Wins</TableHead>
                  <TableHead>Ties</TableHead>
                  <TableHead>Rounds</TableHead>
                  <TableHead>Win %</TableHead>
                  <TableHead>Total votes</TableHead>
                  <TableHead>Reliability</TableHead>
                  <TableHead>Est. cost</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.rows.map((row, index) => (
                  <TableRow key={row.modelKey}>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {index + 1}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <span
                          className="size-3 rounded-full"
                          style={{ backgroundColor: row.accent }}
                        />
                        <span className="font-medium text-foreground">
                          {row.label}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{row.wins}</TableCell>
                    <TableCell>{row.ties}</TableCell>
                    <TableCell>{row.roundsPlayed}</TableCell>
                    <TableCell>{row.winRate.toFixed(1)}%</TableCell>
                    <TableCell>{row.totalVotes}</TableCell>
                    <TableCell>{row.reliability.toFixed(0)}%</TableCell>
                    <TableCell>{formatMicrosUsd(row.costMicrosUsd)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="rounded-[1.2rem] border border-dashed border-border/80 bg-muted/40 px-4 py-8 text-center text-muted-foreground">
              {data ? 'No completed sessions yet.' : 'Loading...'}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
