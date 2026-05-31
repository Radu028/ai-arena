import { SectionHeading } from './SectionHeading'

const FLOW_STEPS = [
  {
    step: '01',
    title: 'Topic locks once',
    copy: 'The first valid prompt freezes the round. No more edits; every model sees the same brief.',
  },
  {
    step: '02',
    title: 'Models answer in parallel',
    copy: 'Every model answers at once. A slow or failing provider is skipped so the round never stalls.',
  },
  {
    step: '03',
    title: 'Crowd & AI judges vote',
    copy: 'Humans and eligible models cast one ballot each. No model can vote for itself.',
  },
  {
    step: '04',
    title: 'Agents react, host bridges',
    copy: 'The critic explains the win, the stats agent recaps the numbers, the host sets up the next round.',
  },
] as const

export function FlowSection() {
  return (
    <section data-reveal className="space-y-12">
      <SectionHeading
        eyebrow="Round loop"
        title="Built for live arenas, not benchmarks."
        description="The same four steps every round. Answers stay anonymous until the reveal."
      />

      <ol className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
        {FLOW_STEPS.map((step) => (
          <li key={step.step} className="border-t border-border/60 pt-5">
            <span className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-muted-foreground">
              Step {step.step}
            </span>
            <h3 className="mt-2.5 text-base font-semibold">{step.title}</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {step.copy}
            </p>
          </li>
        ))}
      </ol>
    </section>
  )
}
