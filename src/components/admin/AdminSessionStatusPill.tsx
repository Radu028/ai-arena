export function AdminSessionStatusPill({ status }: { status: string }) {
  const tone =
    status === 'active'
      ? 'bg-emerald-500/12 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300'
      : status === 'ended'
        ? 'bg-primary/12 text-primary dark:bg-primary/20'
        : status === 'stopped'
          ? 'bg-red-500/12 text-red-700 dark:bg-red-400/15 dark:text-red-300'
          : 'bg-muted text-muted-foreground'

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${tone}`}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {status}
    </span>
  )
}
