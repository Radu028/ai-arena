import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { useAuth } from '@clerk/tanstack-react-start'
import {
  ArrowRightIcon,
  ClipboardListIcon,
  LockKeyholeIcon,
  RocketIcon,
  TerminalIcon,
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

export const Route = createFileRoute('/register')({
  component: RegisterPage,
})

function RegisterPage() {
  const runtime = useRuntimeConfig()

  return (
    <div className="shell py-10 sm:py-16">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-center">
        <RegisterHeroPanel />
        <div className="mx-auto w-full max-w-md">
          {runtime.hasClerk ? (
            <ConfiguredRegisterCard />
          ) : (
            <Empty className="surface rounded-2xl border border-border/60 p-10">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <LockKeyholeIcon />
                </EmptyMedia>
                <EmptyTitle>Registration is not configured</EmptyTitle>
                <EmptyDescription>
                  Add the Clerk environment variables before creating real
                  operator accounts.
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

function ConfiguredRegisterCard() {
  const { isLoaded, isSignedIn } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      void navigate({ to: '/admin' })
    }
  }, [isLoaded, isSignedIn, navigate])

  return (
    <div data-reveal className="surface relative overflow-hidden rounded-2xl">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-linear-to-b from-[color-mix(in_oklab,var(--arena-amber),transparent_88%)] to-transparent" />

      <div className="relative px-7 pt-8 pb-7 sm:px-10 sm:pt-10 sm:pb-9">
        <div className="flex items-center gap-3">
          <ArenaLogo size={36} className="rounded-[10px]" />
          <div className="leading-tight">
            <p className="eyebrow">Operator access</p>
            <p className="text-sm font-medium text-foreground">
              AI&nbsp;Arena console
            </p>
          </div>
        </div>

        <h1 className="display mt-7 text-balance text-3xl sm:text-4xl">
          Create your account.
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Continue with Google to spin up your first arena. The same button
          handles both first-time setup and returning sign-ins.
        </p>

        <div className="mt-8">
          <GoogleSignInButton
            redirectTo="/admin"
            label="Continue with Google"
          />
        </div>

        <div className="mt-6 flex items-center gap-3 text-[0.7rem] uppercase tracking-[0.18em] text-muted-foreground">
          <span className="h-px flex-1 bg-border" />
          <span>What happens next</span>
          <span className="h-px flex-1 bg-border" />
        </div>

        <ol className="mt-6 space-y-3 text-sm">
          <NextStep
            n={1}
            title="Sign in with Google"
            body="A new operator profile is bootstrapped instantly."
          />
          <NextStep
            n={2}
            title="Get added to the admin allow-list"
            body="The bootstrap admin grants access by email so you can create sessions."
          />
          <NextStep
            n={3}
            title="Run your first arena"
            body="Spin up models, share the join code, and watch the votes stream in."
          />
        </ol>

        <p className="mt-8 text-xs text-muted-foreground">
          Already have access?{' '}
          <Link
            to="/login"
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            Sign in instead →
          </Link>
        </p>
      </div>
    </div>
  )
}

function NextStep({
  n,
  title,
  body,
}: {
  n: number
  title: string
  body: string
}) {
  return (
    <li className="flex gap-3">
      <span className="mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-[color-mix(in_oklab,var(--arena-violet),transparent_82%)] font-mono text-[11px] font-semibold text-(--arena-violet)">
        {n}
      </span>
      <div className="leading-tight">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="mt-1 text-[13px] leading-5 text-muted-foreground">
          {body}
        </p>
      </div>
    </li>
  )
}

function RegisterHeroPanel() {
  return (
    <div data-reveal className="hidden lg:block">
      <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-linear-to-br from-[color-mix(in_oklab,var(--arena-amber),transparent_82%)] via-background to-[color-mix(in_oklab,var(--arena-violet),transparent_88%)] p-10">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-12 -top-12 size-72 rounded-full bg-[color-mix(in_oklab,var(--arena-amber),transparent_70%)] blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -left-16 -bottom-16 size-72 rounded-full bg-[color-mix(in_oklab,var(--arena-violet),transparent_72%)] blur-3xl"
        />

        <div className="relative">
          <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/70 px-3 py-1 text-[0.7rem] uppercase tracking-[0.2em] text-muted-foreground backdrop-blur">
            <RocketIcon className="size-3" aria-hidden />
            Become an operator
          </span>

          <h2 className="display mt-6 text-balance text-4xl leading-[1.05] xl:text-5xl">
            Run live model battles in{' '}
            <span className="gradient-text">under a minute.</span>
          </h2>
          <p className="mt-5 max-w-md text-base leading-7 text-muted-foreground">
            Your AI&nbsp;Arena operator account unlocks session creation, live
            cost tracking, and full archive access — so the audience can focus
            on voting.
          </p>

          <ul className="mt-8 space-y-3 text-sm">
            <Highlight icon={ClipboardListIcon}>
              Templated themes — Open Arena, Comedy Roast, Debate Night & more.
            </Highlight>
            <Highlight icon={TerminalIcon}>
              Provider keys stay in your env. Nothing is logged client-side.
            </Highlight>
            <Highlight icon={ArrowRightIcon}>
              Need higher seats? Tune the lobby cap per session.
            </Highlight>
          </ul>
        </div>
      </div>
    </div>
  )
}

function Highlight({
  icon: Icon,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>
  children: React.ReactNode
}) {
  return (
    <li className="flex items-start gap-3 rounded-xl border border-border/40 bg-background/60 p-3.5 backdrop-blur">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[color-mix(in_oklab,var(--arena-amber),transparent_82%)] text-(--arena-amber)">
        <Icon className="size-4" />
      </div>
      <p className="text-[13px] leading-6 text-foreground/90">{children}</p>
    </li>
  )
}
