import { useState, startTransition } from 'react'
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
  const [title, setTitle] = useState('Friday Night Arena')
  const [theme, setTheme] = useState<keyof typeof THEME_COPY>('comedy')
  const [roundCount, setRoundCount] = useState(3)
  const [maxParticipants, setMaxParticipants] = useState(200)
  const [selectedModels, setSelectedModels] = useState<string[]>(
    AVAILABLE_MODELS.slice(0, 4).map((model) => model.key),
  )
  const [pending, setPending] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const parsed = createSessionSchema.safeParse({
      title,
      theme,
      roundCount,
      modelKeys: selectedModels,
      maxParticipants,
    })
    if (!parsed.success) {
      toast.error(
        parsed.error.issues[0]?.message ?? 'Session settings are invalid.',
      )
      return
    }

    setPending(true)
    try {
      const result = await createSession(parsed.data)
      toast.success('Session created.')
      startTransition(() => {
        void navigate({
          to: '/admin/sessions/$sessionId',
          params: { sessionId: result.sessionId },
        })
      })
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to create session.',
      )
    } finally {
      setPending(false)
    }
  }

  function toggleModel(modelKey: string) {
    setSelectedModels((current) =>
      current.includes(modelKey)
        ? current.filter((item) => item !== modelKey)
        : [...current, modelKey],
    )
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
                value={title}
                onChange={(event) => setTitle(event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Theme</Label>
              <Select
                value={theme}
                onValueChange={(value) =>
                  setTheme(value as keyof typeof THEME_COPY)
                }
              >
                <SelectTrigger>
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
                value={roundCount}
                onChange={(event) => setRoundCount(Number(event.target.value))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxParticipants">Participant cap</Label>
              <Input
                id="maxParticipants"
                type="number"
                min={2}
                max={1000}
                value={maxParticipants}
                onChange={(event) =>
                  setMaxParticipants(Number(event.target.value))
                }
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label>Model lineup</Label>
            <div className="grid gap-3 md:grid-cols-2">
              {AVAILABLE_MODELS.map((model) => {
                const checked = selectedModels.includes(model.key)
                return (
                  <label
                    key={model.key}
                    className="flex cursor-pointer items-start gap-3 rounded-[1.3rem] border border-border/70 bg-background/70 px-4 py-4"
                  >
                    <Checkbox
                      checked={checked}
                      onCheckedChange={() => toggleModel(model.key)}
                    />
                    <div className="space-y-1">
                      <p className="font-medium text-foreground">
                        {model.label}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {model.description}
                      </p>
                    </div>
                  </label>
                )
              })}
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" size="lg" disabled={pending}>
              {pending ? 'Creating…' : 'Create Session'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
