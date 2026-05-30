import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from '#/components/ui/empty'

export function AdminSessionUnavailable() {
  return (
    <Empty className="rounded-2xl border border-border/60 bg-card/40 p-10">
      <EmptyHeader>
        <EmptyTitle>Session unavailable</EmptyTitle>
        <EmptyDescription>
          This session either does not exist or belongs to a different admin
          identity.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  )
}
