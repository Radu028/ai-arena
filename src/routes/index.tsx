import { Link, createFileRoute } from '@tanstack/react-router'
import { useQuery } from 'convex/react'
import {
  ArrowRightIcon,
  BarChart3Icon,
  GavelIcon,
  LayersIcon,
  LockIcon,
  MicVocalIcon,
  RadioIcon,
  TrophyIcon,
  ZapIcon,
} from 'lucide-react'
import { api } from '@convex/_generated/api'
import { AVAILABLE_MODELS, THEME_COPY } from '@shared/arena'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { AdminOnly } from '#/components/AdminOnly'

export const Route = createFileRoute('/')({ component: HomePage })

function HomePage() {
  const stats = useQuery(api.stats.getModelLeaderboard, {})

  return (
    <div className="shell space-y-24 sm:space-y-28">
      <Hero
        completedSessions={stats?.sessionsIncluded ?? 0}
        modelsTracked={
          stats && stats.rows.length > 0
            ? stats.rows.length
            : AVAILABLE_MODELS.length
        }
      />

      <FlowSection />

      <FeatureSection />

      <RosterSection />

      <ThemeSection />

      <CallToAction />
    </div>
  )
}

function Hero({
  completedSessions,
  modelsTracked,
}: {
  completedSessions: number
  modelsTracked: number
}) {
  return (
    <section data-reveal className="relative isolate pt-6 sm:pt-12">
      <div className="mx-auto max-w-4xl text-center">
        <Badge
          variant="outline"
          className="h-7 rounded-full border-border/70 bg-background/60 px-3 text-[0.7rem] font-medium tracking-wide backdrop-blur"
        >
          <span className="live-dot mr-1" />
          Realtime · {AVAILABLE_MODELS.length} frontier models on stage
        </Badge>

        <h1 className="display mt-6 text-balance">
          One prompt. Every model.{' '}
          <span className="gradient-text">A live champion.</span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-pretty text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
          AI Arena pits the world&rsquo;s leading models against each other in
          synchronized rounds. They answer the same prompt, judge each other
          without self-voting, and the audience picks the winner — all live.
        </p>

        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <Button asChild size="lg" className="h-11 rounded-full px-6">
            <Link to="/join">
              <ZapIcon className="size-4" />
              Join with code
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="h-11 rounded-full px-6"
          >
            <Link to="/leaderboard">
              See the leaderboard
              <ArrowRightIcon className="size-4" />
            </Link>
          </Button>
        </div>
      </div>

      <div
        className={
          completedSessions > 0
            ? 'mt-16 grid grid-cols-2 gap-y-6 sm:mt-20 md:grid-cols-4 md:divide-x md:divide-border/50'
            : 'mt-16 grid grid-cols-3 gap-y-6 sm:mt-20 md:divide-x md:divide-border/50'
        }
      >
        <HeroStat label="frontier models" value={String(modelsTracked)} />
        <HeroStat label="round agents" value="3" />
        {completedSessions > 0 ? (
          <HeroStat
            label="completed sessions"
            value={String(completedSessions)}
          />
        ) : null}
        <HeroStat label="anonymous voting" value="100%" />
      </div>
    </section>
  )
}

function HeroStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-1 px-4 text-center md:items-start md:px-8 md:text-left">
      <p className="font-mono text-2xl font-semibold tabular-nums sm:text-3xl">
        {value}
      </p>
      <p className="text-[0.7rem] uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </p>
    </div>
  )
}

function FlowSection() {
  const steps = [
    {
      step: '01',
      title: 'Topic locks once',
      copy: 'The first valid prompt freezes the round. No more edits — every model sees the same brief.',
    },
    {
      step: '02',
      title: 'Models answer in parallel',
      copy: 'Responses arrive simultaneously. Anything missing the provider timeout gets a graceful timeout.',
    },
    {
      step: '03',
      title: 'Crowd & AI judges vote',
      copy: 'Humans and eligible models cast one ballot each. Models cannot vote for themselves.',
    },
    {
      step: '04',
      title: 'Agents react, MC bridges',
      copy: 'The Critic explains the win, Stats summarises the round, the MC flows into the next.',
    },
  ]

  return (
    <section data-reveal className="space-y-12">
      <SectionHeading
        eyebrow="Round loop"
        title="Built for live arenas, not benchmarks."
        description="Every round runs on the same clean four-step loop, with anonymous reveals and explicit ties. No magic, no leaderboard farming."
      />

      <ol className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((s) => (
          <li key={s.step} className="border-t border-border/60 pt-5">
            <span className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-muted-foreground">
              Step {s.step}
            </span>
            <h3 className="mt-2.5 text-base font-semibold">{s.title}</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {s.copy}
            </p>
          </li>
        ))}
      </ol>
    </section>
  )
}

