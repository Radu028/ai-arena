import { useEffect, useState } from 'react'
import { Link, useLocation } from '@tanstack/react-router'
import { useAuth, useClerk, useUser } from '@clerk/tanstack-react-start'
import {
  ArrowRightIcon,
  ClockIcon,
  HomeIcon,
  LogInIcon,
  LogOutIcon,
  MenuIcon,
  ShieldIcon,
  TrophyIcon,
  UserCircle2Icon,
  XIcon,
} from 'lucide-react'
import { useRuntimeConfig } from '#/components/AppProviders'
import { ArenaLogo } from './ArenaLogo'
import ThemeToggle from './ThemeToggle'
import { Button } from '#/components/ui/button'
import { GoogleSignInButton } from '#/components/GoogleSignInButton'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '#/components/ui/dropdown-menu'
import { cn } from '#/lib/utils'
import { AdminOnly } from './AdminOnly'
import { safeAuthRedirect, stringifyLocationSearch } from '#/lib/authRedirect'

const NAV_LINKS = [
  { to: '/', label: 'Home', icon: HomeIcon, exact: true },
  { to: '/join', label: 'Join', icon: LogInIcon },
  { to: '/leaderboard', label: 'Leaderboard', icon: TrophyIcon },
  { to: '/history', label: 'History', icon: ClockIcon },
] as const

const ADMIN_NAV_LINK = {
  to: '/admin',
  label: 'Admin',
  icon: ShieldIcon,
} as const

export default function Header() {
  const runtime = useRuntimeConfig()
  const { pathname } = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close the mobile menu whenever the route changes
  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  return (
    <header
      className={cn(
        'sticky top-0 z-50 transition-all duration-200',
        scrolled
          ? 'border-b border-border/60 bg-background/85 backdrop-blur-xl'
          : 'border-b border-transparent bg-background/40 backdrop-blur-md',
      )}
    >
      <nav className="shell flex items-center gap-3 py-3">
        <Link
          to="/"
          className="group inline-flex items-center gap-2.5"
          aria-label="AI Arena home"
        >
          <span className="relative inline-flex">
            <ArenaLogo
              size={32}
              className="rounded-[10px] transition-transform group-hover:rotate-6"
            />
            <span className="pointer-events-none absolute -inset-2 rounded-2xl opacity-0 transition-opacity group-hover:opacity-100 group-hover:[box-shadow:0_0_24px_-4px_color-mix(in_oklab,var(--arena-violet),transparent_40%)]" />
          </span>
          <span className="flex flex-col leading-none">
            <span className="text-[0.95rem] font-semibold tracking-tight whitespace-nowrap">
              AI Arena
            </span>
            <span className="mt-0.5 hidden whitespace-nowrap text-[0.625rem] uppercase tracking-[0.2em] text-muted-foreground lg:inline-block">
              live model battles
            </span>
          </span>
        </Link>

        <div className="ml-2 hidden items-center gap-1 md:flex">
          {NAV_LINKS.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className="nav-link"
              activeOptions={{ exact: to === '/' }}
              activeProps={{ className: 'nav-link is-active' }}
            >
              <Icon className="size-3.5" />
              {label}
            </Link>
          ))}
          <AdminOnly>
            <HeaderNavLink {...ADMIN_NAV_LINK} />
          </AdminOnly>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          {runtime.hasClerk ? (
            <HeaderAuth />
          ) : (
            <AdminOnly>
              <Button
                asChild
                variant="outline"
                size="sm"
                className="hidden sm:inline-flex"
              >
                <Link to="/admin">Admin</Link>
              </Button>
            </AdminOnly>
          )}

          <button
            type="button"
            className="inline-flex size-9 items-center justify-center rounded-full border border-border/70 bg-background/60 text-foreground transition-colors hover:bg-muted md:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? (
              <XIcon className="size-4" />
            ) : (
              <MenuIcon className="size-4" />
            )}
          </button>
        </div>
      </nav>

      <div
        className={cn(
          'overflow-hidden border-t border-border/0 bg-background/95 backdrop-blur-xl transition-[max-height,border-color,opacity] duration-300 ease-out md:hidden',
          mobileOpen
            ? 'max-h-[420px] border-border/60 opacity-100'
            : 'pointer-events-none max-h-0 opacity-0',
        )}
        aria-hidden={!mobileOpen}
      >
        <div className="flex flex-col gap-1 px-4 py-3">
          {NAV_LINKS.map(({ to, label, icon: Icon }) => (
            <HeaderNavLink
              key={to}
              to={to}
              label={label}
              icon={Icon}
              mobile
              onNavigate={() => setMobileOpen(false)}
            />
          ))}
          <AdminOnly>
            <HeaderNavLink
              {...ADMIN_NAV_LINK}
              mobile
              onNavigate={() => setMobileOpen(false)}
            />
          </AdminOnly>
          {runtime.hasClerk ? (
            <MobileAuthLinks onNavigate={() => setMobileOpen(false)} />
          ) : null}
        </div>
      </div>
    </header>
  )
}

function HeaderNavLink({
  to,
  label,
  icon: Icon,
  mobile = false,
  onNavigate,
}: {
  to: '/' | '/join' | '/leaderboard' | '/history' | '/admin'
  label: string
  icon: React.ComponentType<{ className?: string }>
  mobile?: boolean
  onNavigate?: () => void
}) {
  return (
    <Link
      to={to}
      className={cn('nav-link', mobile && 'justify-start text-sm')}
      activeOptions={{ exact: to === '/' }}
      activeProps={{
        className: cn('nav-link is-active', mobile && 'justify-start text-sm'),
      }}
      onClick={onNavigate}
    >
      <Icon className={mobile ? 'size-4' : 'size-3.5'} />
      {label}
    </Link>
  )
}

