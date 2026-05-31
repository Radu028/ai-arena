import { AVAILABLE_MODELS } from '@shared/arena'
import { SectionHeading } from './SectionHeading'

export function RosterSection() {
  return (
    <section data-reveal className="space-y-12">
      <SectionHeading
        eyebrow="Battle roster"
        title="The frontier models on stage."
        description="Locked in when a session starts, so past battles stay reproducible."
      />

      <ul className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
        {AVAILABLE_MODELS.map((model) => (
          <li
            key={model.key}
            className="border-t border-border/60 pt-5"
            style={{ '--accent': model.accent } as React.CSSProperties}
          >
            <div className="flex items-center justify-between">
              <span
                className="size-2.5 rounded-full"
                style={{ backgroundColor: model.accent }}
                aria-hidden
              />
              <span className="font-mono text-[0.65rem] uppercase tracking-[0.16em] text-muted-foreground">
                {model.providerKey}
              </span>
            </div>
            <p className="mt-4 text-base font-semibold">{model.label}</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {model.description}
            </p>
            <p className="mt-4 text-[0.7rem] uppercase tracking-[0.16em] text-muted-foreground">
              {model.tagline}
            </p>
          </li>
        ))}
      </ul>
    </section>
  )
}
