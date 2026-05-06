import { Link, createFileRoute } from '@tanstack/react-router'
import { useMutation, useQuery } from 'convex/react'
import {
  ArrowLeftIcon,
  ExternalLinkIcon,
  PlayIcon,
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
import { Separator } from '#/components/ui/separator'
import { formatDateTime } from '#/lib/format'

export const Route = createFileRoute('/admin/sessions/$sessionId')({
  component: AdminSessionDetailPage,
})

function AdminSessionDetailPage() {
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

  return (
    <div className="shell space-y-6">
      <AdminGuard title="Session controls">
        <div className="flex items-center justify-between">
          <Button asChild variant="ghost" size="sm">
            <Link to="/admin">
              <ArrowLeftIcon className="size-4" />
              Back to sessions
            </Link>
          </Button>
        </div>

        {session ? (
          <>
            <section
              data-reveal
              className="surface relative overflow-hidden rounded-2xl p-6 sm:p-8"
            >
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_85%_-10%,color-mix(in_oklab,var(--arena-violet),transparent_72%),transparent_50%)]"
              />
              <div className="relative flex flex-col gap-5">
                <div className="flex flex-wrap items-center gap-2">
                  <SessionStatusPill status={session.status} />
                  <Badge variant="outline">{session.themeLabel}</Badge>
                  <Badge variant="secondary">
                    {session.responseLanguageLabel}
                  </Badge>
                  <Badge variant="outline" className="font-mono text-[0.65rem]">
                    code {session.joinCode}
                  </Badge>
                </div>

                <div>
                  <p className="eyebrow">Session</p>
                  <h1 className="display mt-2 text-balance text-3xl sm:text-4xl">
                    {session.title}
                  </h1>
                </div>

                <dl className="grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
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
                  <DateStat
                    label="Ended"
                    value={formatDateTime(session.endedAt)}
                  />
                </dl>

                {session.customPrompt ? (
                  <div className="rounded-2xl border border-border/60 bg-background/45 p-4">
                    <p className="eyebrow text-[0.65rem]">Arena prompt</p>
                    <p className="mt-2 text-sm leading-6 text-foreground/85">
                      {session.customPrompt}
                    </p>
                  </div>
                ) : null}

                <Separator className="opacity-60" />

                <div className="flex flex-wrap gap-3">
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
                    End voting early
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

                <SessionInviteCard
                  slug={session.slug}
                  title="Session invitation"
                  description="Use this link or QR code during the demo so spectators can open the public live room directly."
                />
              </div>
            </section>

            <section
              data-reveal
              className="grid gap-4 lg:grid-cols-[1fr_0.85fr]"
            >
              <div className="surface rounded-2xl p-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold">Scoreboard</p>
                  <span className="font-mono text-[0.65rem] uppercase tracking-[0.16em] text-muted-foreground">
                    live
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Live summary across all completed rounds.
                </p>

                <div className="mt-5 grid gap-2 sm:grid-cols-2">
                  {session.scoreboard.map((entry, i) => (
                    <div
                      key={entry.modelKey}
                      className="flex items-center gap-3 rounded-xl border border-border/60 bg-background/40 p-3"
                    >
                      <span className="grid size-8 place-items-center rounded-md bg-muted font-mono text-xs text-muted-foreground">
                        {i + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-sm font-medium">
                          {entry.label}
                        </p>
                        <p className="font-mono text-xs text-muted-foreground">
                          {entry.wins} wins · {entry.totalVotes} votes
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="surface rounded-2xl p-6">
                <p className="text-sm font-semibold">Lineup</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Snapshot taken when the session was created.
                </p>
                <ul className="mt-4 space-y-2">
                  {session.selectedModels.map((model) => (
                    <li
                      key={model.key}
                      className="flex items-start gap-3 rounded-lg border border-border/60 bg-background/40 p-3"
                    >
                      <span
                        aria-hidden
                        className="mt-1.5 size-2 shrink-0 rounded-full"
                        style={{ backgroundColor: model.accent }}
                      />
                      <div>
                        <p className="text-sm font-medium">{model.label}</p>
                        <p className="text-xs text-muted-foreground">
                          {model.description}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            {publicView ? (
              <section data-reveal className="surface rounded-2xl p-6">
                <p className="text-sm font-semibold">Public snapshot</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  This is what spectators see when they open the room.
                </p>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
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
          <Empty className="surface rounded-2xl p-10">
            <EmptyHeader>
              <EmptyTitle>Session unavailable</EmptyTitle>
              <EmptyDescription>
                This session either does not exist or belongs to a different
                admin identity.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </AdminGuard>
    </div>
  )
}

function DateStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
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
    <div className="rounded-xl border border-border/60 bg-background/40 p-3">
      <p className="eyebrow">{label}</p>
      <p className="mt-1 truncate text-sm font-medium">{value}</p>
    </div>
  )
}
