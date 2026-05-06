import { cn } from '#/lib/utils'
import { usePretextBlock } from '#/lib/pretext'

export function MeasuredEditorialText({
  text,
  className,
  fallback = 'No copy available yet.',
  label,
  accent = 'primary',
}: {
  text: string | null
  className?: string
  fallback?: string
  /** Optional eyebrow that prefixes the block (e.g. "Critic" / "Stats"). */
  label?: string
  accent?: 'primary' | 'amber' | 'cyan'
}) {
  const { ref, metrics } = usePretextBlock(
    text,
    '500 17px "Source Serif 4"',
    27,
  )

  const accentClass =
    accent === 'amber'
      ? 'before:bg-amber-400/70'
      : accent === 'cyan'
        ? 'before:bg-cyan-400/70'
        : 'before:bg-primary/70'

  return (
    <figure
      ref={ref}
      className={cn(
        'relative rounded-2xl border border-border/60 bg-card/90 px-5 py-4 sm:px-6 sm:py-5',
        'before:absolute before:inset-y-4 before:left-0 before:w-[2px] before:rounded-full',
        accentClass,
        className,
      )}
      style={
        metrics?.height ? { minHeight: `${metrics.height + 36}px` } : undefined
      }
    >
      {label ? <figcaption className="eyebrow mb-2">{label}</figcaption> : null}
      <p className="font-editorial text-[1.02rem] leading-7 text-foreground">
        {text ?? fallback}
      </p>
    </figure>
  )
}
