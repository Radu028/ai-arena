import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { useAuth } from '@clerk/tanstack-react-start'
import {
  CheckCircle2Icon,
  LockKeyholeIcon,
  ShieldCheckIcon,
  SparklesIcon,
  ZapIcon,
} from 'lucide-react'
import { useEffect } from 'react'
import { useRuntimeConfig } from '#/components/AppProviders'
import { GoogleSignInButton } from '#/components/GoogleSignInButton'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '#/components/ui/empty'
import { Button } from '#/components/ui/button'
import { safeAuthRedirect } from '#/lib/authRedirect'

export const Route = createFileRoute('/login')({
  component: LoginPage,
})

function LoginPage() {
  const runtime = useRuntimeConfig()

  return (
    <div className="shell py-10 sm:py-16">
      <div className="grid gap-12 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:gap-20">
        <AuthEditorial />
        <div className="mx-auto w-full max-w-md lg:mx-0 lg:ml-auto">
          {runtime.hasClerk ? (
            <AuthPanel />
          ) : (
            <Empty className="rounded-2xl border border-dashed border-border/50 p-10">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <LockKeyholeIcon />
                </EmptyMedia>
                <EmptyTitle>Authentication is not configured</EmptyTitle>
                <EmptyDescription>
                  Add the Clerk environment variables before connecting a real
                  Google account.
                </EmptyDescription>
              </EmptyHeader>
              <Button asChild variant="outline">
                <Link to="/">Back home</Link>
              </Button>
            </Empty>
          )}
        </div>
      </div>
    </div>
  )
}

function AuthEditorial() {
  return (
    <div data-reveal className="space-y-10">
      <div className="space-y-5">
        <span className="inline-flex items-center gap-2 text-[0.7rem] uppercase tracking-[0.2em] text-muted-foreground">
          <span className="live-dot" aria-hidden />
          Operator console
        </span>
        <h1 className="display text-balance text-4xl leading-[1.05] sm:text-5xl xl:text-6xl">
          <span className="gradient-text">One door</span> into every arena.
        </h1>
        <p className="max-w-md text-pretty text-base leading-7 text-muted-foreground sm:text-lg">
          Bring your Google account and we&rsquo;ll handle identity, session
          tokens, and admin allow-lists for you. Same button for first-timers
          and returners.
        </p>
      </div>

      <ul className="space-y-7">
        <HeroFeature
          icon={SparklesIcon}
          title="Single sign-in for everything"
          body="Login and registration are the same flow. No separate forms, no second tab."
        />
        <HeroFeature
          icon={ShieldCheckIcon}
          title="Allow-list enforced"
          body="Only verified admin emails can create arenas or grant teammates access."
        />
        <HeroFeature
          icon={ZapIcon}
          title="Realtime out of the box"
          body="Live votes, round transitions, and provider costs stream over Convex."
        />
      </ul>
    </div>
  )
}

function AuthPanel() {
  const { isLoaded, isSignedIn } = useAuth()
  const navigate = useNavigate()
  const redirectTo = getLoginRedirect()

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      void navigate({ to: redirectTo })
    }
  }, [isLoaded, isSignedIn, navigate, redirectTo])

  return (
    <div
      data-reveal
      className="surface relative overflow-hidden rounded-2xl px-7 pb-8 pt-9 sm:px-9 sm:pb-9 sm:pt-10"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-linear-to-b from-[color-mix(in_oklab,var(--arena-violet),transparent_85%)] to-transparent"
      />

      <div className="relative">
        <p className="eyebrow">Sign in</p>
        <h2 className="display mt-2 text-balance text-2xl sm:text-3xl">
          Step into the arena.
        </h2>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          One click with Google gets you in. We&rsquo;ll set up your operator
          profile if it&rsquo;s your first visit.
        </p>

        <div className="mt-8">
          <GoogleSignInButton
            redirectTo={redirectTo}
            label="Continue with Google"
          />
        </div>

        <div className="mt-6 flex items-center gap-3 text-[0.7rem] uppercase tracking-[0.18em] text-muted-foreground">
          <span className="h-px flex-1 bg-border" />
          <span>What you get</span>
          <span className="h-px flex-1 bg-border" />
        </div>

        <ul className="mt-5 space-y-2.5 text-sm">
          <Benefit>No password to remember — Google handles 2FA.</Benefit>
          <Benefit>Profile is bootstrapped on first sign-in.</Benefit>
          <Benefit>
            Allow-listed admins unlock session creation immediately.
          </Benefit>
        </ul>

        <p className="mt-7 text-xs leading-5 text-muted-foreground">
          By continuing you agree this preview is a non-production demo and that
          provider usage is recorded for cost analytics. We never see your
          Google password.
        </p>
      </div>
    </div>
  )
}

function getLoginRedirect() {
  if (typeof window === 'undefined') {
    return safeAuthRedirect(null)
  }
  return safeAuthRedirect(
    new URLSearchParams(window.location.search).get('redirect'),
  )
}

function Benefit({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2.5 text-foreground/85">
      <CheckCircle2Icon className="mt-0.5 size-4 shrink-0 text-(--arena-violet)" />
      <span className="leading-6">{children}</span>
    </li>
  )
}

function HeroFeature({
  icon: Icon,
  title,
  body,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  body: string
}) {
  return (
    <li className="flex items-start gap-4">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[color-mix(in_oklab,var(--arena-violet),transparent_85%)] text-(--arena-violet)">
        <Icon className="size-4.5" />
      </div>
      <div>
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          {body}
        </p>
      </div>
    </li>
  )
}
