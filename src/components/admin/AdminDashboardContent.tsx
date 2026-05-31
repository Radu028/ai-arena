import { Link } from '@tanstack/react-router'
import { useEffect, useReducer } from 'react'
import type { FormEvent } from 'react'
import { useAction, useMutation, useQuery } from 'convex/react'
import { PlusIcon, ShieldIcon } from 'lucide-react'
import { toast } from 'sonner'
import { api } from '@convex/_generated/api'
import { AdminAccessSection } from '#/components/admin/AdminAccessSection'
import type { SignedUpUsersResult } from '#/components/admin/AdminDashboardData'
import { CostSection } from '#/components/admin/CostSection'
import { SessionListSection } from '#/components/admin/SessionListSection'
import { Button } from '#/components/ui/button'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '#/components/ui/empty'

interface AdminDashboardState {
  adminEmail: string
  grantingAdminEmail: string | null
  revokingAdminEmail: string | null
  userSearch: string
  signedUpUsers: SignedUpUsersResult | null
  loadingUsers: boolean
  usersError: string | null
}

type AdminDashboardAction =
  | { type: 'adminEmailChanged'; value: string }
  | { type: 'grantStarted'; email: string }
  | { type: 'grantFinished'; clearManualInput: boolean }
  | { type: 'revokeStarted'; email: string }
  | { type: 'revokeFinished' }
  | { type: 'userSearchChanged'; value: string }
  | { type: 'signedUpUsersLoadStarted' }
  | { type: 'signedUpUsersLoadSucceeded'; value: SignedUpUsersResult }
  | { type: 'signedUpUsersLoadFailed'; message: string }

const initialAdminDashboardState: AdminDashboardState = {
  adminEmail: '',
  grantingAdminEmail: null,
  revokingAdminEmail: null,
  userSearch: '',
  signedUpUsers: null,
  loadingUsers: false,
  usersError: null,
}

export function AdminDashboardContent() {
  const data = useQuery(api.sessions.listAdminSessions, {})
  const costs = useQuery(api.stats.getAdminCostSummary, {})
  const adminUsers = useQuery(api.admins.list, {})
  const grantAdmin = useMutation(api.admins.grant)
  const revokeAdmin = useMutation(api.admins.revoke)
  const listSignedUpUsers = useAction(api.admins.listSignedUpUsers)
  const [state, dispatch] = useReducer(
    adminDashboardReducer,
    initialAdminDashboardState,
  )
  const hasAdminAccess = data?.isAuthenticated !== false
  const canLoadUsers = adminUsers?.isAuthenticated === true

  useEffect(() => {
    if (!canLoadUsers) {
      return
    }

    let cancelled = false
    const timeout = window.setTimeout(() => {
      dispatch({ type: 'signedUpUsersLoadStarted' })
      void listSignedUpUsers({
        query: state.userSearch.trim() || undefined,
        limit: 100,
      })
        .then((result) => {
          if (!cancelled) {
            dispatch({ type: 'signedUpUsersLoadSucceeded', value: result })
          }
        })
        .catch((error: unknown) => {
          if (!cancelled) {
            dispatch({
              type: 'signedUpUsersLoadFailed',
              message:
                error instanceof Error
                  ? error.message
                  : 'Could not load signed-up users.',
            })
          }
        })
    }, 250)

    return () => {
      cancelled = true
      window.clearTimeout(timeout)
    }
  }, [canLoadUsers, listSignedUpUsers, state.userSearch])

  async function handleGrantAdmin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    await handleGrantAdminEmail(state.adminEmail, { clearManualInput: true })
  }

  async function handleGrantAdminEmail(
    rawEmail: string,
    options: { clearManualInput?: boolean } = {},
  ) {
    const email = rawEmail.trim().toLowerCase()
    if (!email) {
      toast.error('Enter an email address.')
      return
    }
    dispatch({ type: 'grantStarted', email })
    try {
      const result = await grantAdmin({ email })
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
      dispatch({
        type: 'grantFinished',
        clearManualInput: options.clearManualInput === true,
      })
    }
  }

  async function handleRevokeAdminEmail(rawEmail: string) {
    const email = rawEmail.trim().toLowerCase()
    dispatch({ type: 'revokeStarted', email })
    try {
      const result = await revokeAdmin({ email })
      toast.success(
        result.alreadyRevoked
          ? `${result.email} was already removed.`
          : `Admin access removed from ${result.email}.`,
      )
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Could not remove admin access.',
      )
    } finally {
      dispatch({ type: 'revokeFinished' })
    }
  }

  return (
    <>
      {data && !data.isAuthenticated ? (
        <Empty className="rounded-2xl border border-border/60 bg-card/40 p-10">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <ShieldIcon />
            </EmptyMedia>
            <EmptyTitle>Admin access required</EmptyTitle>
            <EmptyDescription>
              You&rsquo;re signed in but this email isn&rsquo;t on the
              allowlist. Ask <code>radupopa028@gmail.com</code> to grant access
              from this page.
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
            Create waiting rooms, start battles manually, and stop sessions when
            you want to cut off provider spend.
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

      {hasAdminAccess ? <SessionListSection data={data} /> : null}

      {hasAdminAccess && adminUsers && adminUsers.isAuthenticated ? (
        <AdminAccessSection
          adminUsers={adminUsers}
          adminEmail={state.adminEmail}
          onAdminEmailChange={(value) =>
            dispatch({ type: 'adminEmailChanged', value })
          }
          onSubmit={handleGrantAdmin}
          grantingEmail={state.grantingAdminEmail}
          signedUpUsers={state.signedUpUsers}
          userSearch={state.userSearch}
          onUserSearchChange={(value) =>
            dispatch({ type: 'userSearchChanged', value })
          }
          loadingUsers={state.loadingUsers}
          usersError={state.usersError}
          onGrantEmail={handleGrantAdminEmail}
          revokingEmail={state.revokingAdminEmail}
          onRevokeEmail={handleRevokeAdminEmail}
        />
      ) : null}
    </>
  )
}

function adminDashboardReducer(
  state: AdminDashboardState,
  action: AdminDashboardAction,
): AdminDashboardState {
  switch (action.type) {
    case 'adminEmailChanged':
      return { ...state, adminEmail: action.value }
    case 'grantStarted':
      return { ...state, grantingAdminEmail: action.email }
    case 'grantFinished':
      return {
        ...state,
        adminEmail: action.clearManualInput ? '' : state.adminEmail,
        grantingAdminEmail: null,
      }
    case 'revokeStarted':
      return { ...state, revokingAdminEmail: action.email }
    case 'revokeFinished':
      return { ...state, revokingAdminEmail: null }
    case 'userSearchChanged':
      return { ...state, userSearch: action.value }
    case 'signedUpUsersLoadStarted':
      return { ...state, loadingUsers: true, usersError: null }
    case 'signedUpUsersLoadSucceeded':
      return {
        ...state,
        signedUpUsers: action.value,
        loadingUsers: false,
        usersError: null,
      }
    case 'signedUpUsersLoadFailed':
      return { ...state, loadingUsers: false, usersError: action.message }
  }
}
