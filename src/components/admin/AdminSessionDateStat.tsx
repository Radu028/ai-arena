export function AdminSessionDateStat({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="lg:px-6 lg:first:pl-0">
      <dt className="eyebrow">{label}</dt>
      <dd className="mt-1 font-mono text-sm tabular-nums text-foreground">
        {value}
      </dd>
    </div>
  )
}
