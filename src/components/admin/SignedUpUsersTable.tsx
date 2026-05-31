import { UserPlusIcon } from 'lucide-react'
import type { SignedUpUsersResult } from '#/components/admin/AdminDashboardData'
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

export function SignedUpUsersTable({
  users,
  adminEmailSet,
  loading,
  grantingEmail,
  onGrantEmail,
}: {
  users: NonNullable<SignedUpUsersResult>['users']
  adminEmailSet: Set<string>
  loading: boolean
  grantingEmail: string | null
  onGrantEmail: (email: string) => Promise<void>
}) {
  if (loading && users.length === 0) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-12 w-full" />
        ))}
      </div>
    )
  }

  if (!loading && users.length === 0) {
    return (
      <Empty className="rounded-xl border border-dashed border-border/50 py-10">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <UserPlusIcon />
          </EmptyMedia>
          <EmptyTitle>No users found</EmptyTitle>
          <EmptyDescription>
            Try a different search, or ask the user to sign in once with Google.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border/40">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Signed up</TableHead>
              <TableHead>Last sign-in</TableHead>
              <TableHead className="text-right">Access</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => {
              const isAdmin = adminEmailSet.has(user.email.toLowerCase())
              const isGranting = grantingEmail === user.email.toLowerCase()
              return (
                <TableRow key={user.id || user.email}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {user.imageUrl ? (
                        <img
                          src={user.imageUrl}
                          alt=""
                          className="size-8 rounded-full border border-border/50"
                        />
                      ) : (
                        <span className="flex size-8 items-center justify-center rounded-full bg-muted text-xs font-semibold uppercase">
                          {user.email.slice(0, 1)}
                        </span>
                      )}
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {user.createdAt ? formatDateTime(user.createdAt) : 'None'}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {user.lastSignInAt
                      ? formatDateTime(user.lastSignInAt)
                      : 'Never'}
                  </TableCell>
                  <TableCell className="text-right">
                    {isAdmin ? (
                      <Badge variant="secondary">Admin</Badge>
                    ) : (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={grantingEmail !== null}
                        onClick={() => void onGrantEmail(user.email)}
                      >
                        <UserPlusIcon className="size-3.5" />
                        {isGranting ? 'Granting...' : 'Make admin'}
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
