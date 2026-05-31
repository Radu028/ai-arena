import { Link } from '@tanstack/react-router'
import { ArrowRightIcon, PlusIcon, SparklesIcon } from 'lucide-react'
import type { AdminSessionsResult } from '#/components/admin/AdminDashboardData'
import { JoinCodeChip } from '#/components/admin/JoinCodeChip'
import { Button } from '#/components/ui/button'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '#/components/ui/empty'
import { Skeleton } from '#/components/ui/skeleton'
import { StatusPill } from '#/components/ui/status-pill'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '#/components/ui/table'
import { formatDateTime } from '#/lib/format'

export function SessionListSection({
  data,
}: {
  data: AdminSessionsResult | undefined
}) {
  return (
    <section data-reveal className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow">Recent sessions</p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight sm:text-2xl">
            {data?.sessions.length
              ? `${data.sessions.length} session${data.sessions.length === 1 ? '' : 's'} created so far`
              : 'No arenas yet'}
          </h2>
        </div>
        {data && data.sessions.length > 0 ? (
          <Button asChild size="sm" variant="outline">
            <Link to="/admin/sessions/new">
              <PlusIcon className="size-3.5" />
              New
            </Link>
          </Button>
        ) : null}
      </div>

      {data && data.sessions.length > 0 ? (
        <div className="overflow-hidden rounded-xl border border-border/40">
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
                      <StatusPill
                        status={session.status}
                        label={session.status}
                      />
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
        </div>
      ) : data ? (
        <Empty className="flex-none rounded-xl border border-dashed border-border/50 py-12">
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
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-10 w-full" />
          ))}
        </div>
      )}
    </section>
  )
}
