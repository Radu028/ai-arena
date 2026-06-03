import { Spinner } from '#/components/ui/spinner'

export function RoutePending() {
  return (
    <div className="shell py-10">
      <div className="surface flex items-center gap-3 rounded-2xl p-6 text-sm text-muted-foreground">
        <Spinner className="size-4" />
        Loading page&hellip;
      </div>
    </div>
  )
}
