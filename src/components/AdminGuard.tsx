import { useAuth } from '@clerk/tanstack-react-start'
import { Link, useLocation } from '@tanstack/react-router'
import { useConvexAuth } from 'convex/react'
import { Loader2Icon, LockKeyholeIcon, ShieldAlertIcon } from 'lucide-react'
import { useSyncExternalStore } from 'react'
import { useRuntimeConfig } from '#/components/AppProviders'
import { GoogleSignInButton } from '#/components/GoogleSignInButton'
import { Button } from '#/components/ui/button'
import { safeAuthRedirect, stringifyLocationSearch } from '#/lib/authRedirect'
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
  const runtime = useRuntimeConfig()
  const { isLoaded, isSignedIn } = useAuth()
  const convexAuth = useConvexAuth()
  const { pathname, search, hash } = useLocation()
  // Delay rendering the auth-resolved branches until after hydration so we
  // don't briefly flash "Sign in" on SSR when the user is in fact signed in.
  // The redirect URL itself is computed statically from the router so it
  // matches between SSR and the first client render.
  const mounted = useHydrated()

  const searchString = stringifyLocationSearch(search)
  const here = `${pathname}${searchString}${hash ? `#${hash}` : ''}`
  const returnTo = safeAuthRedirect(here)

  if (
    !mounted ||
    !isLoaded ||
    (runtime.hasConvex && isSignedIn && convexAuth.isLoading)
  ) {
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
          Loading authentication state from Clerk and Convex.
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
              Google handles 2FA, lockouts, and recovery for this sign-in.
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (runtime.hasConvex && !convexAuth.isAuthenticated) {
    return (
      <Empty className="surface rounded-2xl p-10">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <ShieldAlertIcon />
          </EmptyMedia>
          <EmptyTitle>Convex authentication is not connected</EmptyTitle>
          <EmptyDescription>
            Clerk sign-in succeeded, but Convex has not accepted the session
            token yet. Sign out and back in after the Clerk Convex integration
            and issuer domain are configured.
          </EmptyDescription>
        </EmptyHeader>
        <div className="flex flex-wrap justify-center gap-2">
          <Button asChild variant="outline" size="sm">
            <Link to="/login" search={{ redirect: returnTo }}>
              Retry sign-in
            </Link>
          </Button>
        </div>
      </Empty>
    )
  }

  return <>{children}</>
}

function useHydrated() {
  return useSyncExternalStore(
    (onStoreChange) => {
      queueMicrotask(onStoreChange)
      return () => {}
    },
    () => true,
    () => false,
  )
}
