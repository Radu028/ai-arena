import { useQuery } from 'convex/react'
import { api } from '@convex/_generated/api'
import { AVAILABLE_MODELS } from '@shared/arena'
import { CallToAction } from './CallToAction'
import { FeatureSection } from './FeatureSection'
import { FlowSection } from './FlowSection'
import { Hero } from './Hero'
import { RosterSection } from './RosterSection'
import { ThemeSection } from './ThemeSection'

export function HomePage() {
  const stats = useQuery(api.stats.getModelLeaderboard, {})

  return (
    <div className="shell space-y-24 sm:space-y-28">
      <Hero
        completedSessions={stats?.sessionsIncluded ?? 0}
        modelsTracked={
          stats && stats.rows.length > 0
            ? stats.rows.length
            : AVAILABLE_MODELS.length
        }
      />

      <FlowSection />

      <FeatureSection />

      <RosterSection />

      <ThemeSection />

      <CallToAction />
    </div>
  )
}
