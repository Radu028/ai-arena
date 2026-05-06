import { useEffect, useState } from 'react'
import { Link } from '@tanstack/react-router'
import {
  SignInButton,
  SignUpButton,
  UserButton,
  useAuth,
} from '@clerk/tanstack-react-start'
import {
  ClockIcon,
  HomeIcon,
  LogInIcon,
  MenuIcon,
  ShieldIcon,
  TrophyIcon,
  XIcon,
} from 'lucide-react'
import { useRuntimeConfig } from '#/components/AppProviders'
import { ArenaLogo } from './ArenaLogo'
import ThemeToggle from './ThemeToggle'
import { Button } from '#/components/ui/button'
import { cn } from '#/lib/utils'

const NAV_LINKS = [
  { to: '/', label: 'Home', icon: HomeIcon, exact: true },
  { to: '/join', label: 'Join', icon: LogInIcon },
  { to: '/login', label: 'Login', icon: LogInIcon },
  { to: '/leaderboard', label: 'Leaderboard', icon: TrophyIcon },
  { to: '/history', label: 'History', icon: ClockIcon },
  { to: '/admin', label: 'Admin', icon: ShieldIcon },
] as const

export default function Header() {
  const runtime = useRuntimeConfig()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

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
          onClick={() => setMobileOpen(false)}
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
            <span className="mt-0.5 hidden text-[0.625rem] uppercase tracking-[0.2em] text-muted-foreground sm:inline-block">
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
        </div>

        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          {runtime.hasClerk ? (
            <HeaderAuth />
          ) : (
            <Button
              asChild
              variant="outline"
              size="sm"
              className="hidden sm:inline-flex"
            >
              <Link to="/admin">Admin</Link>
            </Button>
          )}

          <button
            type="button"
            className="inline-flex size-9 items-center justify-center rounded-full border border-border/70 bg-background/60 text-foreground transition-colors hover:bg-muted md:hidden"
            onClick={() => setMobileOpen((v) => !v)}
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

      {mobileOpen ? (
        <div className="border-t border-border/60 bg-background/95 px-4 py-3 backdrop-blur-xl md:hidden">
          <div className="flex flex-col gap-1">
            {NAV_LINKS.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className="nav-link justify-start text-sm"
                activeOptions={{ exact: to === '/' }}
                activeProps={{
                  className: 'nav-link is-active justify-start text-sm',
                }}
                onClick={() => setMobileOpen(false)}
              >
                <Icon className="size-4" />
                {label}
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </header>
  )
}

function HeaderAuth() {
  const { isLoaded, isSignedIn } = useAuth()

  if (!isLoaded) {
    return (
      <Button variant="ghost" size="sm" disabled>
        ...
      </Button>
    )
  }

  if (!isSignedIn) {
    return (
      <div className="hidden items-center gap-2 sm:flex">
        <SignInButton mode="modal">
          <Button size="sm" variant="outline">
            Login
          </Button>
        </SignInButton>
        <SignUpButton mode="modal">
          <Button size="sm">Register</Button>
        </SignUpButton>
      </div>
    )
  }

  return (
    <UserButton appearance={{ elements: { userButtonAvatarBox: 'size-8' } }} />
  )
}
