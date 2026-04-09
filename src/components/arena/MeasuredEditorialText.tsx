import { cn } from '#/lib/utils'
import { usePretextBlock } from '#/lib/pretext'

export function MeasuredEditorialText({
  text,
  className,
  fallback = 'No copy available yet.',
}: {
  text: string | null
  className?: string
  fallback?: string
}) {
  const { ref, metrics } = usePretextBlock(
    text,
    '600 18px "Source Serif 4"',
    28,
  )

  return (
    <div
      ref={ref}
      className={cn(
        'rounded-[1.4rem] border border-border/70 bg-card px-5 py-4',
        className,
      )}
      style={
        metrics?.height
          ? {
              minHeight: `${metrics.height + 32}px`,
            }
          : undefined
      }
    >
      <p className="font-serif text-[1.05rem] leading-7 text-foreground">
        {text ?? fallback}
      </p>
      {metrics ? (
        <p className="mt-3 text-[0.7rem] uppercase tracking-[0.22em] text-muted-foreground">
          {metrics.lineCount} measured line{metrics.lineCount === 1 ? '' : 's'}
        </p>
      ) : null}
    </div>
  )
}
