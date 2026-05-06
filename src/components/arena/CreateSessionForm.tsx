import { useEffect, useReducer } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useMutation } from 'convex/react'
import { CheckIcon, RocketIcon } from 'lucide-react'
import { toast } from 'sonner'
import { api } from '@convex/_generated/api'
import {
  AVAILABLE_MODELS,
  MAX_ROUNDS,
  MIN_ROUNDS,
  THEME_COPY,
} from '@shared/arena'
import { createSessionSchema } from '@shared/validation'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import { Separator } from '#/components/ui/separator'
import { cn } from '#/lib/utils'

type State = {
  title: string
  theme: keyof typeof THEME_COPY
  roundCount: number
  maxParticipants: number
  selectedModels: string[]
  pending: boolean
  redirectSessionId: string | null
}

type Action =
  | {
      type: 'field'
      field: 'title' | 'theme' | 'roundCount' | 'maxParticipants'
      value: string | number
    }
  | { type: 'toggleModel'; modelKey: string }
  | { type: 'pending'; value: boolean }
  | { type: 'redirect'; sessionId: string | null }

export function CreateSessionForm() {
  const navigate = useNavigate()
  const createSession = useMutation(api.sessions.create)
  const [state, dispatch] = useReducer(
    (current: State, action: Action) => {
      switch (action.type) {
        case 'field':
          return { ...current, [action.field]: action.value }
        case 'toggleModel':
          return {
            ...current,
            selectedModels: current.selectedModels.includes(action.modelKey)
              ? current.selectedModels.filter((k) => k !== action.modelKey)
              : [...current.selectedModels, action.modelKey],
          }
        case 'pending':
          return { ...current, pending: action.value }
        case 'redirect':
          return { ...current, redirectSessionId: action.sessionId }
      }
    },
    {
      title: 'Friday Night Arena',
      theme: 'comedy',
      roundCount: 3,
      maxParticipants: 200,
      selectedModels: AVAILABLE_MODELS.slice(0, 4).map((m) => m.key),
      pending: false,
      redirectSessionId: null,
    },
  )

  useEffect(() => {
    if (!state.redirectSessionId) return
    void navigate({
      to: '/admin/sessions/$sessionId',
      params: { sessionId: state.redirectSessionId },
    })
  }, [navigate, state.redirectSessionId])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const parsed = createSessionSchema.safeParse({
      title: state.title,
      theme: state.theme,
      roundCount: state.roundCount,
      modelKeys: state.selectedModels,
      maxParticipants: state.maxParticipants,
    })
    if (!parsed.success) {
      toast.error(
        parsed.error.issues[0]?.message ?? 'Session settings are invalid.',
      )
      return
    }

    dispatch({ type: 'pending', value: true })
    try {
      const result = await createSession(parsed.data)
      toast.success('Session created.')
      dispatch({ type: 'redirect', sessionId: result.sessionId })
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to create session.',
      )
    } finally {
      dispatch({ type: 'pending', value: false })
    }
  }

  return (
    <form className="space-y-8" onSubmit={handleSubmit}>
      <FormSection
        eyebrow="Step 1"
        title="Name and theme"
        description="The title is what spectators see. Theme tunes Host tone, Critic angle, and judge bar."
      >
        <div className="grid gap-5 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="title">Session title</Label>
            <Input
              id="title"
              value={state.title}
              onChange={(e) =>
                dispatch({
                  type: 'field',
                  field: 'title',
                  value: e.target.value,
                })
              }
              className="h-10"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="theme">Theme</Label>
            <Select
              value={state.theme}
              onValueChange={(value) =>
                dispatch({
                  type: 'field',
                  field: 'theme',
                  value: value as keyof typeof THEME_COPY,
                })
              }
            >
              <SelectTrigger id="theme" className="h-10">
                <SelectValue placeholder="Select a theme" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(THEME_COPY).map(([key, copy]) => (
                  <SelectItem key={key} value={key}>
                    {copy.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </FormSection>

      <Separator />

      <FormSection
        eyebrow="Step 2"
        title="Format"
        description="Pick how many rounds you want and how many seats the room can hold."
      >
        <div className="grid gap-5 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="roundCount">
              Rounds
              <span className="ml-2 font-mono text-[0.7rem] text-muted-foreground">
                {MIN_ROUNDS}–{MAX_ROUNDS}
              </span>
            </Label>
            <Input
              id="roundCount"
              type="number"
              min={MIN_ROUNDS}
              max={MAX_ROUNDS}
              value={state.roundCount}
              onChange={(e) =>
                dispatch({
                  type: 'field',
                  field: 'roundCount',
                  value: Number(e.target.value),
                })
              }
              className="h-10"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="maxParticipants">
              Participant cap
              <span className="ml-2 font-mono text-[0.7rem] text-muted-foreground">
                2–1000
              </span>
            </Label>
            <Input
              id="maxParticipants"
              type="number"
              min={2}
              max={1000}
              value={state.maxParticipants}
              onChange={(e) =>
                dispatch({
                  type: 'field',
                  field: 'maxParticipants',
                  value: Number(e.target.value),
                })
              }
              className="h-10"
            />
          </div>
        </div>
      </FormSection>

      <Separator />

      <FormSection
        eyebrow="Step 3"
        title="Model lineup"
        description="Pick the models that go on stage. We'll snapshot them at session creation so historical sessions stay reproducible."
      >
        <div className="grid gap-3 md:grid-cols-2">
          {AVAILABLE_MODELS.map((model) => {
            const checked = state.selectedModels.includes(model.key)
            return (
              <button
                type="button"
                key={model.key}
                onClick={() =>
                  dispatch({ type: 'toggleModel', modelKey: model.key })
                }
                className={cn(
                  'group flex items-start gap-3 rounded-xl border p-4 text-left transition-all',
                  checked
                    ? 'border-primary/40 bg-primary/[0.04] ring-1 ring-primary/30'
                    : 'border-border/60 bg-card hover:border-border hover:bg-muted/40',
                )}
              >
                <div
                  className={cn(
                    'mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md border transition-colors',
                    checked
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-background text-transparent',
                  )}
                  aria-hidden
                >
                  <CheckIcon className="size-3.5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold">{model.label}</p>
                    <span
                      aria-hidden
                      className="size-2 rounded-full"
                      style={{ backgroundColor: model.accent }}
                    />
                  </div>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    {model.description}
                  </p>
                </div>
              </button>
            )
          })}
        </div>
        <p className="text-xs text-muted-foreground">
          {state.selectedModels.length} of {AVAILABLE_MODELS.length} selected
        </p>
      </FormSection>

      <div className="flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:items-center sm:justify-end">
        <p className="text-xs text-muted-foreground sm:mr-auto">
          Sessions are created in <code>waiting</code> state. You start the
          first round manually.
        </p>
        <Button
          type="submit"
          size="lg"
          disabled={state.pending}
          className="h-11 rounded-full px-6"
        >
          <RocketIcon className="size-4" />
          {state.pending ? 'Creating...' : 'Create session'}
        </Button>
      </div>
    </form>
  )
}

function FormSection({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <section className="grid gap-5 md:grid-cols-[260px_1fr]">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h3 className="mt-2 text-base font-semibold">{title}</h3>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          {description}
        </p>
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  )
}
