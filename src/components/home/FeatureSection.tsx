import { BarChart3Icon, GavelIcon, MicVocalIcon } from 'lucide-react'
import { SectionHeading } from './SectionHeading'

const FEATURES = [
  {
    title: 'Host',
    copy: 'Opens each round, threads the transitions, and closes the session with a recap.',
    icon: MicVocalIcon,
  },
  {
    title: 'Critic',
    copy: 'Explains why the winning answer landed and what the runners-up missed.',
    icon: GavelIcon,
  },
  {
    title: 'Stats analyst',
    copy: 'Recaps the vote split, response latency, and reliability after every round.',
    icon: BarChart3Icon,
  },
] as const

export function FeatureSection() {
  return (
    <section data-reveal className="space-y-12">
      <SectionHeading
        eyebrow="Inside the arena"
        title="Three agents run every round."
        description="A host, a critic, and a stats analyst — each speaks only when a round closes."
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
