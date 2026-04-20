import { useReducer } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useMutation, useQuery } from 'convex/react'
import { toast } from 'sonner'
import { api } from '@convex/_generated/api'
import {
  joinSessionSchema,
  normalizeOptionalEmail,
  topicSchema,
} from '@shared/validation'
import {
  LiveSessionTab,
  SessionEventLogTab,
  SessionHistoryTab,
  SessionOverviewSection,
} from '#/components/arena/SessionPageSections'
import { useParticipantToken } from '#/hooks/use-participant-token'
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '#/components/ui/tabs'

export const Route = createFileRoute('/sessions/$slug')({
  component: SessionPage,
})

type SessionPageState = {
  displayName: string
  email: string
  topic: string
  pendingJoin: boolean
  pendingTopic: boolean
  pendingVoteId: string | null
}

type SessionPageAction =
  | {
      type: 'field'
      field: 'displayName' | 'email' | 'topic'
      value: string
    }
  | { type: 'pendingJoin'; value: boolean }
  | { type: 'pendingTopic'; value: boolean }
  | { type: 'pendingVoteId'; value: string | null }
  | { type: 'clearTopic' }

const INITIAL_STATE: SessionPageState = {
  displayName: '',
  email: '',
  topic: '',
  pendingJoin: false,
  pendingTopic: false,
  pendingVoteId: null,
}

function sessionPageReducer(
  current: SessionPageState,
  action: SessionPageAction,
): SessionPageState {
  switch (action.type) {
    case 'field':
      return {
        ...current,
        [action.field]: action.value,
      }
    case 'pendingJoin':
      return {
        ...current,
        pendingJoin: action.value,
      }
    case 'pendingTopic':
      return {
        ...current,
        pendingTopic: action.value,
      }
    case 'pendingVoteId':
      return {
        ...current,
        pendingVoteId: action.value,
      }
    case 'clearTopic':
      return {
        ...current,
        topic: '',
      }
  }
}

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
  const [state, dispatch] = useReducer(sessionPageReducer, INITIAL_STATE)

  async function handleJoin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const parsed = joinSessionSchema.safeParse({
      displayName: state.displayName,
      email: state.email,
    })
    if (!parsed.success) {
      toast.error(
        parsed.error.issues[0]?.message ?? 'Join details are invalid.',
      )
      return
    }

    dispatch({ type: 'pendingJoin', value: true })
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
      dispatch({ type: 'pendingJoin', value: false })
    }
  }

  async function handleTopicSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!participantToken) {
      toast.error('Join the session before submitting a topic.')
      return
    }
    const parsed = topicSchema.safeParse({ topic: state.topic })
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? 'Topic is invalid.')
      return
    }

    dispatch({ type: 'pendingTopic', value: true })
    try {
      await submitTopic({
        slug,
        participantToken,
        topic: parsed.data.topic,
      })
      dispatch({ type: 'clearTopic' })
      toast.success('Topic locked for the round.')
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Could not submit topic.',
      )
    } finally {
      dispatch({ type: 'pendingTopic', value: false })
    }
  }

  async function handleVote(responseId: string) {
    if (!participantToken) {
      toast.error('Join the session before voting.')
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

  return (
    <div className="page-frame space-y-6">
      <SessionOverviewSection
        sessionView={sessionView}
        state={state}
        onJoinSubmit={handleJoin}
        onFieldChange={(field, value) =>
          dispatch({ type: 'field', field, value })
        }
      />

      <Tabs defaultValue="live" className="space-y-4">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="live">Live</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="log">Arena Log</TabsTrigger>
        </TabsList>

        <TabsContent value="live" className="space-y-4">
          <LiveSessionTab
            sessionView={sessionView}
            liveRound={sessionView.currentRound}
            latestFinishedRound={sessionView.latestFinishedRound}
            state={state}
            onFieldChange={(field, value) =>
              dispatch({ type: 'field', field, value })
            }
            onTopicSubmit={handleTopicSubmit}
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
    </div>
  )
}
