import { Link } from '@tanstack/react-router'
import {
  ArrowLeftIcon,
  EyeIcon,
  ExternalLinkIcon,
  PlayIcon,
  SkipForwardIcon,
  SquareIcon,
  TimerOffIcon,
} from 'lucide-react'
import type { AdminSession } from '#/components/admin/AdminSessionTypes'
import { AdminSessionDateStat } from '#/components/admin/AdminSessionDateStat'
import { AdminSessionStatusPill } from '#/components/admin/AdminSessionStatusPill'
import { SessionInviteCard } from '#/components/arena/SessionInviteCard'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { formatDateTime } from '#/lib/format'

export function AdminSessionHeader({
  session,
  onStart,
  onCloseVoting,
  onStartNextRound,
  onReveal,
  onStop,
}: {
  session: AdminSession
  onStart: () => Promise<void>
  onCloseVoting: () => Promise<void>
  onStartNextRound: () => Promise<void>
  onReveal: () => Promise<void>
  onStop: () => Promise<void>
}) {
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

      <header data-reveal className="space-y-5">
        <div className="flex flex-wrap items-center gap-2">
          <AdminSessionStatusPill status={session.status} />
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
          <AdminSessionDateStat
            label="Created"
            value={formatDateTime(session.createdAt)}
          />
          <AdminSessionDateStat
            label="Started"
            value={formatDateTime(session.startedAt)}
          />
          <AdminSessionDateStat
            label="Stopped"
            value={formatDateTime(session.stoppedAt)}
          />
          <AdminSessionDateStat
            label="Ended"
            value={formatDateTime(session.endedAt)}
          />
        </dl>

        {session.customPrompt ? (
          <blockquote className="border-l-2 border-primary/40 pl-4">
            <p className="eyebrow text-[0.65rem]">Arena prompt</p>
            <p className="mt-2 font-editorial text-base italic leading-7 text-foreground/85">
              &ldquo;{session.customPrompt}&rdquo;
            </p>
          </blockquote>
        ) : null}

        <div className="flex flex-wrap gap-2 pt-2">
          <Button onClick={onStart} disabled={session.status !== 'waiting'}>
            <PlayIcon className="size-4" />
            Start session
          </Button>
          <Button
            variant="outline"
            onClick={onCloseVoting}
            disabled={session.currentRoundStatus !== 'voting'}
          >
            <TimerOffIcon className="size-4" />
            Close round
          </Button>
          <Button
            variant="outline"
            onClick={onStartNextRound}
            disabled={!session.canStartNextRound}
          >
            <SkipForwardIcon className="size-4" />
            Start next round
          </Button>
          <Button
            variant="outline"
            onClick={onReveal}
            disabled={!session.hasUnrevealedScoredRound}
          >
            <EyeIcon className="size-4" />
            Reveal models
          </Button>
          <Button
            variant="destructive"
            onClick={onStop}
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
    </>
  )
}
