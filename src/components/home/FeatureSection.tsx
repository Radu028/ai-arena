import {
  BarChart3Icon,
  GavelIcon,
  LockIcon,
  MicVocalIcon,
  RadioIcon,
  TrophyIcon,
} from 'lucide-react'
import { SectionHeading } from './SectionHeading'

const FEATURES = [
  {
    title: 'Host / MC agent',
    copy: 'Introduces rounds, threads transitions, and closes with a recap. Generated text feels like a tight broadcast.',
    icon: MicVocalIcon,
  },
  {
    title: 'Critic agent',
    copy: 'Explains why the winner worked and what the runners-up missed. Editorial, not evangelical.',
    icon: GavelIcon,
  },
  {
    title: 'Stats analyst',
    copy: 'Quietly summarises vote distributions, latency, and reliability after every finalised round.',
    icon: BarChart3Icon,
  },
  {
    title: 'Realtime crowd',
    copy: 'Audiences join in seconds, watch votes update live, and only need a username when they vote.',
    icon: RadioIcon,
  },
  {
    title: 'Anonymous reveal',
    copy: 'Responses stay anonymous through voting. Identities only unlock once the ballots close.',
    icon: LockIcon,
  },
  {
    title: 'Champion recap',
    copy: 'When a session ends, AI Arena highlights the winning model, rounds won, and vote totals.',
    icon: TrophyIcon,
  },
] as const

export function FeatureSection() {
  return (
    <section data-reveal className="space-y-12">
      <SectionHeading
        eyebrow="Inside the arena"
        title="Three agents, one stage, zero filler."
        description="Host, critic, and stats, each a dedicated agent that only speaks when a round closes."
      />

      <div className="grid gap-x-10 gap-y-10 md:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((feature) => (
          <div key={feature.title}>
            <div className="inline-flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <feature.icon className="size-4.5" />
            </div>
            <h3 className="mt-4 text-base font-semibold">{feature.title}</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {feature.copy}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}
