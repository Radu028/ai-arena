import { StatusPill } from '#/components/ui/status-pill'

export function AdminSessionStatusPill({ status }: { status: string }) {
  return <StatusPill status={status} label={status} />
}
