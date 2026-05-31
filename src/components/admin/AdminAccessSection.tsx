import { useMemo } from 'react'
import type { FormEvent } from 'react'
import { SearchIcon, UserMinusIcon, Wand2Icon } from 'lucide-react'
import type {
  AdminUsersResult,
  SignedUpUsersResult,
} from '#/components/admin/AdminDashboardData'
import { SignedUpUsersTable } from '#/components/admin/SignedUpUsersTable'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
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

export function AdminAccessSection({
  adminUsers,
  adminEmail,
  onAdminEmailChange,
  onSubmit,
  grantingEmail,
  signedUpUsers,
  userSearch,
  onUserSearchChange,
  loadingUsers,
  usersError,
  onGrantEmail,
  revokingEmail,
  onRevokeEmail,
}: {
  adminUsers: NonNullable<AdminUsersResult>
  adminEmail: string
  onAdminEmailChange: (next: string) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  grantingEmail: string | null
  signedUpUsers: SignedUpUsersResult | null
  userSearch: string
  onUserSearchChange: (next: string) => void
  loadingUsers: boolean
  usersError: string | null
  onGrantEmail: (email: string) => Promise<void>
  revokingEmail: string | null
  onRevokeEmail: (email: string) => Promise<void>
}) {
  const adminEmailSet = useMemo(
    () =>
      new Set([
        ...adminUsers.bootstrapAdmins.map((email) => email.toLowerCase()),
        ...adminUsers.admins.map((admin) => admin.email.toLowerCase()),
      ]),
    [adminUsers.admins, adminUsers.bootstrapAdmins],
  )

  return (
    <section data-reveal className="space-y-6">
      <div>
        <p className="eyebrow">Admin access</p>
        <h2 className="mt-2 text-xl font-semibold tracking-tight sm:text-2xl">
          Who can run the arena
        </h2>
        <p className="mt-1.5 text-sm text-muted-foreground">
          <code>radupopa028@gmail.com</code> is the bootstrap admin. Add
          teammates by email after they sign in with Clerk.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="space-y-2">
            <Label htmlFor="adminEmail">New admin email</Label>
            <Input
              id="adminEmail"
              type="email"
              value={adminEmail}
              onChange={(event) => onAdminEmailChange(event.target.value)}
              placeholder="teammate@example.com"
              className="h-10"
            />
          </div>
          <Button type="submit" disabled={grantingEmail !== null}>
            <Wand2Icon className="size-4" />
            {grantingEmail ? 'Granting...' : 'Grant admin'}
          </Button>
        </form>

        <div className="overflow-hidden rounded-xl border border-border/40">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Source</TableHead>
                <TableHead className="text-right">Access</TableHead>
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
                  <TableCell className="text-right">
                    <Badge variant="outline">Permanent</Badge>
                  </TableCell>
                </TableRow>
              ))}
              {adminUsers.admins.map((admin) => {
                const isRevoking = revokingEmail === admin.email.toLowerCase()
                return (
                  <TableRow key={admin.id}>
                    <TableCell className="font-medium">{admin.email}</TableCell>
                    <TableCell className="text-muted-foreground">
                      Granted by {admin.grantedByEmail ?? 'admin'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={revokingEmail !== null}
                        onClick={() => void onRevokeEmail(admin.email)}
                      >
                        <UserMinusIcon className="size-3.5" />
                        {isRevoking ? 'Removing...' : 'Remove'}
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="space-y-4 rounded-2xl border border-border/40 p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow">Signed-up users</p>
            <h3 className="mt-2 text-lg font-semibold tracking-tight">
              Grant access from Clerk users
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Search everyone who has signed in, then click once to make them an
              admin.
            </p>
          </div>
          {signedUpUsers ? (
            <p className="font-mono text-xs text-muted-foreground">
              {signedUpUsers.users.length} shown
              {signedUpUsers.totalCount > signedUpUsers.users.length
                ? ` of ${signedUpUsers.totalCount}`
                : ''}
            </p>
          ) : null}
        </div>

        <div className="relative">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={userSearch}
            onChange={(event) => onUserSearchChange(event.target.value)}
            placeholder="Search by name or email"
            className="h-10 pl-9"
          />
        </div>

        {usersError ? (
          <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {usersError}
          </p>
        ) : null}

        <SignedUpUsersTable
          users={signedUpUsers?.users ?? []}
          adminEmailSet={adminEmailSet}
          loading={loadingUsers}
          grantingEmail={grantingEmail}
          onGrantEmail={onGrantEmail}
        />
      </div>
    </section>
  )
}