function HeaderAuth() {
  const { isLoaded, isSignedIn } = useAuth()
  const redirect = useCurrentRedirect()

  if (!isLoaded) {
    return (
      <Button
        variant="ghost"
        size="sm"
        disabled
        className="h-9 rounded-full py-1 pl-1 pr-2.5 sm:min-w-34"
      >
        <span className="size-7 shrink-0 animate-pulse rounded-full bg-muted" />
        <span className="hidden h-3 w-18 animate-pulse rounded-full bg-muted sm:inline-block" />
        <span className="sr-only">Loading session</span>
      </Button>
    )
  }

  if (!isSignedIn) {
    return (
      <div className="hidden items-center sm:flex">
        <Button asChild size="sm" className="group h-9 rounded-full px-4">
          <Link
            to="/login"
            search={{ redirect }}
            aria-label="Sign in with Google"
          >
            <span>Sign in</span>
            <ArrowRightIcon className="ml-1.5 size-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </Button>
      </div>
    )
  }

  return <HeaderUserMenu />
}

function HeaderUserMenu() {
  const { user } = useUser()
  const clerk = useClerk()

  const fullName = user?.fullName?.trim() || user?.username?.trim() || ''
  const email = user?.primaryEmailAddress?.emailAddress ?? ''
  const initials = computeInitials(fullName || email)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Account menu"
          className="group inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/70 py-1 pl-1 pr-2.5 text-sm transition-colors hover:border-border hover:bg-muted/60"
        >
          <Avatar imageUrl={user?.imageUrl} fallback={initials} />
          <span className="hidden max-w-40 truncate text-left text-[13px] font-medium text-foreground sm:inline-block">
            {fullName || email || 'Account'}
          </span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="px-2 py-1.5">
          <div className="flex items-center gap-2.5">
            <Avatar imageUrl={user?.imageUrl} fallback={initials} size="lg" />
            <div className="min-w-0 leading-tight">
              {fullName ? (
                <p className="truncate text-sm font-semibold text-foreground">
                  {fullName}
                </p>
              ) : null}
              {email ? (
                <p className="truncate text-xs text-muted-foreground">
                  {email}
                </p>
              ) : null}
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <AdminOnly>
          <DropdownMenuItem asChild>
            <Link to="/admin" className="cursor-pointer">
              <ShieldIcon className="size-4" />
              Admin console
            </Link>
          </DropdownMenuItem>
        </AdminOnly>
        <DropdownMenuItem asChild>
          <Link to="/history" className="cursor-pointer">
            <ClockIcon className="size-4" />
            Past sessions
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={() => {
            void clerk.signOut({ redirectUrl: '/' })
          }}
          className="cursor-pointer text-destructive focus:text-destructive"
        >
          <LogOutIcon className="size-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function MobileAuthLinks({ onNavigate }: { onNavigate: () => void }) {
  const { isLoaded, isSignedIn } = useAuth()
  const clerk = useClerk()
  const returnTo = useCurrentRedirect()

  if (!isLoaded) return null

  if (!isSignedIn) {
    return (
      <div className="mt-2 flex flex-col gap-1.5 border-t border-border/60 pt-3">
        <GoogleSignInButton
          redirectTo={returnTo}
          label="Sign in with Google"
          className="w-full"
        />
        <p className="px-1 text-[11px] leading-5 text-muted-foreground">
          Same button creates your account on first visit.
        </p>
      </div>
    )
  }

  return (
    <div className="mt-2 border-t border-border/60 pt-3">
      <Button
        variant="outline"
        className="w-full"
        onClick={() => {
          onNavigate()
          void clerk.signOut({ redirectUrl: '/' })
        }}
      >
        <LogOutIcon className="size-4" />
        Sign out
      </Button>
    </div>
  )
}

function Avatar({
  imageUrl,
  fallback,
  size = 'sm',
}: {
  imageUrl?: string
  fallback: string
  size?: 'sm' | 'lg'
}) {
  const dim = size === 'lg' ? 'size-9' : 'size-7'
  if (imageUrl) {
    return (
      <span
        className={cn(
          'inline-block overflow-hidden rounded-full bg-muted ring-1 ring-border/60',
          dim,
        )}
      >
        <img
          src={imageUrl}
          alt=""
          className="size-full object-cover"
          referrerPolicy="no-referrer"
        />
      </span>
    )
  }
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-full bg-[color-mix(in_oklab,var(--arena-violet),transparent_82%)] text-(--arena-violet)',
        dim,
      )}
    >
      {fallback ? (
        <span className="text-[11px] font-semibold uppercase tracking-wide">
          {fallback}
        </span>
      ) : (
        <UserCircle2Icon className="size-4" />
      )}
    </span>
  )
}

// Compute the current location-based redirect target for auth links. We
// intentionally derive this synchronously from the router rather than gating it
// behind a `mounted` flag — TanStack Start's SSR pipeline renders some
// components more than once and the post-effect render is the one that ends up
// in the served HTML, so a `useEffect`-driven swap creates a hydration
// mismatch when the client picks up the pre-effect value. `useLocation` returns
// the same path on both sides of hydration, so the value stays stable.
function useCurrentRedirect() {
  const { pathname, search, hash } = useLocation()
  const searchString = stringifyLocationSearch(search)
  const here = `${pathname}${searchString}${hash ? `#${hash}` : ''}`
  return safeAuthRedirect(here)
}

function computeInitials(value: string) {
  if (!value) return ''
  const cleaned = value.trim()
  if (!cleaned) return ''
  const parts = cleaned.split(/[\s@.]+/).filter(Boolean)
  if (parts.length === 0) return ''
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}
