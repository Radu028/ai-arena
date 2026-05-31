import { Link } from '@tanstack/react-router'
import { ArrowRightIcon, ZapIcon } from 'lucide-react'
import { AVAILABLE_MODELS } from '@shared/arena'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { HeroStat } from './HeroStat'

export function Hero({
  completedSessions,
  modelsTracked,
}: {
  completedSessions: number
  modelsTracked: number
}) {
  return (
    <section data-reveal className="relative isolate pt-6 sm:pt-12">
      <div className="mx-auto max-w-4xl text-center">
        <Badge
          variant="outline"
          className="h-7 rounded-full border-border/70 bg-background/60 px-3 text-[0.7rem] font-medium tracking-wide backdrop-blur"
        >
          <span className="live-dot mr-1" />
          Live · {AVAILABLE_MODELS.length} models on stage
        </Badge>

        <h1 className="display mt-6 text-balance">
          One prompt. Every model.{' '}
          <span className="gradient-text">A live champion.</span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-pretty text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
          The top AI models answer the same prompt, judge each other, and the
          crowd votes for the winner, all live.
        </p>

        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <Button asChild size="lg" className="h-11 rounded-full px-6">
            <Link to="/join">
              <ZapIcon className="size-4" />
              Join with code
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="h-11 rounded-full px-6"
          >
            <Link to="/leaderboard">
              See the leaderboard
              <ArrowRightIcon className="size-4" />
            </Link>
          </Button>
        </div>
      </div>

      <div className="mx-auto mt-16 grid max-w-2xl grid-cols-3 gap-y-6 sm:mt-20 md:divide-x md:divide-border/50">
        <HeroStat label="models" value={String(modelsTracked)} />
        <HeroStat label="AI agents" value="3" />
        {completedSessions > 0 ? (
          <HeroStat label="sessions run" value={String(completedSessions)} />
        ) : (
          <HeroStat label="theme presets" value="4" />
        )}
      </div>
    </section>
  )
}
