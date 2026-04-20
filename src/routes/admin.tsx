import { Link, createFileRoute } from '@tanstack/react-router'
import { useQuery } from 'convex/react'
import { CoinsIcon } from 'lucide-react'
import { api } from '@convex/_generated/api'
import { formatMicrosUsd } from '@shared/arena'
import { AdminGuard } from '#/components/AdminGuard'
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

export const Route = createFileRoute('/admin')({
  component: AdminDashboard,
})

function AdminDashboard() {
  const data = useQuery(api.sessions.listAdminSessions, {})
  const costs = useQuery(api.stats.getAdminCostSummary, {})

  return (
    <div className="page-frame space-y-6">
      <AdminGuard title="Admin console">
        <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="eyebrow">Admin console</p>
            <h1 className="font-serif text-5xl text-foreground">Sessions</h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">
              Create waiting rooms, start battles manually, and stop sessions
              when you want to cut off provider spend.
            </p>
          </div>
          <Button asChild size="lg">
            <Link to="/admin/sessions/new">Create Session</Link>
          </Button>
        </section>

        {costs && costs.isAuthenticated ? (
          <section className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
            <Card className="arena-panel">
              <CardHeader>
                <CardTitle className="font-serif text-3xl">
                  <span className="inline-flex items-center gap-3">
                    <CoinsIcon className="size-5 text-[var(--arena-signal)]" />
                    Cost tracking
                  </span>
                </CardTitle>
                <CardDescription>
                  Aggregated token usage and estimated USD spend across your
                  sessions. Pricing is approximate public list pricing.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <Stat
                    label="Sessions"
                    value={costs.totals.sessions.toString()}
                  />
                  <Stat
                    label="Rounds"
                    value={costs.totals.rounds.toString()}
                  />
                  <Stat
                    label="Input tokens"
                    value={costs.totals.tokensIn.toLocaleString()}
                  />
                  <Stat
                    label="Output tokens"
                    value={costs.totals.tokensOut.toLocaleString()}
                  />
                </div>
                <div className="rounded-[1.2rem] border border-border/70 bg-background/65 px-4 py-4">
                  <p className="eyebrow">Estimated total spend</p>
                  <p className="mt-2 font-serif text-4xl text-foreground">
                    {formatMicrosUsd(costs.totals.costMicrosUsd)}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="arena-panel">
              <CardHeader>
                <CardTitle className="font-serif text-2xl">
                  Cost by model
                </CardTitle>
                <CardDescription>
                  Highest-spending models across your session history.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {costs.byModel.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Model</TableHead>
                        <TableHead>Calls</TableHead>
                        <TableHead>Tokens (in/out)</TableHead>
                        <TableHead>Est. cost</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {costs.byModel.map((row) => (
                        <TableRow key={row.modelKey}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span
                                className="size-3 rounded-full"
                                style={{ backgroundColor: row.accent }}
                              />
                              {row.label}
                            </div>
                          </TableCell>
                          <TableCell>
                            {row.calls}
                            {row.failures > 0 ? (
                              <span className="ml-1 text-xs text-muted-foreground">
                                ({row.failures} failed)
                              </span>
                            ) : null}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {row.tokensIn.toLocaleString()} /{' '}
                            {row.tokensOut.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            {formatMicrosUsd(row.costMicrosUsd)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No model calls recorded yet.
                  </p>
                )}
              </CardContent>
            </Card>
          </section>
        ) : null}

        <Card className="arena-panel">
          <CardHeader>
            <CardTitle className="font-serif text-3xl">
              Recent sessions
            </CardTitle>
            <CardDescription>
              Sessions appear here once you are authenticated through Clerk.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {data && data.sessions.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Theme</TableHead>
                    <TableHead>Rounds</TableHead>
                    <TableHead>Join code</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.sessions.map((session) => (
                    <TableRow key={session.id}>
                      <TableCell>
                        <Link
                          to="/admin/sessions/$sessionId"
                          params={{ sessionId: session.id }}
                          className="font-medium text-[var(--arena-cobalt)] no-underline"
                        >
                          {session.title}
                        </Link>
                      </TableCell>
                      <TableCell className="capitalize">
                        {session.status}
                      </TableCell>
                      <TableCell className="capitalize">
                        {session.theme}
                      </TableCell>
                      <TableCell>{session.roundCount}</TableCell>
                      <TableCell>{session.joinCode}</TableCell>
                      <TableCell>{formatDateTime(session.createdAt)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="rounded-[1.2rem] border border-dashed border-border/80 bg-muted/40 px-4 py-8 text-center text-muted-foreground">
                No admin sessions yet.
              </div>
            )}
          </CardContent>
        </Card>
      </AdminGuard>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.2rem] border border-border/70 bg-background/65 px-4 py-3">
      <p className="eyebrow">{label}</p>
      <p className="mt-1 font-serif text-xl text-foreground">{value}</p>
    </div>
  )
}
