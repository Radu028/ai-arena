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
  SparklesIcon,
  TimerIcon,
  TrophyIcon,
  Users2Icon,
  ZapIcon,
} from 'lucide-react'
import { api } from '@convex/_generated/api'
import { AVAILABLE_MODELS, THEME_COPY } from '@shared/arena'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import { Separator } from '#/components/ui/separator'
import { cn } from '#/lib/utils'
import { AdminOnly } from '#/components/AdminOnly'

export const Route = createFileRoute('/')({ component: HomePage })

function HomePage() {
  const stats = useQuery(api.stats.getModelLeaderboard, {})

  return (
    <div className="shell space-y-20 sm:space-y-24">
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

      <div className="mt-16 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-sm">
        <HeroStat
          icon={SparklesIcon}
          label="frontier models"
          value={String(modelsTracked)}
        />
        <Separator orientation="vertical" className="h-6 max-md:hidden" />
        <HeroStat
          icon={TrophyIcon}
          label="completed sessions"
          value={String(completedSessions)}
        />
        <Separator orientation="vertical" className="h-6 max-md:hidden" />
        <HeroStat icon={GavelIcon} label="round agents" value="3" />
        <Separator orientation="vertical" className="h-6 max-md:hidden" />
        <HeroStat icon={LockIcon} label="anonymous voting" value="100%" />
      </div>
    </section>
  )
}

function HeroStat({
  icon: Icon,
  value,
  label,
}: {
  icon: React.ComponentType<{ className?: string }>
  value: string
  label: string
}) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex size-8 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        <Icon className="size-4" />
      </div>
      <div className="leading-tight">
        <p className="font-mono text-base font-semibold tabular-nums">
          {value}
        </p>
        <p className="text-[0.7rem] uppercase tracking-[0.16em] text-muted-foreground">
          {label}
        </p>
      </div>
    </div>
  )
}

function FlowSection() {
  const steps = [
    {
      step: '01',
      title: 'Topic locks once',
      copy: 'The first valid prompt freezes the round. No more edits — every model sees the same brief.',
      icon: TimerIcon,
    },
    {
      step: '02',
      title: 'Models answer in parallel',
      copy: 'Responses arrive simultaneously. Anything missing the 15s window gets a graceful timeout.',
      icon: ZapIcon,
    },
    {
      step: '03',
      title: 'Crowd & AI judges vote',
      copy: 'Humans and eligible models cast one ballot each. Models cannot vote for themselves.',
      icon: Users2Icon,
    },
    {
      step: '04',
      title: 'Agents react, MC bridges',
      copy: 'The Critic explains the win, Stats summarises the round, the MC flows into the next.',
      icon: MicVocalIcon,
    },
  ]

  return (
    <section data-reveal className="space-y-8">
      <SectionHeading
        eyebrow="Round loop"
        title="Built for live arenas, not benchmarks."
        description="Every round runs on the same clean four-step loop, with anonymous reveals and explicit ties. No magic, no leaderboard farming."
      />

      <div className="grid grid-cols-[minmax(0,1fr)] gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((s) => (
          <Card
            key={s.step}
            className="surface sheen-on-hover relative overflow-hidden p-5 ring-0 transition-shadow hover:ring-1 hover:ring-foreground/15"
          >
            <div className="flex items-start justify-between">
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <s.icon className="size-5" />
              </div>
              <span className="font-mono text-xs tracking-wider text-muted-foreground">
                {s.step}
              </span>
            </div>
            <CardTitle className="mt-4 text-base font-semibold">
              {s.title}
            </CardTitle>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {s.copy}
            </p>
          </Card>
        ))}
      </div>
    </section>
  )
}

function FeatureSection() {
  const features = [
    {
      title: 'Host / MC agent',
      copy: 'Introduces rounds, threads transitions, and closes with a recap. Generated text feels like a tight broadcast.',
      icon: MicVocalIcon,
      ringClass: 'ring-violet',
    },
    {
      title: 'Critic agent',
      copy: 'Explains why the winner worked and what the runners-up missed. Editorial, not evangelical.',
      icon: GavelIcon,
      ringClass: 'ring-violet',
    },
    {
      title: 'Stats analyst',
      copy: 'Quietly summarises vote distributions, latency, and reliability after every finalised round.',
      icon: BarChart3Icon,
      ringClass: 'ring-violet',
    },
    {
      title: 'Realtime crowd',
      copy: 'Audiences join in seconds, watch votes update live, and only need a username when they vote.',
      icon: RadioIcon,
      ringClass: 'ring-amber',
    },
    {
      title: 'Anonymous reveal',
      copy: 'Responses stay anonymous through voting. Identities only unlock once the ballots close.',
      icon: LockIcon,
      ringClass: 'ring-amber',
    },
    {
      title: 'Champion card',
      copy: 'When a session ends, AI Arena renders a downloadable champion portrait you can share.',
      icon: TrophyIcon,
      ringClass: 'ring-amber',
    },
  ]

  return (
    <section data-reveal className="space-y-8">
      <SectionHeading
        eyebrow="Inside the arena"
        title="Three agents, one stage, zero filler."
        description="Every artifact you see — host introductions, critic notes, stats summaries — comes from a dedicated agent that only ships when a round actually finalises."
      />

      <div className="grid grid-cols-[minmax(0,1fr)] gap-4 md:grid-cols-2 lg:grid-cols-3">
        {features.map((f) => (
          <Card
            key={f.title}
            className={cn(
              'surface relative overflow-hidden p-5 ring-0 transition-all hover:-translate-y-0.5 hover:ring-1 hover:ring-foreground/15',
            )}
          >
            <div
              className={cn(
                'inline-flex size-10 items-center justify-center rounded-lg',
                f.ringClass === 'ring-violet'
                  ? 'bg-primary/10 text-primary'
                  : 'bg-amber-500/10 text-amber-600 dark:text-amber-300',
              )}
            >
              <f.icon className="size-5" />
            </div>
            <CardTitle className="mt-4 text-base font-semibold">
              {f.title}
            </CardTitle>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {f.copy}
            </p>
          </Card>
        ))}
      </div>
    </section>
  )
}

