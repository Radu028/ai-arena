import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { SignInButton, UserButton, useAuth } from '@clerk/tanstack-react-start'
import {
  HomeIcon,
  LogInIcon,
  TrophyIcon,
  ClockIcon,
  ShieldIcon,
  MenuIcon,
  XIcon,
} from 'lucide-react'
import { useRuntimeConfig } from '#/components/AppProviders'
import ThemeToggle from './ThemeToggle'
import { ArenaLogo } from './ArenaLogo'
import { Button } from '#/components/ui/button'

const NAV_LINKS = [
  { to: '/', label: 'Home', icon: HomeIcon, exact: true },
  { to: '/join', label: 'Join', icon: LogInIcon },
  { to: '/leaderboard', label: 'Leaderboard', icon: TrophyIcon },
  { to: '/history', label: 'History', icon: ClockIcon },
  { to: '/admin', label: 'Admin', icon: ShieldIcon },
] as const

export default function Header() {
  const runtime = useRuntimeConfig()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/90 backdrop-blur-xl">
      <nav className="page-frame flex items-center gap-3 py-3">
        {/* Logo */}
        <Link
          to="/"
          className="inline-flex items-center gap-2.5 rounded-xl px-1 py-1 no-underline transition-opacity hover:opacity-80"
          onClick={() => setMobileOpen(false)}
        >
          <ArenaLogo size={36} />
          <span className="hidden sm:block">
            <span className="block font-serif text-base leading-none text-foreground">
              AI Arena
            </span>
            <span className="block text-[0.6rem] uppercase tracking-[0.22em] text-muted-foreground">
              Live model battles
            </span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-1 md:flex ml-2">
          {NAV_LINKS.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className="nav-pill group"
              activeProps={{ className: 'nav-pill is-active' }}
            >
              <Icon className="size-3.5 transition-transform group-hover:scale-110" />
              {label}
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          {runtime.hasClerk ? (
            <HeaderAuth />
          ) : (
            <Button asChild variant="outline" size="sm">
              <Link to="/admin">Admin</Link>
            </Button>
          )}

          {/* Mobile hamburger */}
          <button
            className="inline-flex items-center justify-center rounded-lg border border-border/60 bg-card p-2 md:hidden"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileOpen ? (
              <XIcon className="size-4" />
            ) : (
              <MenuIcon className="size-4" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile nav drawer */}
      {mobileOpen && (
        <div className="border-t border-border/60 bg-background/95 px-4 py-3 md:hidden">
          <div className="flex flex-col gap-1">
            {NAV_LINKS.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className="nav-pill justify-start"
                activeProps={{ className: 'nav-pill is-active justify-start' }}
                onClick={() => setMobileOpen(false)}
              >
                <Icon className="size-4" />
                {label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  )
}

function HeaderAuth() {
  const { isLoaded, isSignedIn } = useAuth()

  if (!isLoaded) {
    return (
      <Button variant="outline" size="sm" disabled>
        Loading
      </Button>
    )
  }

  if (!isSignedIn) {
    return (
      <SignInButton mode="modal">
        <Button size="sm">Sign In</Button>
      </SignInButton>
    )
  }

  return (
    <UserButton appearance={{ elements: { userButtonAvatarBox: 'size-8' } }} />
  )
}
