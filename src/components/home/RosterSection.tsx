import { AVAILABLE_MODELS } from '@shared/arena'
import { SectionHeading } from './SectionHeading'

export function RosterSection() {
  return (
    <section data-reveal className="space-y-12">
      <SectionHeading
        eyebrow="Battle roster"
        title="The models on stage."
        description="Locked in when a session starts, so every past battle stays reproducible."
      />

      <ul className="grid gap-x-10 sm:grid-cols-2 lg:grid-cols-3">
        {AVAILABLE_MODELS.map((model) => (
          <li
            key={model.key}
            className="flex items-center gap-3 border-t border-border/60 py-3.5"
          >
            <span
              className="size-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: model.accent }}
              aria-hidden
            />
            <span className="text-sm font-medium">{model.label}</span>
            <span className="ml-auto font-mono text-[0.65rem] uppercase tracking-[0.16em] text-muted-foreground">
              {model.providerKey}
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}
