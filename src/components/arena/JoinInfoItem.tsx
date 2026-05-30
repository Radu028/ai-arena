import type { ComponentType } from 'react'

export function JoinInfoItem({
  icon: Icon,
  title,
  copy,
}: {
  icon: ComponentType<{ className?: string }>
  title: string
  copy: string
}) {
  return (
    <li className="flex gap-3">
      <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="size-4" />
      </div>
      <div>
        <p className="text-sm font-semibold">{title}</p>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">{copy}</p>
      </div>
    </li>
  )
}
