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

      <ul className="grid gap-x-8 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
        {Object.values(THEME_COPY).map((copy) => (
          <li key={copy.label} className="border-t border-border/60 pt-5">
            <p className="text-base font-semibold">{copy.label}</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Judged on {copy.criticAngle}.
            </p>
          </li>
        ))}
      </ul>
    </section>
  )
}
