import { Link, createFileRoute } from '@tanstack/react-router'
import {
  Mic2Icon,
  MessageSquareHeartIcon,
  TrophyIcon,
  Users2Icon,
} from 'lucide-react'
import { AVAILABLE_MODELS, THEME_COPY } from '@shared/arena'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'

export const Route = createFileRoute('/')({ component: HomePage })

function HomePage() {
  return (
    <div className="page-frame space-y-8">
      <section className="hero-shell overflow-hidden px-6 py-8 md:px-10 md:py-12">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <div className="space-y-6">
            <Badge className="rounded-full bg-[var(--arena-signal)] px-4 py-1.5 text-white">
              Host + Critic agents included
            </Badge>
            <div className="space-y-4">
              <p className="eyebrow">Live editorial AI battles</p>
              <h1 className="display max-w-4xl text-balance">
                One prompt. Five major models. Real people voting alongside
                them.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
                AI Arena runs synchronized rounds where every selected model
                answers the same topic, judges its peers without self-voting,
                and competes in front of a live audience.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link to="/join">Join With Code</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/admin">Open Admin Console</Link>
              </Button>
            </div>
          </div>

          <Card className="arena-panel bg-card/88">
            <CardHeader>
              <CardTitle className="font-serif text-3xl">Round loop</CardTitle>
              <CardDescription>
                Topic lock, simultaneous responses, anonymous voting, critic
                analysis, then the next round.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              {[
                [
                  '1',
                  'Topic locks once',
                  'The first valid submission freezes the prompt.',
                ],
                [
                  '2',
                  'Models answer',
                  'Responses arrive in parallel with timeout handling.',
                ],
                [
                  '3',
                  'Crowd and AI vote',
                  'Humans and eligible models cast one ballot each.',
                ],
                [
                  '4',
                  'Host and Critic react',
                  'The MC transitions, the Critic explains the result.',
                ],
              ].map(([step, title, copy]) => (
                <div
                  key={step}
                  className="rounded-[1.2rem] border border-border/70 bg-background/60 p-4"
                >
                  <p className="eyebrow">{step}</p>
                  <p className="mt-2 font-medium text-foreground">{title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{copy}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-4">
        {[
          {
            title: 'Host / MC',
            copy: 'Introduces rounds, bridges results, and closes the session with a recap.',
            icon: Mic2Icon,
          },
          {
            title: 'Critic',
            copy: 'Explains why the winner worked and what the other models missed.',
            icon: MessageSquareHeartIcon,
          },
          {
            title: 'Realtime Crowd',
            copy: 'Guests join with a link or code and watch votes update live through Convex.',
            icon: Users2Icon,
          },
          {
            title: 'Fair Reveal',
            copy: 'Responses stay anonymous until the round closes and the winner is locked.',
            icon: TrophyIcon,
          },
        ].map((feature) => (
          <Card key={feature.title} className="arena-panel">
            <CardHeader>
              <feature.icon className="size-5 text-[var(--arena-cobalt)]" />
              <CardTitle className="font-serif text-2xl">
                {feature.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm leading-7 text-muted-foreground">
              {feature.copy}
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <Card className="arena-panel">
          <CardHeader>
            <CardTitle className="font-serif text-3xl">Battle roster</CardTitle>
            <CardDescription>
              The initial base ships with five providers and model snapshots
              saved at session creation time.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            {AVAILABLE_MODELS.map((model) => (
              <div
                key={model.key}
                className="rounded-[1.2rem] border border-border/70 bg-background/65 p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium text-foreground">{model.label}</p>
                  <span
                    className="size-3 rounded-full"
                    style={{ backgroundColor: model.accent }}
                  />
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {model.description}
                </p>
                <p className="mt-3 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  {model.tagline}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="arena-panel">
          <CardHeader>
            <CardTitle className="font-serif text-3xl">Theme presets</CardTitle>
            <CardDescription>
              Each preset tunes Host tone, Critic framing, and the quality bar
              for judging.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(THEME_COPY).map(([key, copy]) => (
              <div
                key={key}
                className="rounded-[1.2rem] border border-border/70 bg-background/65 p-4"
              >
                <p className="font-medium text-foreground">{copy.label}</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Host tone: {copy.hostTone}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Critic angle: {copy.criticAngle}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
