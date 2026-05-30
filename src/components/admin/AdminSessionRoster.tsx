import type { AdminSession } from '#/components/admin/AdminSessionTypes'

export function AdminSessionRoster({
  models,
}: {
  models: AdminSession['selectedModels']
}) {
  return (
    <div className="space-y-5">
      <div>
        <p className="eyebrow">Lineup</p>
        <h2 className="mt-2 text-xl font-semibold tracking-tight sm:text-2xl">
          Battle roster
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Snapshot taken when the session was created.
        </p>
      </div>
      <ul className="space-y-3">
        {models.map((model) => (
          <li
            key={model.key}
            className="flex items-start gap-3 border-b border-border/40 pb-3 last:border-b-0 last:pb-0"
          >
            <span
              aria-hidden
              className="mt-1.5 size-2 shrink-0 rounded-full"
              style={{ backgroundColor: model.accent }}
            />
            <div>
              <p className="text-sm font-medium">{model.label}</p>
              <p className="text-xs leading-5 text-muted-foreground">
                {model.description}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
