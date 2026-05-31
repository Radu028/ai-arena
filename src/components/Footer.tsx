import { Link } from '@tanstack/react-router'
import { ArenaLogo } from './ArenaLogo'
import { AdminOnly } from './AdminOnly'

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-border/60">
      <div className="shell flex flex-col items-start gap-8 py-10 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <ArenaLogo size={32} />
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold tracking-tight">
              AI Arena
            </span>
            <span
              suppressHydrationWarning
              className="text-[0.7rem] text-muted-foreground"
            >
              Live model battles · {new Date().getFullYear()}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-12 gap-y-3 text-[0.825rem] sm:grid-cols-3">
          <FooterCol title="Product">
            <FooterLink to="/">Home</FooterLink>
            <FooterLink to="/join">Join</FooterLink>
            <FooterLink to="/leaderboard">Leaderboard</FooterLink>
          </FooterCol>
          <FooterCol title="Stage">
            <FooterLink to="/history">History</FooterLink>
            <AdminOnly>
              <FooterLink to="/admin">Admin</FooterLink>
            </AdminOnly>
          </FooterCol>
          <FooterCol title="Built with">
            <span className="text-muted-foreground">TanStack Start</span>
            <span className="text-muted-foreground">Convex · Clerk</span>
            <span className="text-muted-foreground">
              shadcn/ui · Tailwind 4
            </span>
          </FooterCol>
        </div>
      </div>
    </footer>
  )
}

function FooterCol({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-2">
      <p className="eyebrow text-[0.625rem]">{title}</p>
      {children}
    </div>
  )
}

function FooterLink({
  to,
  children,
}: {
  to: '/' | '/join' | '/leaderboard' | '/history' | '/admin'
  children: React.ReactNode
}) {
  return (
    <Link
      to={to}
      className="rounded-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
    >
      {children}
    </Link>
  )
}
