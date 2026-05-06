import type { FunctionReturnType } from 'convex/server'
import {
  CalendarClockIcon,
  GavelIcon,
  HourglassIcon,
  MicVocalIcon,
  RadioIcon,
  ScrollTextIcon,
  SparklesIcon,
  Users2Icon,
} from 'lucide-react'
import type { api } from '@convex/_generated/api'
import { formatClock, initials } from '#/lib/format'
import { Avatar, AvatarFallback } from '#/components/ui/avatar'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '#/components/ui/empty'
import { Label } from '#/components/ui/label'
import { ScrollArea } from '#/components/ui/scroll-area'
import { Separator } from '#/components/ui/separator'
import { Textarea } from '#/components/ui/textarea'
import { cn } from '#/lib/utils'
import { LiveVoteChart } from '#/components/arena/LiveVoteChart'
import { MeasuredEditorialText } from '#/components/arena/MeasuredEditorialText'
import { RoundResponseCard } from '#/components/arena/RoundResponseCard'
import { SessionInviteCard } from '#/components/arena/SessionInviteCard'

export type PublicSessionView = NonNullable<
  FunctionReturnType<typeof api.sessions.getPublicSessionView>
>

type SessionPageState = {
  displayName: string
  topic: string
  pendingJoin: boolean
  pendingTopic: boolean
  pendingVoteId: string | null
}

type SessionField = 'displayName' | 'topic'

export function SessionOverviewSection({
  sessionView,
}: {
  sessionView: PublicSessionView
}) {
  const isLive = sessionView.session.status === 'active'

  return (
    <section
      data-reveal
      className="surface relative overflow-hidden rounded-3xl"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_-5%_-30%,color-mix(in_oklab,var(--arena-violet),transparent_70%),transparent_45%),radial-gradient(circle_at_115%_120%,color-mix(in_oklab,var(--arena-amber),transparent_72%),transparent_45%)]"
      />

      <div className="relative grid gap-6 p-6 sm:p-8 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="flex flex-col gap-5">
          <div className="flex flex-wrap items-center gap-2">
            <SessionStatusPill
              status={sessionView.session.status}
              statusLabel={sessionView.session.statusLabel}
              isLive={isLive}
            />
            <Badge variant="outline">{sessionView.session.themeLabel}</Badge>
            <Badge variant="secondary">
              {sessionView.session.responseLanguageLabel}
            </Badge>
            <Badge variant="outline" className="font-mono text-[0.65rem]">
              code {sessionView.session.joinCode}
            </Badge>
          </div>

          <div>
            <p className="eyebrow">Live arena</p>
            <h1 className="display mt-2 text-balance text-3xl sm:text-4xl">
              {sessionView.session.title}
            </h1>
          </div>

          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-2">
              <Users2Icon className="size-4" />
              <span className="font-mono tabular-nums text-foreground">
                {sessionView.session.participantCount}
              </span>{' '}
              of{' '}
              <span className="font-mono tabular-nums">
                {sessionView.session.maxParticipants}
              </span>{' '}
              seats
            </span>
            <Separator orientation="vertical" className="h-4 max-sm:hidden" />
            <span className="inline-flex items-center gap-2">
              <CalendarClockIcon className="size-4" />
              {sessionView.viewer
                ? `Joined as ${sessionView.viewer.displayName}`
                : 'Watching anonymously'}
            </span>
          </div>

          <div className="mt-1 flex flex-wrap gap-2">
            {sessionView.participants.slice(0, 12).map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-2 rounded-full border border-border/60 bg-background/40 py-1 pl-1 pr-3"
              >
                <Avatar className="size-6">
                  <AvatarFallback className="text-[0.6rem]">
                    {initials(p.displayName)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs font-medium">{p.displayName}</span>
              </div>
            ))}
            {sessionView.participants.length > 12 ? (
              <span className="inline-flex items-center rounded-full border border-border/60 bg-background/40 px-3 py-1 text-xs text-muted-foreground">
                +{sessionView.participants.length - 12} more
              </span>
            ) : null}
          </div>
          {sessionView.session.customPrompt ? (
            <div className="rounded-2xl border border-border/60 bg-background/45 p-4">
              <p className="eyebrow text-[0.65rem]">Arena prompt</p>
              <p className="mt-2 text-sm leading-6 text-foreground/85">
                {sessionView.session.customPrompt}
              </p>
            </div>
          ) : null}
        </div>

        <SessionInviteCard slug={sessionView.session.slug} />
      </div>
    </section>
  )
}

