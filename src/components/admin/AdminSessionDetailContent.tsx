import { useParams } from '@tanstack/react-router'
import { useMutation, useQuery } from 'convex/react'
import { toast } from 'sonner'
import type { Id } from '@convex/_generated/dataModel'
import { api } from '@convex/_generated/api'
import { AdminSessionHeader } from '#/components/admin/AdminSessionHeader'
import { AdminSessionPublicSnapshot } from '#/components/admin/AdminSessionPublicSnapshot'
import { AdminSessionRoster } from '#/components/admin/AdminSessionRoster'
import { AdminSessionScoreboard } from '#/components/admin/AdminSessionScoreboard'
import { AdminSessionUnavailable } from '#/components/admin/AdminSessionUnavailable'

export function AdminSessionDetailContent() {
  const { sessionId } = useParams({ from: '/admin/sessions/$sessionId' })
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

  if (!session) {
    return <AdminSessionUnavailable />
  }

  return (
    <>
      <AdminSessionHeader
        session={session}
        onStart={handleStart}
        onCloseVoting={handleEndVoting}
        onStartNextRound={handleStartNextRound}
        onReveal={handleReveal}
        onStop={handleStop}
      />

      <section
        data-reveal
        className="grid gap-12 lg:grid-cols-[1fr_0.85fr] lg:gap-16"
      >
        <AdminSessionScoreboard scoreboard={session.scoreboard} />
        <AdminSessionRoster models={session.selectedModels} />
      </section>

      {publicView ? (
        <AdminSessionPublicSnapshot publicView={publicView} />
      ) : null}
    </>
  )
}
