import { Link, createFileRoute } from '@tanstack/react-router'
import { useMutation, useQuery } from 'convex/react'
import {
  ArrowLeftIcon,
  EyeIcon,
  ExternalLinkIcon,
  PlayIcon,
  SkipForwardIcon,
  SquareIcon,
  TimerOffIcon,
} from 'lucide-react'
import { toast } from 'sonner'
import type { Id } from '@convex/_generated/dataModel'
import { api } from '@convex/_generated/api'
import { AdminGuard } from '#/components/AdminGuard'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { SessionInviteCard } from '#/components/arena/SessionInviteCard'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from '#/components/ui/empty'
import { formatDateTime } from '#/lib/format'

export const Route = createFileRoute('/admin/sessions/$sessionId')({
  component: AdminSessionDetailPage,
})

function AdminSessionDetailPage() {
  return (
    <div className="shell space-y-12">
      <AdminGuard title="Session controls">
        <AdminSessionDetailContent />
      </AdminGuard>
    </div>
  )
}

function AdminSessionDetailContent() {
  const { sessionId } = Route.useParams()
  const session = useQuery(api.sessions.getAdminSession, {
    sessionId: sessionId as Id<'sessions'>,
  })
  const publicView = useQuery(
    api.sessions.getPublicSessionView,
    session ? { slug: session.slug, participantToken: null } : 'skip',
  )
  const startSession = useMutation(api.sessions.start)
  const stopSession = useMutation(api.sessions.stop)
  const endVotingEarly = useMutation(api.rounds.endVotingEarly)
  const startNextRound = useMutation(api.rounds.startNextRound)
  const revealLatestScoredRound = useMutation(
    api.rounds.revealLatestScoredRound,
  )

  async function handleStart() {
    if (!session) return
    try {
      await startSession({ sessionId: session.id })
      toast.success('Session started.')
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Could not start the session.',
      )
    }
  }

  async function handleStop() {
    if (!session) return
    try {
      await stopSession({ sessionId: session.id })
      toast.success('Session stopped.')
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Could not stop the session.',
      )
    }
  }

  async function handleEndVoting() {
    if (!session) return
    try {
      await endVotingEarly({ sessionId: session.id })
      toast.success('Voting closed early.')
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Could not close voting early.',
      )
    }
  }

  async function handleReveal() {
    if (!session) return
    try {
      await revealLatestScoredRound({ sessionId: session.id })
      toast.success('Model names revealed.')
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Could not reveal models.',
      )
    }
  }

  async function handleStartNextRound() {
    if (!session) return
    try {
      await startNextRound({ sessionId: session.id })
      toast.success('Next round started.')
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Could not start the next round.',
      )
    }
  }

  return (
    <>
      <div>
        <Button asChild variant="ghost" size="sm" className="-ml-3">
          <Link to="/admin">
            <ArrowLeftIcon className="size-4" />
            Back to sessions
          </Link>
        </Button>
      </div>

      {session ? (
        <>
          <header data-reveal className="space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <SessionStatusPill status={session.status} />
              <Badge variant="outline">{session.themeLabel}</Badge>
              <Badge variant="secondary">{session.responseLanguageLabel}</Badge>
              <Badge variant="outline" className="font-mono text-[0.65rem]">
                code {session.joinCode}
              </Badge>
            </div>

            <div>
              <p className="eyebrow">Session</p>
              <h1 className="display mt-2 text-balance text-3xl sm:text-5xl">
                {session.title}
              </h1>
            </div>

            <dl className="grid gap-x-6 gap-y-4 text-sm sm:grid-cols-2 lg:grid-cols-4 lg:divide-x lg:divide-border/50">
              <DateStat
                label="Created"
                value={formatDateTime(session.createdAt)}
              />
              <DateStat
                label="Started"
                value={formatDateTime(session.startedAt)}
              />
              <DateStat
                label="Stopped"
                value={formatDateTime(session.stoppedAt)}
              />
              <DateStat label="Ended" value={formatDateTime(session.endedAt)} />
            </dl>

            {session.customPrompt ? (
              <blockquote className="border-l-2 border-primary/40 pl-4">
                <p className="eyebrow text-[0.65rem]">Arena prompt</p>
                <p className="mt-2 font-editorial text-base italic leading-7 text-foreground/85">
                  “{session.customPrompt}”
                </p>
              </blockquote>
            ) : null}

            <div className="flex flex-wrap gap-2 pt-2">
              <Button
                onClick={handleStart}
                disabled={session.status !== 'waiting'}
              >
                <PlayIcon className="size-4" />
                Start session
              </Button>
              <Button
                variant="outline"
                onClick={handleEndVoting}
                disabled={session.currentRoundStatus !== 'voting'}
              >
                <TimerOffIcon className="size-4" />
                Close round
              </Button>
              <Button
                variant="outline"
                onClick={handleStartNextRound}
                disabled={!session.canStartNextRound}
              >
                <SkipForwardIcon className="size-4" />
                Start next round
              </Button>
              <Button
                variant="outline"
                onClick={handleReveal}
                disabled={!session.hasUnrevealedScoredRound}
              >
                <EyeIcon className="size-4" />
                Reveal models
              </Button>
              <Button
                variant="destructive"
                onClick={handleStop}
                disabled={
                  session.status === 'stopped' || session.status === 'ended'
                }
              >
                <SquareIcon className="size-4" />
                Stop session
              </Button>
              <Button asChild variant="outline">
                <Link to="/sessions/$slug" params={{ slug: session.slug }}>
                  <ExternalLinkIcon className="size-4" />
                  Open public room
                </Link>
              </Button>
            </div>
          </header>

          <SessionInviteCard
            slug={session.slug}
            title="Session invitation"
            description="Use this link or QR code during the demo so spectators can open the public live room directly."
          />

          <section
            data-reveal
            className="grid gap-12 lg:grid-cols-[1fr_0.85fr] lg:gap-16"
          >
            <div className="space-y-5">
              <div className="flex items-end justify-between">
                <div>
                  <p className="eyebrow">Scoreboard</p>
                  <h2 className="mt-2 text-xl font-semibold tracking-tight sm:text-2xl">
                    Live summary
                  </h2>
                </div>
                <span className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground">
                  live
                </span>
              </div>

              <ul className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
                {session.scoreboard.map((entry, i) => (
                  <li
                    key={entry.modelKey}
                    className="flex items-center gap-3 border-b border-border/40 pb-2.5 last:border-b-0 last:pb-0"
                  >
                    <span className="grid size-7 place-items-center rounded-md bg-muted/60 font-mono text-xs text-muted-foreground">
                      {i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {entry.label}
                      </p>
                      <p className="font-mono text-xs text-muted-foreground">
                        {entry.wins} wins · {entry.totalVotes} votes
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-5">
              <div>
                <p className="eyebrow">Lineup</p>
                <h2 className="mt-2 text-xl font-semibold tracking-tight sm:text-2xl">
                  Battle roster
                </h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  Snapshot taken when the session was created.
                </p>
              </div>
              <ul className="space-y-3">
                {session.selectedModels.map((model) => (
                  <li
                    key={model.key}
                    className="flex items-start gap-3 border-b border-border/40 pb-3 last:border-b-0 last:pb-0"
                  >
                    <span
                      aria-hidden
                      className="mt-1.5 size-2 shrink-0 rounded-full"
                      style={{ backgroundColor: model.accent }}
                    />
                    <div>
                      <p className="text-sm font-medium">{model.label}</p>
                      <p className="text-xs leading-5 text-muted-foreground">
                        {model.description}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {publicView ? (
            <section data-reveal className="space-y-5">
              <div>
                <p className="eyebrow">Public snapshot</p>
                <h2 className="mt-2 text-xl font-semibold tracking-tight sm:text-2xl">
                  What spectators see
                </h2>
              </div>
              <div className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-3 sm:divide-x sm:divide-border/50">
                <SnapshotStat
                  label="Participants"
                  value={`${publicView.session.participantCount} / ${publicView.session.maxParticipants}`}
                />
                <SnapshotStat
                  label="Current round"
                  value={String(
                    publicView.session.currentRoundNumber || 'Not started',
                  )}
                />
                <SnapshotStat
                  label="Topic"
                  value={publicView.currentRound?.topic ?? '—'}
                />
              </div>
            </section>
          ) : null}
        </>
      ) : (
        <Empty className="rounded-2xl border border-border/60 bg-card/40 p-10">
          <EmptyHeader>
            <EmptyTitle>Session unavailable</EmptyTitle>
            <EmptyDescription>
              This session either does not exist or belongs to a different admin
              identity.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
    </>
  )
}

function DateStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="lg:px-6 lg:first:pl-0">
      <dt className="eyebrow">{label}</dt>
      <dd className="mt-1 font-mono text-sm tabular-nums text-foreground">
        {value}
      </dd>
    </div>
  )
}

function SessionStatusPill({ status }: { status: string }) {
  const tone =
    status === 'active'
      ? 'bg-emerald-500/12 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300'
      : status === 'ended'
        ? 'bg-primary/12 text-primary dark:bg-primary/20'
        : status === 'stopped'
          ? 'bg-red-500/12 text-red-700 dark:bg-red-400/15 dark:text-red-300'
          : 'bg-muted text-muted-foreground'
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${tone}`}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {status}
    </span>
  )
}

function SnapshotStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="sm:px-6 sm:first:pl-0">
      <p className="eyebrow">{label}</p>
      <p className="mt-1 truncate text-sm font-medium">{value}</p>
    </div>
  )
}
