import { useEffect, useReducer } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useMutation } from 'convex/react'
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import { Checkbox } from '#/components/ui/checkbox'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'

export function CreateSessionForm() {
  const navigate = useNavigate()
  const createSession = useMutation(api.sessions.create)
  const [state, dispatch] = useReducer(
    (
      current: {
        title: string
        theme: keyof typeof THEME_COPY
        roundCount: number
        maxParticipants: number
        selectedModels: string[]
        pending: boolean
        redirectSessionId: string | null
      },
      action:
        | {
            type: 'field'
            field: 'title' | 'theme' | 'roundCount' | 'maxParticipants'
            value: string | number
          }
        | { type: 'toggleModel'; modelKey: string }
        | { type: 'pending'; value: boolean }
        | { type: 'redirect'; sessionId: string | null },
    ) => {
      switch (action.type) {
        case 'field':
          return {
            ...current,
            [action.field]: action.value,
          }
        case 'toggleModel':
          return {
            ...current,
            selectedModels: current.selectedModels.includes(action.modelKey)
              ? current.selectedModels.filter((item) => item !== action.modelKey)
              : [...current.selectedModels, action.modelKey],
          }
        case 'pending':
          return {
            ...current,
            pending: action.value,
          }
        case 'redirect':
          return {
            ...current,
            redirectSessionId: action.sessionId,
          }
      }
    },
    {
      title: 'Friday Night Arena',
      theme: 'comedy' as keyof typeof THEME_COPY,
      roundCount: 3,
      maxParticipants: 200,
      selectedModels: AVAILABLE_MODELS.slice(0, 4).map((model) => model.key),
      pending: false,
      redirectSessionId: null,
    },
  )

  useEffect(() => {
    if (!state.redirectSessionId) {
      return
    }
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
    <Card className="arena-panel">
      <CardHeader>
        <CardTitle className="font-serif text-3xl">
          Create a live battle
        </CardTitle>
        <CardDescription>
          Choose the model lineup, rounds, theme, and room size. Sessions are
          created in a waiting state until you start them manually.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-8" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title">Session title</Label>
              <Input
                id="title"
                value={state.title}
                onChange={(event) =>
                  dispatch({
                    type: 'field',
                    field: 'title',
                    value: event.target.value,
                  })
                }
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
                <SelectTrigger id="theme">
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

            <div className="space-y-2">
              <Label htmlFor="roundCount">Rounds</Label>
              <Input
                id="roundCount"
                type="number"
                min={MIN_ROUNDS}
                max={MAX_ROUNDS}
                value={state.roundCount}
                onChange={(event) =>
                  dispatch({
                    type: 'field',
                    field: 'roundCount',
                    value: Number(event.target.value),
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxParticipants">Participant cap</Label>
              <Input
                id="maxParticipants"
                type="number"
                min={2}
                max={1000}
                value={state.maxParticipants}
                onChange={(event) =>
                  dispatch({
                    type: 'field',
                    field: 'maxParticipants',
                    value: Number(event.target.value),
                  })
                }
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label>Model lineup</Label>
            <div className="grid gap-3 md:grid-cols-2">
              {AVAILABLE_MODELS.map((model) => {
                const checked = state.selectedModels.includes(model.key)
                const checkboxId = `model-${model.key}`
                return (
                  <div
                    key={model.key}
                    className="flex cursor-pointer items-start gap-3 rounded-[1.3rem] border border-border/70 bg-background/70 px-4 py-4"
                  >
                    <Checkbox
                      id={checkboxId}
                      checked={checked}
                      onCheckedChange={() =>
                        dispatch({ type: 'toggleModel', modelKey: model.key })
                      }
                    />
                    <label htmlFor={checkboxId} className="space-y-1">
                      <p className="font-medium text-foreground">
                        {model.label}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {model.description}
                      </p>
                    </label>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" size="lg" disabled={state.pending}>
              {state.pending ? 'Creating…' : 'Create Session'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
