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
        'relative pl-5 sm:pl-6',
        'before:absolute before:inset-y-0.5 before:left-0 before:w-[3px] before:rounded-full',
        accentClass,
        className,
      )}
      style={
        metrics?.height ? { minHeight: `${metrics.height + 8}px` } : undefined
      }
    >
      {label ? (
        <figcaption className="eyebrow mb-1.5">{label}</figcaption>
      ) : null}
      <p className="font-editorial text-[1.02rem] leading-7 text-foreground/90">
        {text ?? fallback}
      </p>
    </figure>
  )
}
