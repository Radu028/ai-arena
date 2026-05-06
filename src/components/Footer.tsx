import { Badge } from '#/components/ui/badge'

export default function Footer() {
  return (
    <footer className="border-t border-border/70 bg-card/40 px-4 py-10">
      <div className="page-frame flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-serif text-xl text-foreground">AI Arena</p>
          <p className="max-w-xl text-sm text-muted-foreground">
            TanStack Start, Convex, Clerk, shadcn/ui, Tailwind v4, Vite, and a
            two-agent live battle format built for fast iteration.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">Host Agent</Badge>
          <Badge variant="outline">Critic Agent</Badge>
          <Badge variant="outline">Realtime Voting</Badge>
          <Badge variant="outline">Anonymous Cards</Badge>
        </div>
      </div>
    </footer>
  )
}
