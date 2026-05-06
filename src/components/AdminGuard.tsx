import { useAuth } from '@clerk/tanstack-react-start'
import { Link } from '@tanstack/react-router'
import { Loader2Icon, LockKeyholeIcon, ShieldAlertIcon } from 'lucide-react'
import { useRuntimeConfig } from '#/components/AppProviders'
import { GoogleSignInButton } from '#/components/GoogleSignInButton'
import { Button } from '#/components/ui/button'
import { currentAuthRedirect } from '#/lib/authRedirect'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '#/components/ui/empty'

export function AdminGuard({
  children,
  title = 'Admin access required',
}: {
  children: React.ReactNode
  title?: string
}) {
  const runtime = useRuntimeConfig()

  if (!runtime.hasClerk) {
    if (!runtime.hasDemoAdmin) {
      return (
        <Empty className="surface rounded-2xl p-10">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <ShieldAlertIcon />
            </EmptyMedia>
            <EmptyTitle>Authentication is not configured</EmptyTitle>
            <EmptyDescription>
              Add the Clerk environment variables, or enable demo admin mode for
              non-production demos.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )
    }
    return <>{children}</>
  }

  return <ConfiguredAdminGuard title={title}>{children}</ConfiguredAdminGuard>
}

function ConfiguredAdminGuard({
  children,
  title,
}: {
  children: React.ReactNode
  title: string
}) {
  const { isLoaded, isSignedIn } = useAuth()
  const returnTo = currentAuthRedirect()

  if (!isLoaded) {
    return (
      <div className="surface flex flex-col items-center gap-3 rounded-2xl border border-border/60 p-10 text-center">
        <Loader2Icon
          className="size-5 animate-spin text-muted-foreground"
          aria-hidden
        />
        <p className="text-sm font-medium text-foreground">
          Checking your session…
        </p>
        <p className="text-xs text-muted-foreground">
          Loading authentication state from Clerk.
        </p>
      </div>
    )
  }

  if (!isSignedIn) {
    return (
      <div className="surface relative overflow-hidden rounded-2xl border border-border/60">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-linear-to-b from-[color-mix(in_oklab,var(--arena-violet),transparent_88%)] to-transparent" />

        <div className="relative grid gap-8 p-8 sm:p-10 md:grid-cols-[minmax(0,1fr)_minmax(0,18rem)] md:items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/70 px-2.5 py-1 text-[0.7rem] uppercase tracking-[0.2em] text-muted-foreground">
              <LockKeyholeIcon className="size-3" aria-hidden />
              Restricted area
            </span>
            <h2 className="display mt-5 text-balance text-2xl sm:text-3xl">
              {title}
            </h2>
            <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground">
              Sign in with your Google account to create sessions, start rounds,
              and monitor provider spend. Only emails on the admin allow-list
              can perform privileged actions.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Button asChild variant="ghost" size="sm">
                <Link to="/login" search={{ redirect: returnTo }}>
                  Open the sign-in page →
                </Link>
              </Button>
            </div>
          </div>

          <div className="rounded-2xl border border-border/60 bg-background/70 p-5">
            <p className="eyebrow mb-3 text-[0.65rem]">Quick sign-in</p>
            <GoogleSignInButton
              redirectTo={returnTo}
              label="Sign in with Google"
            />
            <p className="mt-3 text-[11px] leading-5 text-muted-foreground">
              We never see your password. Google handles 2FA, lockouts, and
              recovery for you.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
