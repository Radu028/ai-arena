import { createFileRoute, Link } from '@tanstack/react-router'
import { useMutation, useQuery } from 'convex/react'
import { toast } from 'sonner'
import type { Id } from '@convex/_generated/dataModel'
import { api } from '@convex/_generated/api'
import { AdminGuard } from '#/components/AdminGuard'
import { Button } from '#/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import { Badge } from '#/components/ui/badge'
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
    if (!session) {
      return
    }
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
    if (!session) {
      return
    }
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
    if (!session) {
      return
    }
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
    <div className="page-frame space-y-6">
      <AdminGuard title="Session controls">
        {session ? (
          <>
            <section className="grid gap-4 lg:grid-cols-[1fr_0.9fr]">
              <Card className="arena-panel">
                <CardHeader>
                  <CardTitle className="font-serif text-4xl">
                    {session.title}
                  </CardTitle>
                  <CardDescription>
                    Admin controls for the live room, round state, and share
                    links.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="capitalize">
                      {session.status}
                    </Badge>
                    <Badge variant="outline">{session.themeLabel}</Badge>
                    <Badge variant="outline">
                      Join code: {session.joinCode}
                    </Badge>
                  </div>
                  <div className="grid gap-3 text-sm text-muted-foreground md:grid-cols-2">
                    <p>Created: {formatDateTime(session.createdAt)}</p>
                    <p>Started: {formatDateTime(session.startedAt)}</p>
                    <p>Stopped: {formatDateTime(session.stoppedAt)}</p>
                    <p>Ended: {formatDateTime(session.endedAt)}</p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Button
                      onClick={handleStart}
                      disabled={session.status !== 'waiting'}
                    >
                      Start Session
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleEndVoting}
                      disabled={session.currentRoundStatus !== 'voting'}
                    >
                      End Voting Early
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={handleStop}
                      disabled={
                        session.status === 'stopped' ||
                        session.status === 'ended'
                      }
                    >
                      Stop Session
                    </Button>
                    <Button asChild variant="outline">
                      <Link
                        to="/sessions/$slug"
                        params={{ slug: session.slug }}
                      >
                        Open Public Room
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="arena-panel">
                <CardHeader>
                  <CardTitle className="font-serif text-3xl">Lineup</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {session.selectedModels.map((model) => (
                    <div
                      key={model.key}
                      className="rounded-[1.2rem] border border-border/70 bg-background/65 p-4"
                    >
                      <p className="font-medium text-foreground">
                        {model.label}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {model.description}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </section>

            <Card className="arena-panel">
              <CardHeader>
                <CardTitle className="font-serif text-3xl">
                  Scoreboard
                </CardTitle>
                <CardDescription>
                  Live summary across all completed rounds.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3 md:grid-cols-3">
                {session.scoreboard.map((entry) => (
                  <div
                    key={entry.modelKey}
                    className="rounded-[1.2rem] border border-border/70 bg-background/65 p-4"
                  >
                    <p className="font-medium text-foreground">{entry.label}</p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {entry.wins} wins · {entry.totalVotes} votes
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {publicView ? (
              <Card className="arena-panel">
                <CardHeader>
                  <CardTitle className="font-serif text-3xl">
                    Public snapshot
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm text-muted-foreground">
                  <p>
                    Participants: {publicView.session.participantCount} /{' '}
                    {publicView.session.maxParticipants}
                  </p>
                  <p>
                    Current round:{' '}
                    {publicView.session.currentRoundNumber || 'Not started'}
                  </p>
                  {publicView.currentRound?.topic ? (
                    <p>Topic: {publicView.currentRound.topic}</p>
                  ) : null}
                </CardContent>
              </Card>
            ) : null}
          </>
        ) : (
          <Card className="arena-panel">
            <CardHeader>
              <CardTitle className="font-serif text-3xl">
                Session unavailable
              </CardTitle>
              <CardDescription>
                This session either does not exist or belongs to a different
                admin identity.
              </CardDescription>
            </CardHeader>
          </Card>
        )}
      </AdminGuard>
    </div>
  )
}
