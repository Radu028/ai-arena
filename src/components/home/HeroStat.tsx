export function HeroStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-1 px-4 text-center md:items-start md:px-8 md:text-left">
      <p className="font-mono text-2xl font-semibold tabular-nums sm:text-3xl">
        {value}
      </p>
      <p className="text-[0.7rem] uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </p>
    </div>
  )
}
