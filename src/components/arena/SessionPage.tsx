import { useReducer, useRef, useState } from 'react'
import { Link, useParams } from '@tanstack/react-router'
import { useMutation, useQuery } from 'convex/react'
import { CrownIcon, GavelIcon, RadioIcon, ScrollTextIcon } from 'lucide-react'
import { toast } from 'sonner'
import { api } from '@convex/_generated/api'
import { joinSessionSchema } from '@shared/validation'
import {
  LiveSessionTab,
  SessionEventLogTab,
  SessionHistoryTab,
  SessionOverviewSection,
} from '#/components/arena/SessionPageSections'
import { useParticipantToken } from '#/hooks/use-participant-token'
import { Button } from '#/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '#/components/ui/dialog'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '#/components/ui/empty'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '#/components/ui/tabs'

type SessionPageState = {
  displayName: string
  pendingJoin: boolean
  pendingVoteId: string | null
}

type SessionPageAction =
  | { type: 'field'; field: 'displayName'; value: string }
  | { type: 'pendingJoin'; value: boolean }
  | { type: 'pendingVoteId'; value: string | null }

const INITIAL_STATE: SessionPageState = {
  displayName: '',
  pendingJoin: false,
  pendingVoteId: null,
}

function sessionPageReducer(
  current: SessionPageState,
  action: SessionPageAction,
): SessionPageState {
  switch (action.type) {
    case 'field':
      return { ...current, [action.field]: action.value }
    case 'pendingJoin':
      return { ...current, pendingJoin: action.value }
    case 'pendingVoteId':
      return { ...current, pendingVoteId: action.value }
  }
}

