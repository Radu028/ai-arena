import { useEffect, useReducer } from 'react'
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { useMutation } from 'convex/react'
import {
  ArrowRightIcon,
  EyeIcon,
  KeyRoundIcon,
  RadioIcon,
  TicketIcon,
  UserRoundIcon,
} from 'lucide-react'
import { toast } from 'sonner'
import { api } from '@convex/_generated/api'
import { joinCodeSchema, normalizeOptionalEmail } from '@shared/validation'
import { Button } from '#/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { Separator } from '#/components/ui/separator'

export const Route = createFileRoute('/join')({
  component: JoinPage,
})

type State = {
  code: string
  displayName: string
  email: string
  pending: boolean
  redirectSlug: string | null
}

type Action =
  | { type: 'setField'; field: 'code' | 'displayName' | 'email'; value: string }
  | { type: 'setPending'; value: boolean }
  | { type: 'setRedirectSlug'; value: string | null }

function JoinPage() {
  const navigate = useNavigate()
  const joinByCode = useMutation(api.sessions.joinByCode)
  const [state, dispatch] = useReducer(
    (current: State, action: Action) => {
      switch (action.type) {
        case 'setField':
          return { ...current, [action.field]: action.value }
        case 'setPending':
          return { ...current, pending: action.value }
        case 'setRedirectSlug':
          return { ...current, redirectSlug: action.value }
      }
    },
    {
      code: '',
      displayName: '',
      email: '',
      pending: false,
      redirectSlug: null,
    },
  )

  useEffect(() => {
    if (!state.redirectSlug) return
    void navigate({
      to: '/sessions/$slug',
      params: { slug: state.redirectSlug },
    })
  }, [navigate, state.redirectSlug])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const parsed = joinCodeSchema.safeParse({
      code: state.code,
      displayName: state.displayName,
      email: state.email,
    })
    if (!parsed.success) {
      toast.error(
        parsed.error.issues[0]?.message ?? 'Join details are invalid.',
      )
      return
    }

    dispatch({ type: 'setPending', value: true })
    try {
      const result = await joinByCode({
        code: parsed.data.code.trim().toUpperCase(),
        displayName: parsed.data.displayName,
        email: normalizeOptionalEmail(parsed.data.email),
      })
      window.localStorage.setItem(
        `ai-arena.participant.${result.slug}`,
        result.accessToken,
      )
      toast.success('Joined session.')
      dispatch({ type: 'setRedirectSlug', value: result.slug })
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Could not join that session.',
      )
    } finally {
      dispatch({ type: 'setPending', value: false })
    }
  }

  return (
    <div className="shell space-y-12">
      <section data-reveal className="mx-auto max-w-3xl text-center">
        <p className="eyebrow">Enter the arena</p>
        <h1 className="display mt-3 text-balance">
          Join with a <span className="gradient-text">six-letter code.</span>
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-pretty text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
          Drop in as a spectator instantly. A username is only requested when
          you want to vote — your ballot persists across refreshes.
        </p>
      </section>

      <section
        data-reveal
        className="mx-auto grid w-full max-w-5xl gap-6 lg:grid-cols-[1.15fr_1fr]"
      >
        <Card className="surface p-0">
          <CardHeader className="px-6 pt-6">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <TicketIcon className="size-5" />
            </div>
            <CardTitle className="mt-4 text-xl font-semibold">
              Enter join code
            </CardTitle>
            <CardDescription>
              Codes are six characters and case-insensitive. They&rsquo;re
              issued by the admin running the session.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="code">Join code</Label>
                <Input
                  id="code"
                  value={state.code}
                  onChange={(e) =>
                    dispatch({
                      type: 'setField',
                      field: 'code',
                      value: e.target.value,
                    })
                  }
                  placeholder="A1B2C3"
                  className="h-11 font-mono text-base tracking-[0.4em] uppercase placeholder:tracking-normal placeholder:text-muted-foreground/50"
                  maxLength={8}
                  autoComplete="off"
                  spellCheck={false}
                />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="displayName">
                    Display name{' '}
                    <span className="text-muted-foreground">(optional)</span>
                  </Label>
                  <Input
                    id="displayName"
                    value={state.displayName}
                    onChange={(e) =>
                      dispatch({
                        type: 'setField',
                        field: 'displayName',
                        value: e.target.value,
                      })
                    }
                    className="h-11"
                    placeholder="Auto-generated if empty"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">
                    Email{' '}
                    <span className="text-muted-foreground">(optional)</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={state.email}
                    onChange={(e) =>
                      dispatch({
                        type: 'setField',
                        field: 'email',
                        value: e.target.value,
                      })
                    }
                    className="h-11"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <Button
                type="submit"
                size="lg"
                disabled={state.pending}
                className="h-11 w-full rounded-lg sm:w-auto"
              >
                {state.pending ? 'Joining...' : 'Join session'}
                <ArrowRightIcon className="size-4" />
              </Button>
            </form>

            <Separator className="my-6 opacity-60" />

            <p className="text-sm text-muted-foreground">
              Got a share link instead?{' '}
              <Link
                to="/"
                className="font-medium text-foreground underline-offset-4 hover:underline"
              >
                Open it directly
              </Link>{' '}
              — no code needed.
            </p>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-3">
          <InfoTile
            icon={EyeIcon}
            title="Spectator-first"
            copy="Watch every round in realtime without an account. Reveal happens automatically when voting closes."
          />
          <InfoTile
            icon={UserRoundIcon}
            title="Username only when voting"
            copy="Cast your ballot, then choose a name. We never ask for more than that to take part."
          />
          <InfoTile
            icon={KeyRoundIcon}
            title="Persistent ballot"
            copy="Refreshing or returning later keeps your vote — we anchor it with a local session token."
          />
          <InfoTile
            icon={RadioIcon}
            title="Live everything"
            copy="Topic submissions, vote splits, and reveals all stream over Convex without any polling."
          />
        </div>
      </section>
    </div>
  )
}

function InfoTile({
  icon: Icon,
  title,
  copy,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  copy: string
}) {
  return (
    <div className="surface flex gap-3 rounded-xl p-4">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground">
        <Icon className="size-4" />
      </div>
      <div>
        <p className="text-sm font-semibold">{title}</p>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">{copy}</p>
      </div>
    </div>
  )
}