export function LiveSessionTab({
  sessionView,
  liveRound,
  latestFinishedRound,
  state,
  onFieldChange,
  onTopicSubmit,
  onVote,
}: {
  sessionView: PublicSessionView
  liveRound: PublicSessionView['currentRound']
  latestFinishedRound: PublicSessionView['latestFinishedRound']
  state: SessionPageState
  onFieldChange: (field: SessionField, value: string) => void
  onTopicSubmit: (event: React.FormEvent<HTMLFormElement>) => Promise<void>
  onVote: (responseId: string) => Promise<void>
}) {
  return (
    <div className="space-y-5">
      {latestFinishedRound && liveRound?.status === 'collecting_topic' ? (
        <FinishedRoundRecap round={latestFinishedRound} />
      ) : null}

      {liveRound ? (
        <LiveRoundCard
          sessionView={sessionView}
          round={liveRound}
          state={state}
          onFieldChange={onFieldChange}
          onTopicSubmit={onTopicSubmit}
          onVote={onVote}
        />
      ) : (
        <Empty className="surface rounded-2xl p-10">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <HourglassIcon />
            </EmptyMedia>
            <EmptyTitle>Waiting for the admin</EmptyTitle>
            <EmptyDescription>
              The room is open. As soon as the admin starts the session a round
              will appear here in real time.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
    </div>
  )
}

function FinishedRoundRecap({
  round,
}: {
  round: NonNullable<PublicSessionView['latestFinishedRound']>
}) {
  return (
    <section className="surface space-y-5 rounded-2xl p-6">
      <header className="flex flex-wrap items-center gap-2">
        <Badge variant="outline" className="font-mono text-[0.65rem]">
          round {round.roundNumber}
        </Badge>
        <Badge variant="secondary">just closed</Badge>
      </header>
      {round.artifacts.criticAnalysis ? (
        <MeasuredEditorialText
          label="Critic"
          text={round.artifacts.criticAnalysis}
        />
      ) : null}
      {round.artifacts.statsSummary ? (
        <MeasuredEditorialText
          label="Stats"
          text={round.artifacts.statsSummary}
          accent="cyan"
        />
      ) : null}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {round.responses.map((response) => (
          <RoundResponseCard key={response.id} response={response} revealed />
        ))}
      </div>
    </section>
  )
}

function LiveRoundCard({
  sessionView,
  round,
  state,
  onFieldChange,
  onTopicSubmit,
  onVote,
}: {
  sessionView: PublicSessionView
  round: NonNullable<PublicSessionView['currentRound']>
  state: SessionPageState
  onFieldChange: (field: SessionField, value: string) => void
  onTopicSubmit: (event: React.FormEvent<HTMLFormElement>) => Promise<void>
  onVote: (responseId: string) => Promise<void>
}) {
  return (
    <section className="surface relative overflow-hidden rounded-2xl">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-primary/60 to-transparent"
      />

      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 px-6 py-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="font-mono text-[0.65rem]">
            round {round.roundNumber}
          </Badge>
          <RoundStatusPill status={round.status} />
          {round.votingEndsAt ? (
            <Badge variant="outline" className="font-mono text-[0.65rem]">
              voting ends {formatClock(round.votingEndsAt)}
            </Badge>
          ) : null}
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <RadioIcon className="size-3.5" />
          live
        </div>
      </header>

      <div className="space-y-6 px-6 py-6">
        <div>
          <p className="eyebrow">Topic</p>
          <h2 className="mt-1.5 font-display text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
            {round.topic ?? (
              <span className="text-muted-foreground">
                Waiting for a topic...
              </span>
            )}
          </h2>
        </div>

        {round.artifacts.hostIntro || round.artifacts.hostTransition ? (
          <MeasuredEditorialText
            label="Host"
            text={round.artifacts.hostTransition ?? round.artifacts.hostIntro}
          />
        ) : null}

        {sessionView.viewer?.canSubmitTopic ? (
          <form className="space-y-3" onSubmit={onTopicSubmit}>
            <Label htmlFor="topic">Pitch the next prompt</Label>
            <Textarea
              id="topic"
              value={state.topic}
              onChange={(e) => onFieldChange('topic', e.target.value)}
              placeholder="Example: Make a joke about debugging a smart toaster."
              rows={3}
            />
            <Button type="submit" disabled={state.pendingTopic}>
              <SparklesIcon className="size-4" />
              {state.pendingTopic ? 'Locking topic...' : 'Submit topic'}
            </Button>
          </form>
        ) : null}

        {round.status === 'generating' ? (
          <div className="flex items-start gap-3 rounded-xl border border-dashed border-border/60 bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
            <span className="live-dot mt-1" />
            <p>
              Models are generating now. Any provider that misses the 15 second
              window is marked with a timeout and the round continues.
            </p>
          </div>
        ) : null}

        {round.responses.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {round.responses.map((response) => (
              <RoundResponseCard
                key={response.id}
                response={response}
                revealed={round.status === 'scored'}
                showVoteButton={
                  round.status === 'voting' &&
                  !sessionView.viewer?.hasVotedCurrentRound
                }
                disabled={state.pendingVoteId !== null}
                onVote={onVote}
              />
            ))}
          </div>
        ) : null}

        {round.status === 'voting' &&
        (sessionView.viewer?.hasVotedCurrentRound ||
          !sessionView.viewer?.canVote) ? (
          <div className="rounded-2xl border border-border/60 bg-background/40 p-5">
            <div className="mb-4 flex items-center gap-2">
              <GavelIcon className="size-4 text-primary" />
              <p className="text-sm font-semibold">Live vote split</p>
            </div>
            <LiveVoteChart
              responses={round.responses.map((r) => ({
                slot: r.slot,
                votes: r.votes,
              }))}
            />
          </div>
        ) : null}

        {round.status === 'scored' && round.artifacts.criticAnalysis ? (
          <MeasuredEditorialText
            label="Critic"
            text={round.artifacts.criticAnalysis}
          />
        ) : null}
        {round.status === 'scored' && round.artifacts.statsSummary ? (
          <MeasuredEditorialText
            label="Stats"
            text={round.artifacts.statsSummary}
            accent="cyan"
          />
        ) : null}
        {round.status === 'scored' && round.artifacts.hostRecap ? (
          <MeasuredEditorialText
            label="Host"
            text={round.artifacts.hostRecap}
            accent="amber"
          />
        ) : null}
      </div>
    </section>
  )
}

export function SessionHistoryTab({
  rounds,
}: {
  rounds: PublicSessionView['rounds']
}) {
  if (rounds.length === 0) {
    return (
      <Empty className="surface rounded-2xl p-10">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <ScrollTextIcon />
          </EmptyMedia>
          <EmptyTitle>No completed rounds yet</EmptyTitle>
          <EmptyDescription>
            Once the first round wraps it&rsquo;ll appear here with full
            responses, agent commentary, and the winner reveal.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <div className="space-y-5">
      {rounds.map((round) => (
        <article
          key={round.id}
          className="surface relative overflow-hidden rounded-2xl"
        >
          <header className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 px-6 py-4">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="font-mono text-[0.65rem]">
                round {round.roundNumber}
              </Badge>
              <RoundStatusPill status={round.status} />
            </div>
          </header>

          <div className="space-y-5 px-6 py-6">
            <div>
              <p className="eyebrow">Topic</p>
              <h3 className="mt-1.5 font-display text-balance text-xl font-semibold tracking-tight sm:text-2xl">
                {round.topic ?? (
                  <span className="text-muted-foreground">
                    No topic submitted
                  </span>
                )}
              </h3>
            </div>

            {round.artifacts.hostIntro ? (
              <MeasuredEditorialText
                label="Host"
                text={round.artifacts.hostIntro}
              />
            ) : null}
            {round.artifacts.criticAnalysis ? (
              <MeasuredEditorialText
                label="Critic"
                text={round.artifacts.criticAnalysis}
              />
            ) : null}
            {round.artifacts.statsSummary ? (
              <MeasuredEditorialText
                label="Stats"
                text={round.artifacts.statsSummary}
                accent="cyan"
              />
            ) : null}

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {round.responses.map((response) => (
                <RoundResponseCard
                  key={response.id}
                  response={response}
                  revealed={round.status === 'scored'}
                />
              ))}
            </div>
          </div>
        </article>
      ))}
    </div>
  )
}

export function SessionEventLogTab({
  events,
}: {
  events: PublicSessionView['events']
}) {
  return (
    <section className="surface relative overflow-hidden rounded-2xl">
      <header className="flex items-center gap-3 border-b border-border/60 px-6 py-4">
        <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <MicVocalIcon className="size-5" />
        </div>
        <div>
          <p className="text-sm font-semibold">Live event log</p>
          <p className="text-xs text-muted-foreground">
            Newest events first · {events.length} total
          </p>
        </div>
      </header>

      {events.length === 0 ? (
        <Empty className="py-10">
          <EmptyHeader>
            <EmptyTitle>No events yet</EmptyTitle>
            <EmptyDescription>
              Once the session starts, every state transition appears here.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <ScrollArea className="h-112">
          <ol className="relative ml-6 mr-6 my-6 space-y-5 border-l border-border/60 pl-6">
            {events.map((event) => (
              <li key={event._id} className="relative">
                <span
                  aria-hidden
                  className="absolute left-[-31px] top-1.5 size-2.5 rounded-full bg-primary ring-4 ring-background"
                />
                <p className="font-mono text-[0.65rem] uppercase tracking-[0.16em] text-muted-foreground">
                  {formatClock(event.createdAt)}
                </p>
                <p className="mt-1 text-sm font-semibold tracking-tight">
                  {event.title}
                </p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  {event.description}
                </p>
              </li>
            ))}
          </ol>
        </ScrollArea>
      )}
    </section>
  )
}

function SessionStatusPill({
  status,
  statusLabel,
  isLive,
}: {
  status: string
  statusLabel: string
  isLive: boolean
}) {
  if (isLive) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/12 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300">
        <span className="live-dot" />
        {statusLabel}
      </span>
    )
  }

  const tone =
    status === 'ended'
      ? 'bg-primary/12 text-primary dark:bg-primary/20'
      : status === 'stopped'
        ? 'bg-red-500/12 text-red-700 dark:bg-red-400/15 dark:text-red-300'
        : 'bg-muted text-muted-foreground'

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium',
        tone,
      )}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {statusLabel}
    </span>
  )
}

function RoundStatusPill({ status }: { status: string }) {
  const isLiveLike = status === 'voting' || status === 'generating'
  const tone =
    status === 'scored'
      ? 'bg-amber-500/12 text-amber-700 dark:bg-amber-400/15 dark:text-amber-300'
      : status === 'voting'
        ? 'bg-primary/12 text-primary'
        : status === 'generating'
          ? 'bg-cyan-500/12 text-cyan-700 dark:bg-cyan-400/15 dark:text-cyan-300'
          : status === 'collecting_topic'
            ? 'bg-violet-500/12 text-violet-700 dark:bg-violet-400/15 dark:text-violet-300'
            : 'bg-muted text-muted-foreground'

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium capitalize',
        tone,
      )}
    >
      {isLiveLike ? (
        <span className="live-dot" />
      ) : (
        <span className="size-1.5 rounded-full bg-current" />
      )}
      {status.replaceAll('_', ' ')}
    </span>
  )
}
