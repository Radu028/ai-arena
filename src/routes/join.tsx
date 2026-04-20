import { useEffect, useReducer } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useMutation } from 'convex/react'
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

export const Route = createFileRoute('/join')({
  component: JoinPage,
})

function JoinPage() {
  const navigate = useNavigate()
  const joinByCode = useMutation(api.sessions.joinByCode)
  const [state, dispatch] = useReducer(
    (
      current: {
        code: string
        displayName: string
        email: string
        pending: boolean
        redirectSlug: string | null
      },
      action:
        | {
            type: 'setField'
            field: 'code' | 'displayName' | 'email'
            value: string
          }
        | { type: 'setPending'; value: boolean }
        | { type: 'setRedirectSlug'; value: string | null },
    ) => {
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
    if (!state.redirectSlug) {
      return
    }
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
    <div className="page-frame">
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <Card className="arena-panel">
          <CardHeader>
            <CardTitle className="font-serif text-4xl">
              Join the crowd
            </CardTitle>
            <CardDescription className="text-base leading-7">
              Enter the short join code, choose a display name, and drop
              directly into the live lobby or active round.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>Guests do not need a full account.</p>
            <p>
              Your vote persists across refreshes with a local session token.
            </p>
            <p>Model identities stay hidden until each round closes.</p>
          </CardContent>
        </Card>

        <Card className="arena-panel">
          <CardHeader>
            <CardTitle className="font-serif text-3xl">Join by code</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="code">Join code</Label>
                <Input
                  id="code"
                  value={state.code}
                  onChange={(event) =>
                    dispatch({
                      type: 'setField',
                      field: 'code',
                      value: event.target.value,
                    })
                  }
                  placeholder="A1B2C3"
                  className="uppercase"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="displayName">Display name (optional)</Label>
                <Input
                  id="displayName"
                  value={state.displayName}
                  onChange={(event) =>
                    dispatch({
                      type: 'setField',
                      field: 'displayName',
                      value: event.target.value,
                    })
                  }
                  placeholder="Radu or leave blank for an auto-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email (optional)</Label>
                <Input
                  id="email"
                  value={state.email}
                  onChange={(event) =>
                    dispatch({
                      type: 'setField',
                      field: 'email',
                      value: event.target.value,
                    })
                  }
                  placeholder="radu@example.com"
                />
              </div>
              <Button type="submit" size="lg" disabled={state.pending}>
                {state.pending ? 'Joining…' : 'Join Session'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
