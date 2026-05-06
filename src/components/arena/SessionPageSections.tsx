import type { FunctionReturnType } from 'convex/server'
import type { api } from '@convex/_generated/api'
import { formatClock, initials } from '#/lib/format'
import { Avatar, AvatarFallback } from '#/components/ui/avatar'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { ScrollArea } from '#/components/ui/scroll-area'
import { Textarea } from '#/components/ui/textarea'
import { LiveVoteChart } from '#/components/arena/LiveVoteChart'
import { MeasuredEditorialText } from '#/components/arena/MeasuredEditorialText'
import { RoundResponseCard } from '#/components/arena/RoundResponseCard'

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
  const joinPath = `/sessions/${sessionView.session.slug}`
  const shareUrl =
    typeof window === 'undefined'
      ? joinPath
      : new URL(joinPath, window.location.origin).toString()
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=12&data=${encodeURIComponent(shareUrl)}`

  async function copyShareUrl() {
    await navigator.clipboard.writeText(shareUrl)
  }

  return (
    <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
      <Card className="hero-shell">
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="rounded-full bg-(--arena-signal) text-white">
              {sessionView.session.statusLabel}
            </Badge>
            <Badge variant="outline">{sessionView.session.themeLabel}</Badge>
            <Badge variant="outline">Code {sessionView.session.joinCode}</Badge>
          </div>
          <CardTitle className="font-serif text-5xl">
            {sessionView.session.title}
          </CardTitle>
          <CardDescription className="max-w-2xl text-base leading-7">
            {sessionView.session.participantCount} of{' '}
            {sessionView.session.maxParticipants} seats filled. The room stays
            anonymous during voting and reveals identities only after the round
            closes.
          </CardDescription>
        </CardHeader>
      </Card>

      <Card className="arena-panel">
        <CardHeader>
          <CardTitle className="font-serif text-3xl">Share session</CardTitle>
          <CardDescription>
            {sessionView.viewer
              ? `You joined as ${sessionView.viewer.displayName}.`
              : 'Anyone can watch. A username is only requested when they vote.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-[auto_1fr] sm:items-center">
            <img
              src={qrUrl}
              alt={`QR code for ${shareUrl}`}
              className="size-44 rounded-[1.25rem] border border-border/70 bg-white p-2"
            />
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="shareUrl">Public join link</Label>
                <Input id="shareUrl" value={shareUrl} readOnly />
              </div>
              <Button type="button" variant="outline" onClick={copyShareUrl}>
                Copy Link
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {sessionView.participants.slice(0, 10).map((participant) => (
              <div
                key={participant.id}
                className="flex items-center gap-2 rounded-full border border-border/70 bg-background/70 px-3 py-1.5"
              >
                <Avatar className="size-7 border border-border/70">
                  <AvatarFallback>
                    {initials(participant.displayName)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm text-foreground">
                  {participant.displayName}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
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
    <div className="space-y-4">
      {latestFinishedRound && liveRound?.status === 'collecting_topic' ? (
        <Card className="arena-panel">
          <CardHeader>
            <CardTitle className="font-serif text-3xl">
              Round {latestFinishedRound.roundNumber} just closed
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {latestFinishedRound.artifacts.criticAnalysis ? (
              <MeasuredEditorialText
                text={latestFinishedRound.artifacts.criticAnalysis}
              />
            ) : null}
            {latestFinishedRound.artifacts.statsSummary ? (
              <MeasuredEditorialText
                text={latestFinishedRound.artifacts.statsSummary}
              />
            ) : null}
            <div className="grid gap-4 md:grid-cols-3">
              {latestFinishedRound.responses.map((response) => (
                <RoundResponseCard
                  key={response.id}
                  response={response}
                  revealed
                />
              ))}
            </div>
          </CardContent>
        </Card>
      ) : null}

      {liveRound ? (
        <Card className="arena-panel">
          <CardHeader>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">Round {liveRound.roundNumber}</Badge>
              <Badge variant="outline" className="capitalize">
                {liveRound.status.replaceAll('_', ' ')}
              </Badge>
              {liveRound.votingEndsAt ? (
                <Badge variant="outline">
                  Voting ends {formatClock(liveRound.votingEndsAt)}
                </Badge>
              ) : null}
            </div>
            <CardTitle className="font-serif text-4xl">
              {liveRound.topic ?? 'Waiting for a topic'}
            </CardTitle>
            <CardDescription>
              {liveRound.artifacts.hostTransition ??
                liveRound.artifacts.hostIntro ??
                'The room is live.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {liveRound.artifacts.hostIntro ? (
              <MeasuredEditorialText text={liveRound.artifacts.hostIntro} />
            ) : null}

            {sessionView.viewer?.canSubmitTopic ? (
              <form className="space-y-3" onSubmit={onTopicSubmit}>
                <Label htmlFor="topic">Pitch the next prompt</Label>
                <Textarea
                  id="topic"
                  value={state.topic}
                  onChange={(event) =>
                    onFieldChange('topic', event.target.value)
                  }
                  placeholder="Example: Make a joke about debugging a smart toaster."
                />
                <Button type="submit" disabled={state.pendingTopic}>
                  {state.pendingTopic ? 'Locking topic…' : 'Submit Topic'}
                </Button>
              </form>
            ) : null}

            {liveRound.status === 'generating' ? (
              <div className="rounded-[1.3rem] border border-border/70 bg-background/65 px-4 py-5 text-muted-foreground">
                Models are generating now. Any provider that misses the 15
                second window is marked with a timeout notice and the round
                continues.
              </div>
            ) : null}

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {liveRound.responses.map((response) => (
                <RoundResponseCard
                  key={response.id}
                  response={response}
                  revealed={liveRound.status === 'scored'}
                  showVoteButton={
                    liveRound.status === 'voting' &&
                    !sessionView.viewer?.hasVotedCurrentRound
                  }
                  disabled={state.pendingVoteId !== null}
                  onVote={onVote}
                />
              ))}
            </div>

            {liveRound.status === 'voting' &&
            (sessionView.viewer?.hasVotedCurrentRound ||
              !sessionView.viewer?.canVote) ? (
              <Card className="rounded-[1.5rem] border border-border/70 bg-background/70">
                <CardHeader>
                  <CardTitle className="font-serif text-3xl">
                    Live vote split
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <LiveVoteChart
                    responses={liveRound.responses.map((response) => ({
                      slot: response.slot,
                      votes: response.votes,
                    }))}
                  />
                </CardContent>
              </Card>
            ) : null}

            {liveRound.status === 'scored' &&
            liveRound.artifacts.criticAnalysis ? (
              <MeasuredEditorialText
                text={liveRound.artifacts.criticAnalysis}
              />
            ) : null}
            {liveRound.status === 'scored' &&
            liveRound.artifacts.statsSummary ? (
              <MeasuredEditorialText text={liveRound.artifacts.statsSummary} />
            ) : null}
            {liveRound.status === 'scored' && liveRound.artifacts.hostRecap ? (
              <MeasuredEditorialText text={liveRound.artifacts.hostRecap} />
            ) : null}
          </CardContent>
        </Card>
      ) : (
        <Card className="arena-panel">
          <CardHeader>
            <CardTitle className="font-serif text-4xl">
              Waiting for the admin
            </CardTitle>
          </CardHeader>
        </Card>
      )}
    </div>
  )
}

export function SessionHistoryTab({
  rounds,
}: {
  rounds: PublicSessionView['rounds']
}) {
  return (
    <div className="space-y-4">
      {rounds.map((round) => (
        <Card key={round.id} className="arena-panel">
          <CardHeader>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">Round {round.roundNumber}</Badge>
              <Badge variant="outline" className="capitalize">
                {round.status.replaceAll('_', ' ')}
              </Badge>
            </div>
            <CardTitle className="font-serif text-3xl">
              {round.topic ?? 'No topic submitted'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {round.artifacts.hostIntro ? (
              <MeasuredEditorialText text={round.artifacts.hostIntro} />
            ) : null}
            {round.artifacts.criticAnalysis ? (
              <MeasuredEditorialText text={round.artifacts.criticAnalysis} />
            ) : null}
            {round.artifacts.statsSummary ? (
              <MeasuredEditorialText text={round.artifacts.statsSummary} />
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
          </CardContent>
        </Card>
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
    <Card className="arena-panel">
      <CardHeader>
        <CardTitle className="font-serif text-3xl">Live event log</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-128 pr-4">
          <div className="space-y-3">
            {events.map((event) => (
              <div
                key={event._id}
                className="rounded-[1.2rem] border border-border/70 bg-background/65 px-4 py-4"
              >
                <p className="eyebrow">{formatClock(event.createdAt)}</p>
                <p className="mt-2 font-medium text-foreground">
                  {event.title}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {event.description}
                </p>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
