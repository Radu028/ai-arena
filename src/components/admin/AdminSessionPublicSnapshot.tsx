import type { AdminPublicSessionView } from '#/components/admin/AdminSessionTypes'
import { AdminSnapshotStat } from '#/components/admin/AdminSnapshotStat'

export function AdminSessionPublicSnapshot({
  publicView,
}: {
  publicView: AdminPublicSessionView
}) {
  return (
    <section data-reveal className="space-y-5">
      <div>
        <p className="eyebrow">Public snapshot</p>
        <h2 className="mt-2 text-xl font-semibold tracking-tight sm:text-2xl">
          What spectators see
        </h2>
      </div>
      <div className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-3 sm:divide-x sm:divide-border/50">
        <AdminSnapshotStat
          label="Participants"
          value={`${publicView.session.participantCount} / ${publicView.session.maxParticipants}`}
        />
        <AdminSnapshotStat
          label="Current round"
          value={String(publicView.session.currentRoundNumber || 'Not started')}
        />
        <AdminSnapshotStat
          label="Topic"
          value={publicView.currentRound?.topic ?? '-'}
        />
      </div>
    </section>
  )
}
