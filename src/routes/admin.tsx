import { Link, createFileRoute } from '@tanstack/react-router'
import { useQuery } from 'convex/react'
import { api } from '@convex/_generated/api'
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
