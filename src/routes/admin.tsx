import { Link, createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { CoinsIcon, ShieldCheckIcon } from 'lucide-react'
import { toast } from 'sonner'
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
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
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
  const adminUsers = useQuery(api.admins.list, {})
  const grantAdmin = useMutation(api.admins.grant)
  const [adminEmail, setAdminEmail] = useState('')
  const [grantingAdmin, setGrantingAdmin] = useState(false)
  const hasAdminAccess = data?.isAuthenticated !== false

  async function handleGrantAdmin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const email = adminEmail.trim().toLowerCase()
    if (!email) {
      toast.error('Enter an email address.')
      return
    }
    setGrantingAdmin(true)
    try {
      const result = await grantAdmin({ email })
      setAdminEmail('')
      toast.success(
        result.alreadyAdmin
          ? `${result.email} is already an admin.`
          : `Admin access granted to ${result.email}.`,
      )
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Could not grant admin access.',
      )
    } finally {
      setGrantingAdmin(false)
    }
  }

  return (
    <div className="page-frame space-y-6">
      <AdminGuard title="Admin console">
        {data && !data.isAuthenticated ? (
          <Card className="arena-panel">
            <CardHeader>
              <CardTitle className="font-serif text-3xl">
                Admin access required
              </CardTitle>
              <CardDescription>
                You are signed in, but this email is not on the admin allowlist.
                Ask `radupopa028@gmail.com` to grant access from this page.
              </CardDescription>
            </CardHeader>
          </Card>
        ) : null}

        <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="eyebrow">Admin console</p>
            <h1 className="font-serif text-5xl text-foreground">Sessions</h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">
              Create waiting rooms, start battles manually, and stop sessions
              when you want to cut off provider spend.
            </p>
          </div>
          {hasAdminAccess ? (
            <Button asChild size="lg">
              <Link to="/admin/sessions/new">Create Session</Link>
            </Button>
          ) : null}
        </section>

        {hasAdminAccess && costs && costs.isAuthenticated ? (
          <section className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
            <Card className="arena-panel">
              <CardHeader>
                <CardTitle className="font-serif text-3xl">
                  <span className="inline-flex items-center gap-3">
                    <CoinsIcon className="size-5 text-(--arena-signal)" />
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
                  <Stat label="Rounds" value={costs.totals.rounds.toString()} />
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

        {hasAdminAccess && adminUsers && adminUsers.isAuthenticated ? (
          <Card className="arena-panel">
            <CardHeader>
              <CardTitle className="font-serif text-3xl">
                <span className="inline-flex items-center gap-3">
                  <ShieldCheckIcon className="size-5 text-(--arena-cobalt)" />
                  Admin access
                </span>
              </CardTitle>
              <CardDescription>
                `radupopa028@gmail.com` is the bootstrap admin. Add teammates by
                email after they sign in with Clerk.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form
                className="grid gap-3 md:grid-cols-[1fr_auto]"
                onSubmit={handleGrantAdmin}
              >
                <div className="space-y-2">
                  <Label htmlFor="adminEmail">New admin email</Label>
                  <Input
                    id="adminEmail"
                    type="email"
                    value={adminEmail}
                    onChange={(event) => setAdminEmail(event.target.value)}
                    placeholder="teammate@example.com"
                  />
                </div>
                <Button
                  type="submit"
                  className="self-end"
                  disabled={grantingAdmin}
                >
                  {grantingAdmin ? 'Granting...' : 'Grant Admin'}
                </Button>
              </form>

              <div className="rounded-[1.2rem] border border-border/70 bg-background/65">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Source</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {adminUsers.bootstrapAdmins.map((email) => (
                      <TableRow key={email}>
                        <TableCell>{email}</TableCell>
                        <TableCell>Bootstrap admin</TableCell>
                      </TableRow>
                    ))}
                    {adminUsers.admins.map((admin) => (
                      <TableRow key={admin.id}>
                        <TableCell>{admin.email}</TableCell>
                        <TableCell>
                          Granted by {admin.grantedByEmail ?? 'admin'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        ) : null}

        {hasAdminAccess ? (
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
                            className="font-medium text-(--arena-cobalt) no-underline"
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
                        <TableCell>
                          {formatDateTime(session.createdAt)}
                        </TableCell>
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
        ) : null}
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