export function SessionPage() {
  const { slug } = useParams({ from: '/sessions/$slug' })
  const [participantToken, setParticipantToken] = useParticipantToken(slug)
  const sessionView = useQuery(api.sessions.getPublicSessionView, {
    slug,
    participantToken,
  })
  const joinSession = useMutation(api.sessions.joinBySlug)
  const castVote = useMutation(api.votes.castHumanVote)
  const [state, dispatch] = useReducer(sessionPageReducer, INITIAL_STATE)
  const [joinDialogOpen, setJoinDialogOpen] = useState(false)
  const voteAfterJoinIdRef = useRef<string | null>(null)

  async function handleVote(responseId: string) {
    if (!participantToken || !sessionView?.viewer) {
      voteAfterJoinIdRef.current = responseId
      setJoinDialogOpen(true)
      return
    }
    dispatch({ type: 'pendingVoteId', value: responseId })
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
      dispatch({ type: 'pendingVoteId', value: null })
    }
  }

  async function handleJoinToVote(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const displayName = state.displayName.trim()
    if (!displayName) {
      toast.error('Choose a username before voting.')
      return
    }
    const parsed = joinSessionSchema.safeParse({
      displayName,
      email: '',
    })
    if (!parsed.success) {
      toast.error(
        parsed.error.issues[0]?.message ?? 'Join details are invalid.',
      )
      return
    }

    dispatch({ type: 'pendingJoin', value: true })
    const voteAfterJoinId = voteAfterJoinIdRef.current
    if (voteAfterJoinId) {
      dispatch({ type: 'pendingVoteId', value: voteAfterJoinId })
    }
    try {
      const result = await joinSession({
        slug,
        displayName: parsed.data.displayName,
        email: null,
        existingToken: participantToken,
      })
      setParticipantToken(result.accessToken)

      if (voteAfterJoinId) {
        const voteResult = await castVote({
          slug,
          participantToken: result.accessToken,
          responseId: voteAfterJoinId as never,
        })
        toast.success(
          voteResult.accepted
            ? 'Username saved and vote locked in.'
            : 'Username saved. Your vote was already counted.',
        )
      } else {
        toast.success('Username saved.')
      }
      voteAfterJoinIdRef.current = null
      setJoinDialogOpen(false)
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Could not join and vote right now.',
      )
    } finally {
      dispatch({ type: 'pendingJoin', value: false })
      dispatch({ type: 'pendingVoteId', value: null })
    }
  }

  if (sessionView === undefined) {
    return (
      <div className="shell">
        <Empty className="rounded-2xl border border-dashed border-border/50 p-10">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <RadioIcon />
            </EmptyMedia>
            <EmptyTitle>Opening session&hellip;</EmptyTitle>
            <EmptyDescription>
              Loading the live room and preparing your spectator seat.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    )
  }

  if (sessionView === null) {
    return (
      <div className="shell">
        <Empty className="rounded-2xl border border-dashed border-border/50 p-10">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <GavelIcon />
            </EmptyMedia>
            <EmptyTitle>Session not found</EmptyTitle>
            <EmptyDescription>
              This share link doesn&rsquo;t match an active AI Arena session.
              Check the join code and try again.
            </EmptyDescription>
          </EmptyHeader>
          <div className="flex flex-wrap justify-center gap-2">
            <Button asChild>
              <Link to="/join">Join with code</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/">Back home</Link>
            </Button>
          </div>
        </Empty>
      </div>
    )
  }

  const sessionEnded =
    sessionView.session.status === 'ended' ||
    sessionView.session.status === 'stopped'
  const winner = sessionEnded ? sessionView.scoreboard.at(0) : undefined
  const winnerVoteLabel = winner
    ? `${winner.totalVotes} ${winner.totalVotes === 1 ? 'vote' : 'votes'}`
    : null

  return (
    <div className="shell space-y-10">
      {winner ? (
        <section
          data-reveal
          className="relative isolate overflow-hidden rounded-3xl border border-amber-500/20 px-6 py-10 sm:px-10 sm:py-14"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_-20%,color-mix(in_oklab,var(--arena-amber),transparent_60%),transparent_45%),radial-gradient(circle_at_90%_120%,color-mix(in_oklab,var(--arena-violet),transparent_70%),transparent_45%)]"
          />
          <div className="relative max-w-4xl space-y-5">
            <div className="space-y-4">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-300">
                <CrownIcon className="size-3" />
                Session champion
              </span>
              <h2 className="display text-balance text-3xl sm:text-5xl">
                {winner.label}{' '}
                <span className="gradient-text">takes the crown.</span>
              </h2>
              <p className="text-pretty text-base leading-7 text-muted-foreground sm:text-lg">
                {winner.wins} round{winner.wins !== 1 ? 's' : ''} won out of{' '}
                {winner.roundsPlayed} - {winnerVoteLabel} for the winner.
              </p>
            </div>
          </div>
        </section>
      ) : null}

      <SessionOverviewSection sessionView={sessionView} />

      <Tabs defaultValue="live" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 sm:w-auto">
          <TabsTrigger value="live">
            <RadioIcon className="size-3.5" />
            Live
          </TabsTrigger>
          <TabsTrigger value="history">
            <ScrollTextIcon className="size-3.5" />
            History
          </TabsTrigger>
          <TabsTrigger value="log">
            <GavelIcon className="size-3.5" />
            Log
          </TabsTrigger>
        </TabsList>

        <TabsContent value="live" className="space-y-4">
          <LiveSessionTab
            sessionView={sessionView}
            liveRound={sessionView.currentRound}
            latestFinishedRound={sessionView.latestFinishedRound}
            state={state}
            onVote={handleVote}
          />
        </TabsContent>

        <TabsContent value="history">
          <SessionHistoryTab rounds={sessionView.rounds} />
        </TabsContent>

        <TabsContent value="log">
          <SessionEventLogTab events={sessionView.events} />
        </TabsContent>
      </Tabs>

      <Dialog
        open={joinDialogOpen}
        onOpenChange={(open) => {
          setJoinDialogOpen(open)
          if (!open) {
            voteAfterJoinIdRef.current = null
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Choose a username to vote</DialogTitle>
            <DialogDescription>
              Spectators don&rsquo;t need an account. A username is only
              required when you cast a vote.
            </DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleJoinToVote}>
            <div className="space-y-2">
              <Label htmlFor="voteDisplayName">Username</Label>
              <Input
                id="voteDisplayName"
                value={state.displayName}
                onChange={(event) =>
                  dispatch({
                    type: 'field',
                    field: 'displayName',
                    value: event.target.value,
                  })
                }
                placeholder="e.g. radu"
                autoComplete="off"
              />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={state.pendingJoin}>
                {state.pendingJoin ? 'Saving...' : 'Save username and vote'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