function FeatureSection() {
  const features = [
    {
      title: 'Host / MC agent',
      copy: 'Introduces rounds, threads transitions, and closes with a recap. Generated text feels like a tight broadcast.',
      icon: MicVocalIcon,
    },
    {
      title: 'Critic agent',
      copy: 'Explains why the winner worked and what the runners-up missed. Editorial, not evangelical.',
      icon: GavelIcon,
    },
    {
      title: 'Stats analyst',
      copy: 'Quietly summarises vote distributions, latency, and reliability after every finalised round.',
      icon: BarChart3Icon,
    },
    {
      title: 'Realtime crowd',
      copy: 'Audiences join in seconds, watch votes update live, and only need a username when they vote.',
      icon: RadioIcon,
    },
    {
      title: 'Anonymous reveal',
      copy: 'Responses stay anonymous through voting. Identities only unlock once the ballots close.',
      icon: LockIcon,
    },
    {
      title: 'Champion card',
      copy: 'When a session ends, AI Arena renders a downloadable champion portrait you can share.',
      icon: TrophyIcon,
    },
  ]

  return (
    <section data-reveal className="space-y-12">
      <SectionHeading
        eyebrow="Inside the arena"
        title="Three agents, one stage, zero filler."
        description="Every artifact you see — host introductions, critic notes, stats summaries — comes from a dedicated agent that only ships when a round actually finalises."
      />

      <div className="grid gap-x-10 gap-y-10 md:grid-cols-2 lg:grid-cols-3">
        {features.map((f) => (
          <div key={f.title}>
            <div className="inline-flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <f.icon className="size-4.5" />
            </div>
            <h3 className="mt-4 text-base font-semibold">{f.title}</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {f.copy}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}

function RosterSection() {
  return (
    <section data-reveal className="space-y-12">
      <SectionHeading
        eyebrow="Battle roster"
        title="The frontier models on stage."
        description="The lineup is snapshotted at session creation, so historical sessions stay reproducible even when providers ship new versions."
      />

      <ul className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
        {AVAILABLE_MODELS.map((model) => (
          <li
            key={model.key}
            className="border-t border-border/60 pt-5"
            style={
              {
                ['--accent']: model.accent,
              } as React.CSSProperties
            }
          >
            <div className="flex items-center justify-between">
              <span
                className="size-2.5 rounded-full"
                style={{ backgroundColor: model.accent }}
                aria-hidden
              />
              <span className="font-mono text-[0.65rem] uppercase tracking-[0.16em] text-muted-foreground">
                {model.providerKey}
              </span>
            </div>
            <p className="mt-4 text-base font-semibold">{model.label}</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {model.description}
            </p>
            <p className="mt-4 text-[0.7rem] uppercase tracking-[0.16em] text-muted-foreground">
              {model.tagline}
            </p>
          </li>
        ))}
      </ul>
    </section>
  )
}

function ThemeSection() {
  return (
    <section data-reveal className="space-y-12">
      <SectionHeading
        eyebrow="Theme presets"
        title="Tune the room with a single switch."
        description="Each preset rewires Host tone, Critic framing, and the quality bar judges hold every model to. Pick one, then run the round."
      />

      <ul className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
        {Object.entries(THEME_COPY).map(([key, copy]) => (
          <li key={key} className="border-t border-border/60 pt-5">
            <span className="font-mono text-[0.65rem] uppercase tracking-[0.16em] text-muted-foreground">
              {key}
            </span>
            <p className="mt-3 text-base font-semibold">{copy.label}</p>
            <dl className="mt-4 space-y-3 text-sm">
              <div>
                <dt className="text-[0.65rem] uppercase tracking-[0.16em] text-muted-foreground">
                  Host tone
                </dt>
                <dd className="mt-0.5 leading-6">{copy.hostTone}</dd>
              </div>
              <div>
                <dt className="text-[0.65rem] uppercase tracking-[0.16em] text-muted-foreground">
                  Critic angle
                </dt>
                <dd className="mt-0.5 leading-6">{copy.criticAngle}</dd>
              </div>
            </dl>
          </li>
        ))}
      </ul>
    </section>
  )
}

function CallToAction() {
  return (
    <section
      data-reveal
      className="relative isolate overflow-hidden border-t border-border/60 pt-16 sm:pt-20"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-32 h-96 bg-[radial-gradient(circle_at_18%_50%,color-mix(in_oklab,var(--arena-violet),transparent_70%),transparent_55%),radial-gradient(circle_at_82%_50%,color-mix(in_oklab,var(--arena-amber),transparent_72%),transparent_55%)]"
      />
      <div className="relative mx-auto max-w-3xl text-center">
        <p className="eyebrow">Run a session</p>
        <h2 className="display mt-3 text-balance text-3xl sm:text-5xl">
          Spin up a live arena{' '}
          <span className="gradient-text">in under a minute.</span>
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-pretty text-base leading-7 text-muted-foreground sm:text-lg">
          Pick a theme, lock the lineup, and share the join code. The room opens
          instantly with anonymous responses and live voting.
        </p>
        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <AdminOnly>
            <Button asChild size="lg" className="h-11 rounded-full px-6">
              <Link to="/admin">
                <LayersIcon className="size-4" />
                Open admin console
              </Link>
            </Button>
          </AdminOnly>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="h-11 rounded-full px-6"
          >
            <Link to="/history">
              Browse past sessions
              <ArrowRightIcon className="size-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string
  title: string
  description: string
}) {
  return (
    <div className="grid gap-4 md:grid-cols-12 md:items-end md:gap-10">
      <div className="md:col-span-7 lg:col-span-8">
        <p className="eyebrow">{eyebrow}</p>
        <h2 className="mt-2 text-pretty text-2xl font-semibold tracking-tight sm:text-3xl">
          {title}
        </h2>
      </div>
      <p className="text-pretty text-sm leading-6 text-muted-foreground md:col-span-5 md:text-right lg:col-span-4">
        {description}
      </p>
    </div>
  )
}
