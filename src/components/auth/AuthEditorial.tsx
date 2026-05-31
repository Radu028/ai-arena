import { ShieldCheckIcon, SparklesIcon, ZapIcon } from 'lucide-react'
import { HeroFeature } from '#/components/auth/HeroFeature'

export function AuthEditorial() {
  return (
    <div data-reveal className="space-y-10">
      <div className="space-y-5">
        <p className="eyebrow">Admin sign-in</p>
        <h1 className="display text-balance text-4xl leading-[1.05] sm:text-5xl xl:text-6xl">
          <span className="gradient-text">One login.</span> Every arena.
        </h1>
        <p className="max-w-md text-pretty text-base leading-7 text-muted-foreground sm:text-lg">
          Sign in to host sessions, run rounds, and track how every model
          performs in real time.
        </p>
      </div>

      <ul className="space-y-7">
        <HeroFeature
          icon={SparklesIcon}
          title="One-tap Google sign-in"
          body="No passwords, no separate signup. Same button every time."
        />
        <HeroFeature
          icon={ShieldCheckIcon}
          title="Allow-listed access"
          body="Only approved emails can create or run arenas."
        />
        <HeroFeature
          icon={ZapIcon}
          title="Realtime by default"
          body="Votes, rounds, and costs update live."
        />
      </ul>
    </div>
  )
}
