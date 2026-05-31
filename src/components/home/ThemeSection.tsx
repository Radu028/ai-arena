import { THEME_COPY } from '@shared/arena'
import { SectionHeading } from './SectionHeading'

export function ThemeSection() {
  return (
    <section data-reveal className="space-y-12">
      <SectionHeading
        eyebrow="Theme presets"
        title="Tune the room with a single switch."
        description="Each preset reshapes how the host, critic, and judges treat every answer."
      />

      <ul className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
        {Object.entries(THEME_COPY).map(([key, copy]) => (
          <li key={key} className="border-t border-border/60 pt-5">
            <span className="font-mono text-[0.65rem] uppercase tracking-[0.16em] text-muted-foreground">
              {key}
            </span>
            <p className="mt-3 text-base font-semibold">{copy.label}</p>
            <dl className="mt-4 space-y-3 text-sm">
              <div>
                <dt className="text-[0.65rem] uppercase tracking-[0.16em] text-muted-foreground">
                  Host tone
                </dt>
                <dd className="mt-0.5 leading-6">{copy.hostTone}</dd>
              </div>
              <div>
                <dt className="text-[0.65rem] uppercase tracking-[0.16em] text-muted-foreground">
                  Critic angle
                </dt>
                <dd className="mt-0.5 leading-6">{copy.criticAngle}</dd>
              </div>
            </dl>
          </li>
        ))}
      </ul>
    </section>
  )
}