function RosterSection() {
  return (
    <section data-reveal className="space-y-8">
      <SectionHeading
        eyebrow="Battle roster"
        title="The frontier models on stage."
        description="The lineup is snapshotted at session creation, so historical sessions stay reproducible even when providers ship new versions."
      />

      <div className="grid grid-cols-[minmax(0,1fr)] gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {AVAILABLE_MODELS.map((model) => (
          <Card
            key={model.key}
            className="surface group relative overflow-hidden p-5 ring-0 transition-all hover:-translate-y-0.5 hover:ring-1 hover:ring-foreground/15"
          >
            <div className="flex items-center justify-between">
              <span
                className="size-2.5 rounded-full ring-2 ring-background"
                style={{ backgroundColor: model.accent }}
              />
              <span className="rounded-md bg-muted px-2 py-0.5 font-mono text-[0.65rem] uppercase tracking-wider text-muted-foreground">
                {model.providerKey}
              </span>
            </div>
            <p className="mt-4 text-base font-semibold">{model.label}</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {model.description}
            </p>
            <p className="mt-4 font-mono text-[0.7rem] uppercase tracking-[0.16em] text-muted-foreground">
              {model.tagline}
            </p>
          </Card>
        ))}
      </div>
    </section>
  )
}

function ThemeSection() {
  return (
    <section data-reveal className="space-y-8">
      <SectionHeading
        eyebrow="Theme presets"
        title="Tune the room with a single switch."
        description="Each preset rewires Host tone, Critic framing, and the quality bar judges hold every model to. Pick one, then run the round."
      />

      <div className="grid grid-cols-[minmax(0,1fr)] gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Object.entries(THEME_COPY).map(([key, copy]) => (
          <Card
            key={key}
            className="surface relative overflow-hidden p-5 ring-0 transition-all hover:-translate-y-0.5 hover:ring-1 hover:ring-foreground/15"
          >
            <Badge
              variant="outline"
              className="font-mono text-[0.65rem] uppercase tracking-wider"
            >
              {key}
            </Badge>
            <p className="mt-4 text-base font-semibold">{copy.label}</p>
            <Separator className="my-4 opacity-60" />
            <dl className="grid gap-2 text-sm">
              <div>
                <dt className="text-[0.7rem] uppercase tracking-[0.14em] text-muted-foreground">
                  Host tone
                </dt>
                <dd className="leading-6">{copy.hostTone}</dd>
              </div>
              <div>
                <dt className="text-[0.7rem] uppercase tracking-[0.14em] text-muted-foreground">
                  Critic angle
                </dt>
                <dd className="leading-6">{copy.criticAngle}</dd>
              </div>
            </dl>
          </Card>
        ))}
      </div>
    </section>
  )
}

function CallToAction() {
  return (
    <section data-reveal>
      <Card className="surface relative overflow-hidden border-border/70 p-0 ring-0">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_-20%,color-mix(in_oklab,var(--arena-violet),transparent_55%),transparent_50%),radial-gradient(circle_at_85%_120%,color-mix(in_oklab,var(--arena-amber),transparent_55%),transparent_45%)]"
        />
        <CardHeader className="relative px-8 pt-10 sm:px-12">
          <p className="eyebrow">Run a session</p>
          <CardTitle className="display max-w-3xl text-balance text-4xl sm:text-5xl">
            Spin up a live arena in under a minute.
          </CardTitle>
          <CardDescription className="max-w-2xl text-pretty text-base sm:text-lg sm:leading-7">
            Pick a theme, lock the lineup, and share the join code. The room
            opens instantly with anonymous responses and live voting.
          </CardDescription>
        </CardHeader>
        <CardContent className="relative flex flex-wrap items-center gap-3 px-8 pb-10 pt-3 sm:px-12">
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
        </CardContent>
      </Card>
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
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h2 className="mt-2 max-w-3xl text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
          {title}
        </h2>
      </div>
      <p className="max-w-md text-pretty text-sm leading-6 text-muted-foreground sm:text-right">
        {description}
      </p>
    </div>
  )
}
