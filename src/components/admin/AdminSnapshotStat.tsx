export function AdminSnapshotStat({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="sm:px-6 sm:first:pl-0">
      <p className="eyebrow">{label}</p>
      <p className="mt-1 truncate text-sm font-medium">{value}</p>
    </div>
  )
}
