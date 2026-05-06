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
import { ArenaLogo } from '#/components/ArenaLogo'
import { GoogleSignInButton } from '#/components/GoogleSignInButton'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '#/components/ui/empty'
import { Button } from '#/components/ui/button'

export const Route = createFileRoute('/login')({
  component: LoginPage,
})

function LoginPage() {
  const runtime = useRuntimeConfig()

  return (
    <div className="shell py-10 sm:py-16">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-center">
        <AuthHeroPanel />
        <div className="mx-auto w-full max-w-md">
          {runtime.hasClerk ? (
            <ConfiguredLoginCard />
          ) : (
            <Empty className="surface rounded-2xl border border-border/60 p-10">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <LockKeyholeIcon />
                </EmptyMedia>
                <EmptyTitle>Login is not configured</EmptyTitle>
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

function ConfiguredLoginCard() {
  const { isLoaded, isSignedIn } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      void navigate({ to: '/admin' })
    }
  }, [isLoaded, isSignedIn, navigate])

  return (
    <div data-reveal className="surface relative overflow-hidden rounded-2xl">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-linear-to-b from-[color-mix(in_oklab,var(--arena-violet),transparent_88%)] to-transparent" />

      <div className="relative px-7 pt-8 pb-7 sm:px-10 sm:pt-10 sm:pb-9">
        <div className="flex items-center gap-3">
          <ArenaLogo size={36} className="rounded-[10px]" />
          <div className="leading-tight">
            <p className="eyebrow">Admin login</p>
            <p className="text-sm font-medium text-foreground">
              AI&nbsp;Arena console
            </p>
          </div>
        </div>

        <h1 className="display mt-7 text-balance text-3xl sm:text-4xl">
          Welcome back.
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Continue with your Google account to manage live sessions, control
          provider spend, and operate the arena.
        </p>

        <div className="mt-8">
          <GoogleSignInButton redirectTo="/admin" label="Sign in with Google" />
        </div>

        <div className="mt-6 flex items-center gap-3 text-[0.7rem] uppercase tracking-[0.18em] text-muted-foreground">
          <span className="h-px flex-1 bg-border" />
          <span>One method, zero friction</span>
          <span className="h-px flex-1 bg-border" />
        </div>

        <ul className="mt-6 space-y-2.5 text-sm">
          <BenefitRow>No password to remember — Google handles 2FA.</BenefitRow>
          <BenefitRow>
            Only emails on the admin allow-list can run sessions.
          </BenefitRow>
          <BenefitRow>
            Sign-in works for both first-time and returning admins.
          </BenefitRow>
        </ul>

        <p className="mt-8 text-xs text-muted-foreground">
          New to AI&nbsp;Arena?{' '}
          <Link
            to="/register"
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            Create your operator account →
          </Link>
        </p>

        <p className="mt-2 text-xs text-muted-foreground">
          By continuing you agree this preview is a non-production demo and that
          provider usage is recorded for cost analytics.
        </p>
      </div>
    </div>
  )
}

function BenefitRow({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2.5 text-foreground/85">
      <CheckCircle2Icon className="mt-0.5 size-4 shrink-0 text-(--arena-violet)" />
      <span className="leading-6">{children}</span>
    </li>
  )
}

export function AuthHeroPanel() {
  return (
    <div data-reveal className="hidden lg:block">
      <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-linear-to-br from-[color-mix(in_oklab,var(--arena-violet),transparent_82%)] via-background to-[color-mix(in_oklab,var(--arena-amber),transparent_88%)] p-10">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-12 -top-12 size-72 rounded-full bg-[color-mix(in_oklab,var(--arena-violet),transparent_70%)] blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -left-16 -bottom-16 size-72 rounded-full bg-[color-mix(in_oklab,var(--arena-amber),transparent_72%)] blur-3xl"
        />

        <div className="relative">
          <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/70 px-3 py-1 text-[0.7rem] uppercase tracking-[0.2em] text-muted-foreground backdrop-blur">
            <span className="live-dot" aria-hidden />
            Operator console
          </span>

          <h2 className="display mt-6 text-balance text-4xl leading-[1.05] xl:text-5xl">
            <span className="gradient-text">One sign-in</span> to run every
            arena.
          </h2>
          <p className="mt-5 max-w-md text-base leading-7 text-muted-foreground">
            AI&nbsp;Arena rooms are spun up, monitored, and shut down from a
            single console. Bring your Google account — we handle identity,
            session tokens, and admin allow-lists for you.
          </p>

          <ul className="mt-8 space-y-4 text-sm">
            <HeroFeature
              icon={ShieldCheckIcon}
              title="Allow-list enforced"
              body="Only verified admins can create arenas or grant teammates."
            />
            <HeroFeature
              icon={ZapIcon}
              title="Realtime everything"
              body="Live votes, round transitions, and provider costs stream over Convex."
            />
            <HeroFeature
              icon={SparklesIcon}
              title="No bespoke passwords"
              body="Google's identity layer is the source of truth. Faster onboarding, fewer leaks."
            />
          </ul>
        </div>
      </div>
    </div>
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
    <li className="flex items-start gap-3 rounded-xl border border-border/40 bg-background/60 p-3.5 backdrop-blur">
      <div className="flex size-9 items-center justify-center rounded-lg bg-[color-mix(in_oklab,var(--arena-violet),transparent_85%)] text-(--arena-violet)">
        <Icon className="size-4" />
      </div>
      <div className="leading-tight">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="mt-1 text-[13px] leading-5 text-muted-foreground">
          {body}
        </p>
      </div>
    </li>
  )
}
