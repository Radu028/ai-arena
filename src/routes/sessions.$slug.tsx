import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useMutation, useQuery } from 'convex/react'
import { toast } from 'sonner'
import { api } from '@convex/_generated/api'
import {
  joinSessionSchema,
  normalizeOptionalEmail,
  topicSchema,
} from '@shared/validation'
import { useParticipantToken } from '#/hooks/use-participant-token'
import { formatClock, initials } from '#/lib/format'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '#/components/ui/tabs'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { Textarea } from '#/components/ui/textarea'
import { ScrollArea } from '#/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '#/components/ui/avatar'
import { LiveVoteChart } from '#/components/arena/LiveVoteChart'
import { MeasuredEditorialText } from '#/components/arena/MeasuredEditorialText'
import { RoundResponseCard } from '#/components/arena/RoundResponseCard'

export const Route = createFileRoute('/sessions/$slug')({
  component: SessionPage,
})

function SessionPage() {
  const { slug } = Route.useParams()
  const [participantToken, setParticipantToken] = useParticipantToken(slug)
  const sessionView = useQuery(api.sessions.getPublicSessionView, {
    slug,
    participantToken,
  })
  const joinSession = useMutation(api.sessions.joinBySlug)
  const submitTopic = useMutation(api.rounds.submitTopic)
  const castVote = useMutation(api.votes.castHumanVote)

  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [topic, setTopic] = useState('')
  const [pendingJoin, setPendingJoin] = useState(false)
  const [pendingTopic, setPendingTopic] = useState(false)
  const [pendingVoteId, setPendingVoteId] = useState<string | null>(null)

  async function handleJoin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const parsed = joinSessionSchema.safeParse({ displayName, email })
    if (!parsed.success) {
      toast.error(
        parsed.error.issues[0]?.message ?? 'Join details are invalid.',
      )
      return
    }

    setPendingJoin(true)
    try {
      const result = await joinSession({
        slug,
        displayName: parsed.data.displayName,
        email: normalizeOptionalEmail(parsed.data.email),
        existingToken: participantToken,
      })
      setParticipantToken(result.accessToken)
      toast.success('Joined the live room.')
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Could not join the session.',
      )
    } finally {
      setPendingJoin(false)
    }
  }

  async function handleTopicSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!participantToken) {
      toast.error('Join the session before submitting a topic.')
      return
    }
    const parsed = topicSchema.safeParse({ topic })
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? 'Topic is invalid.')
      return
    }

    setPendingTopic(true)
    try {
      await submitTopic({
        slug,
        participantToken,
        topic: parsed.data.topic,
      })
      setTopic('')
      toast.success('Topic locked for the round.')
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Could not submit topic.',
      )
    } finally {
      setPendingTopic(false)
    }
  }

  async function handleVote(responseId: string) {
    if (!participantToken) {
      toast.error('Join the session before voting.')
      return
    }
    setPendingVoteId(responseId)
    try {
      const result = await castVote({
        slug,
        participantToken,
        responseId: responseId as never,
      })
      toast.success(
        result.accepted ? 'Vote locked in.' : 'Your vote was already counted.',
      )
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Vote failed.')
    } finally {
      setPendingVoteId(null)
    }
  }

  if (!sessionView) {
    return (
      <div className="page-frame">
        <Card className="arena-panel">
          <CardHeader>
            <CardTitle className="font-serif text-4xl">
              Session not found
            </CardTitle>
            <CardDescription>
              This share link does not match an active AI Arena session.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  const liveRound = sessionView.currentRound
  const latestFinishedRound = sessionView.latestFinishedRound

  return (
    <div className="page-frame space-y-6">
      <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="hero-shell">
          <CardHeader>
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="rounded-full bg-[var(--arena-signal)] text-white">
                {sessionView.session.statusLabel}
              </Badge>
              <Badge variant="outline">{sessionView.session.themeLabel}</Badge>
              <Badge variant="outline">
                Code {sessionView.session.joinCode}
              </Badge>
            </div>
            <CardTitle className="font-serif text-5xl">
              {sessionView.session.title}
            </CardTitle>
            <CardDescription className="max-w-2xl text-base leading-7">
              {sessionView.session.participantCount} of{' '}
              {sessionView.session.maxParticipants} seats filled. The room stays
              anonymous during voting and reveals identities only after the
              round closes.
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="arena-panel">
          <CardHeader>
            <CardTitle className="font-serif text-3xl">Lobby</CardTitle>
            <CardDescription>
              {sessionView.viewer
                ? `You joined as ${sessionView.viewer.displayName}.`
                : 'Join the room to submit topics and vote.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!sessionView.viewer ? (
              <form className="space-y-4" onSubmit={handleJoin}>
                <div className="space-y-2">
                  <Label htmlFor="displayName">Display name</Label>
                  <Input
                    id="displayName"
                    value={displayName}
                    onChange={(event) => setDisplayName(event.target.value)}
                    placeholder="Radu"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email (optional)</Label>
                  <Input
                    id="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="radu@example.com"
                  />
                </div>
                <Button type="submit" size="lg" disabled={pendingJoin}>
                  {pendingJoin ? 'Joining…' : 'Join Session'}
                </Button>
              </form>
            ) : null}

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

      <Tabs defaultValue="live" className="space-y-4">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="live">Live</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="log">Arena Log</TabsTrigger>
        </TabsList>

        <TabsContent value="live" className="space-y-4">
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
                  <form className="space-y-3" onSubmit={handleTopicSubmit}>
                    <Label htmlFor="topic">Pitch the next prompt</Label>
                    <Textarea
                      id="topic"
                      value={topic}
                      onChange={(event) => setTopic(event.target.value)}
                      placeholder="Example: Make a joke about debugging a smart toaster."
                    />
                    <Button type="submit" disabled={pendingTopic}>
                      {pendingTopic ? 'Locking topic…' : 'Submit Topic'}
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
                        sessionView.viewer?.canVote
                      }
                      disabled={pendingVoteId !== null}
                      onVote={handleVote}
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
                liveRound.artifacts.hostRecap ? (
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
        </TabsContent>

        <TabsContent value="history">
          <div className="space-y-4">
            {sessionView.rounds.map((round) => (
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
                    <MeasuredEditorialText
                      text={round.artifacts.criticAnalysis}
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
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="log">
          <Card className="arena-panel">
            <CardHeader>
              <CardTitle className="font-serif text-3xl">
                Live event log
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[32rem] pr-4">
                <div className="space-y-3">
                  {sessionView.events.map((event) => (
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
        </TabsContent>
      </Tabs>
    </div>
  )
}
