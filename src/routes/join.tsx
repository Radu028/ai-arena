import { useEffect, useReducer } from 'react'
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { useMutation } from 'convex/react'
import {
  ArrowRightIcon,
  EyeIcon,
  KeyRoundIcon,
  RadioIcon,
  UserRoundIcon,
} from 'lucide-react'
import { toast } from 'sonner'
import { api } from '@convex/_generated/api'
import { joinCodeSchema, normalizeOptionalEmail } from '@shared/validation'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'

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
          you want to vote; your ballot persists across refreshes.
        </p>
      </section>

      <section
        data-reveal
        className="mx-auto grid w-full max-w-5xl gap-12 lg:grid-cols-[1.15fr_1fr] lg:gap-16"
      >
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <p className="eyebrow">Join code</p>
            <Label htmlFor="code" className="sr-only">
              Join code
            </Label>
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
              className="mt-3 h-14 font-mono text-2xl tracking-[0.4em] uppercase placeholder:tracking-normal placeholder:text-muted-foreground/50"
              maxLength={8}
              autoComplete="off"
              spellCheck={false}
            />
            <p className="mt-2 text-xs text-muted-foreground">
              Six characters, case-insensitive. Shared by the admin running the
              session.
            </p>
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
                Email <span className="text-muted-foreground">(optional)</span>
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

          <div className="flex flex-wrap items-center gap-4">
            <Button
              type="submit"
              size="lg"
              disabled={state.pending}
              className="h-11 rounded-full px-6"
            >
              {state.pending ? 'Joining...' : 'Join session'}
              <ArrowRightIcon className="size-4" />
            </Button>
            <p className="text-sm text-muted-foreground">
              Got a share link?{' '}
              <Link
                to="/"
                className="font-medium text-foreground underline-offset-4 hover:underline"
              >
                Open it directly
              </Link>{' '}
              , no code needed.
            </p>
          </div>
        </form>

        <ul className="grid gap-7 self-start sm:grid-cols-2 lg:grid-cols-1">
          <InfoItem
            icon={EyeIcon}
            title="Spectator-first"
            copy="Watch every round in realtime without an account. The admin closes voting and reveals the models when the room is ready."
          />
          <InfoItem
            icon={UserRoundIcon}
            title="Username only when voting"
            copy="Cast your ballot, then choose a name. We never ask for more than that to take part."
          />
          <InfoItem
            icon={KeyRoundIcon}
            title="Persistent ballot"
            copy="Refreshing or returning later keeps your vote — we anchor it with a local session token."
          />
          <InfoItem
            icon={RadioIcon}
            title="Live everything"
            copy="Vote splits, round changes, and reveals all stream over Convex without any polling."
          />
        </ul>
      </section>
    </div>
  )
}

function InfoItem({
  icon: Icon,
  title,
  copy,
}: {
  icon: React.ComponentType<{ className?: string }>
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
