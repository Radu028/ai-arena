import { Link, createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { useMutation, useQuery } from 'convex/react'
import type { FunctionReturnType } from 'convex/server'
import {
  ArrowRightIcon,
  CoinsIcon,
  CopyIcon,
  PlusIcon,
  ShieldCheckIcon,
  ShieldIcon,
  SparklesIcon,
  Wand2Icon,
} from 'lucide-react'
import { toast } from 'sonner'
import { api } from '@convex/_generated/api'
import { formatMicrosUsd } from '@shared/arena'
import { AdminGuard } from '#/components/AdminGuard'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '#/components/ui/empty'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { Separator } from '#/components/ui/separator'
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

type AdminCostSummary = FunctionReturnType<typeof api.stats.getAdminCostSummary>
type AdminUsersResult = FunctionReturnType<typeof api.admins.list>
type AdminSessionsResult = FunctionReturnType<
  typeof api.sessions.listAdminSessions
>

export const Route = createFileRoute('/admin/')({
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
    <div className="shell space-y-8">
      <AdminGuard title="Admin console">
        {data && !data.isAuthenticated ? (
          <Empty className="surface rounded-2xl p-10">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <ShieldIcon />
              </EmptyMedia>
              <EmptyTitle>Admin access required</EmptyTitle>
              <EmptyDescription>
                You&rsquo;re signed in but this email isn&rsquo;t on the
                allowlist. Ask <code>radupopa028@gmail.com</code> to grant
                access from this page.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : null}

        <header
          data-reveal
          className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"
        >
          <div>
            <p className="eyebrow">Admin console</p>
            <h1 className="display mt-2 text-balance text-4xl sm:text-5xl">
              Sessions
            </h1>
            <p className="mt-3 max-w-xl text-pretty text-base leading-7 text-muted-foreground">
              Create waiting rooms, start battles manually, and stop sessions
              when you want to cut off provider spend.
            </p>
          </div>
          {hasAdminAccess ? (
            <Button asChild size="lg" className="h-11 rounded-full px-5">
              <Link to="/admin/sessions/new">
                <PlusIcon className="size-4" />
                New session
              </Link>
            </Button>
          ) : null}
        </header>

        {hasAdminAccess && costs && costs.isAuthenticated ? (
          <CostSection costs={costs} />
        ) : null}

        {hasAdminAccess && adminUsers && adminUsers.isAuthenticated ? (
          <AdminAccessSection
            adminUsers={adminUsers}
            adminEmail={adminEmail}
            onAdminEmailChange={setAdminEmail}
            onSubmit={handleGrantAdmin}
            granting={grantingAdmin}
          />
        ) : null}

        {hasAdminAccess ? <SessionListSection data={data} /> : null}
      </AdminGuard>
    </div>
  )
}

function CostSection({ costs }: { costs: NonNullable<AdminCostSummary> }) {
  return (
    <section data-reveal className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
      <div className="surface rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-300">
              <CoinsIcon className="size-5" />
            </div>
            <p className="text-sm font-semibold">Cost tracking</p>
          </div>
          <Badge
            variant="outline"
            className="font-mono text-[0.65rem] uppercase"
          >
            estimated
          </Badge>
        </div>

        <div className="mt-5">
          <p className="eyebrow">Total spend</p>
          <p className="mt-1 font-mono text-4xl font-semibold tabular-nums">
            {formatMicrosUsd(costs.totals.costMicrosUsd)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Aggregated across {costs.totals.sessions} sessions and{' '}
            {costs.totals.rounds} rounds.
          </p>
        </div>

        <Separator className="my-6 opacity-60" />

        <div className="grid grid-cols-2 gap-3">
          <MiniStat
            label="Sessions"
            value={costs.totals.sessions.toLocaleString()}
          />
          <MiniStat
            label="Rounds"
            value={costs.totals.rounds.toLocaleString()}
          />
          <MiniStat
            label="Input tokens"
            value={costs.totals.tokensIn.toLocaleString()}
          />
          <MiniStat
            label="Output tokens"
            value={costs.totals.tokensOut.toLocaleString()}
          />
        </div>
      </div>

      <div className="surface overflow-hidden rounded-2xl">
        <div className="flex items-center justify-between border-b border-border/60 px-5 py-3">
          <p className="text-sm font-semibold">Cost by model</p>
          <Badge
            variant="outline"
            className="font-mono text-[0.65rem] uppercase"
          >
            top spend first
          </Badge>
        </div>
        {costs.byModel.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Model</TableHead>
                  <TableHead className="text-right">Calls</TableHead>
                  <TableHead className="text-right">Tokens</TableHead>
                  <TableHead className="text-right">Cost</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {costs.byModel.map((row) => (
                  <TableRow key={row.modelKey}>
                    <TableCell>
                      <span className="inline-flex items-center gap-2">
                        <span
                          aria-hidden
                          className="size-2 rounded-full"
                          style={{ backgroundColor: row.accent }}
                        />
                        {row.label}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-mono tabular-nums">
                      {row.calls}
                      {row.failures > 0 ? (
                        <span className="ml-1 text-[0.7rem] text-muted-foreground">
                          ({row.failures} failed)
                        </span>
                      ) : null}
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs tabular-nums text-muted-foreground">
                      {row.tokensIn.toLocaleString()}
                      <span className="mx-1 opacity-40">/</span>
                      {row.tokensOut.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right font-mono tabular-nums">
                      {formatMicrosUsd(row.costMicrosUsd)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <Empty className="py-10">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <SparklesIcon />
              </EmptyMedia>
              <EmptyTitle>No model calls recorded yet</EmptyTitle>
              <EmptyDescription>
                Run a session and provider usage will show up here.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </div>
    </section>
  )
}

function AdminAccessSection({
  adminUsers,
  adminEmail,
  onAdminEmailChange,
  onSubmit,
  granting,
}: {
  adminUsers: NonNullable<AdminUsersResult>
  adminEmail: string
  onAdminEmailChange: (next: string) => void
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
  granting: boolean
}) {
  return (
    <section data-reveal className="surface overflow-hidden rounded-2xl">
      <div className="flex items-center gap-3 border-b border-border/60 px-6 py-4">
        <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <ShieldCheckIcon className="size-5" />
        </div>
        <div>
          <p className="text-sm font-semibold">Admin access</p>
          <p className="text-xs text-muted-foreground">
            <code>radupopa028@gmail.com</code> is the bootstrap admin. Add
            teammates by email after they sign in with Clerk.
          </p>
        </div>
      </div>

      <div className="grid gap-6 px-6 py-5 lg:grid-cols-[0.9fr_1.1fr]">
        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="space-y-2">
            <Label htmlFor="adminEmail">New admin email</Label>
            <Input
              id="adminEmail"
              type="email"
              value={adminEmail}
              onChange={(e) => onAdminEmailChange(e.target.value)}
              placeholder="teammate@example.com"
              className="h-10"
            />
          </div>
          <Button type="submit" disabled={granting}>
            <Wand2Icon className="size-4" />
            {granting ? 'Granting...' : 'Grant admin'}
          </Button>
        </form>

        <div className="overflow-hidden rounded-xl border border-border/60">
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
                  <TableCell className="font-medium">{email}</TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className="font-mono text-[0.65rem]"
                    >
                      bootstrap
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {adminUsers.admins.map((admin) => (
                <TableRow key={admin.id}>
                  <TableCell className="font-medium">{admin.email}</TableCell>
                  <TableCell className="text-muted-foreground">
                    Granted by {admin.grantedByEmail ?? 'admin'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </section>
  )
}

function SessionListSection({
  data,
}: {
  data: AdminSessionsResult | undefined
}) {
  return (
    <section data-reveal className="surface overflow-hidden rounded-2xl">
      <div className="border-b border-border/60 px-6 py-4">
        <p className="text-sm font-semibold">Recent sessions</p>
        <p className="text-xs text-muted-foreground">
          Sessions appear here once Clerk authentication is configured.
        </p>
      </div>

      {data && data.sessions.length > 0 ? (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Theme</TableHead>
                <TableHead className="text-right">Rounds</TableHead>
                <TableHead>Join code</TableHead>
                <TableHead>Created</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.sessions.map((session) => (
                <TableRow key={session.id} className="group">
                  <TableCell>
                    <Link
                      to="/admin/sessions/$sessionId"
                      params={{ sessionId: session.id }}
                      className="font-medium text-foreground transition-colors hover:text-primary"
                    >
                      {session.title}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <SessionStatusPill status={session.status} />
                  </TableCell>
                  <TableCell className="capitalize text-muted-foreground">
                    {session.theme}
                  </TableCell>
                  <TableCell className="text-right font-mono tabular-nums text-muted-foreground">
                    {session.roundCount}
                  </TableCell>
                  <TableCell>
                    <JoinCodeChip code={session.joinCode} />
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDateTime(session.createdAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Link
                      to="/admin/sessions/$sessionId"
                      params={{ sessionId: session.id }}
                      className="inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors group-hover:text-primary"
                    >
                      open <ArrowRightIcon className="size-3" />
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : data ? (
        <Empty className="flex-none py-12">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <SparklesIcon />
            </EmptyMedia>
            <EmptyTitle>No sessions yet</EmptyTitle>
            <EmptyDescription>
              Create your first arena to see it listed here.
            </EmptyDescription>
          </EmptyHeader>
          <Button asChild>
            <Link to="/admin/sessions/new">
              <PlusIcon className="size-4" />
              New session
            </Link>
          </Button>
        </Empty>
      ) : (
        <div className="space-y-2 p-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      )}
    </section>
  )
}

function SessionStatusPill({ status }: { status: string }) {
  const tone =
    status === 'active'
      ? 'bg-emerald-500/12 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300'
      : status === 'ended'
        ? 'bg-primary/12 text-primary dark:bg-primary/20'
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

function JoinCodeChip({ code }: { code: string }) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault()
        navigator.clipboard.writeText(code)
        toast.success(`Join code ${code} copied`)
      }}
      className="inline-flex items-center gap-1.5 rounded-md bg-muted/70 px-2 py-1 font-mono text-xs tracking-wider text-foreground transition-colors hover:bg-muted"
      title="Copy join code"
    >
      {code}
      <CopyIcon className="size-3 opacity-60" />
    </button>
  )
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border/60 bg-background/40 px-3 py-2.5">
      <p className="text-[0.62rem] uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-0.5 font-mono text-base font-semibold tabular-nums">
        {value}
      </p>
    </div>
  )
}
