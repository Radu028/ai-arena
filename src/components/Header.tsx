import { Link } from '@tanstack/react-router'
import { SignInButton, UserButton, useAuth } from '@clerk/tanstack-react-start'
import { RadioTowerIcon } from 'lucide-react'
import { useRuntimeConfig } from '#/components/AppProviders'
import ThemeToggle from './ThemeToggle'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'

export default function Header() {
  const runtime = useRuntimeConfig()

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/85 backdrop-blur-xl">
      <nav className="page-frame flex flex-wrap items-center gap-3 py-4">
        <Link
          to="/"
          className="inline-flex items-center gap-3 rounded-full border border-border/70 bg-card px-4 py-2 no-underline shadow-[0_12px_28px_rgba(20,28,44,0.08)]"
        >
          <span className="flex size-9 items-center justify-center rounded-full bg-[radial-gradient(circle_at_30%_30%,white,var(--arena-signal))] text-white">
            <RadioTowerIcon className="size-4" />
          </span>
          <span>
            <span className="block font-serif text-lg leading-none text-foreground">
              AI Arena
            </span>
            <span className="block text-[0.7rem] uppercase tracking-[0.24em] text-muted-foreground">
              Live model battles
            </span>
          </span>
        </Link>

        <div className="hidden items-center gap-2 md:flex">
          <Link
            to="/"
            className="nav-pill"
            activeProps={{ className: 'nav-pill is-active' }}
          >
            Home
          </Link>
          <Link
            to="/join"
            className="nav-pill"
            activeProps={{ className: 'nav-pill is-active' }}
          >
            Join
          </Link>
          <Link
            to="/admin"
            className="nav-pill"
            activeProps={{ className: 'nav-pill is-active' }}
          >
            Admin
          </Link>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Badge
            variant="outline"
            className="hidden rounded-full border-border/70 px-3 py-1 sm:inline-flex"
          >
            {runtime.hasClerk ? 'Clerk admin auth' : 'Guest mode only'}
          </Badge>
          <ThemeToggle />
          {runtime.hasClerk ? (
            <HeaderAuth />
          ) : (
            <Button asChild variant="outline" size="sm">
              <Link to="/admin">Admin</Link>
            </Button>
          )}
        </div>
      </nav>
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
        <Button size="sm">Admin Sign In</Button>
      </SignInButton>
    )
  }

  return (
    <UserButton appearance={{ elements: { userButtonAvatarBox: 'size-9' } }} />
  )
}
