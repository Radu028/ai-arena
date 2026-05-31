export function KpiStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-0 sm:px-5 sm:first:pl-0">
      <p className="text-[0.65rem] uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 font-mono text-base font-semibold tabular-nums">
        {value}
      </p>
    </div>
  )
}
