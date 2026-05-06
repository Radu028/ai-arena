import { TrophyIcon } from 'lucide-react'
import { cn } from '#/lib/utils'
import { formatDurationMs } from '#/lib/format'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'

export function RoundResponseCard({
  response,
  revealed,
  disabled,
  onVote,
  showVoteButton,
}: {
  response: {
    id: string
    slot: string
    status: string
    text: string | null
    label: string | null
    votes: number
    isWinner: boolean
    errorMessage: string | null
    latencyMs: number | null
  }
  revealed: boolean
  disabled?: boolean
  showVoteButton?: boolean
  onVote?: (responseId: string) => void
}) {
  const failed = response.status !== 'success'

  return (
    <Card
      className={cn(
        'arena-panel flex h-full flex-col',
        response.isWinner &&
          revealed &&
          'border-[var(--arena-win)] shadow-[0_20px_40px_rgba(214,118,21,0.14)]',
      )}
    >
      <CardHeader className="space-y-3">
        <div className="flex items-center justify-between">
          <Badge
            variant="outline"
            className="rounded-full px-3 py-1 text-xs tracking-[0.18em]"
          >
            Slot {response.slot}
          </Badge>
          {response.isWinner && revealed ? (
            <Badge className="rounded-full bg-[var(--arena-win)] text-white">
              <TrophyIcon className="mr-1 size-3.5" />
              Winner
            </Badge>
          ) : null}
        </div>
        <CardTitle className="font-serif text-2xl">
          {revealed
            ? (response.label ?? `Response ${response.slot}`)
            : `Anonymous ${response.slot}`}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 space-y-4">
        {failed ? (
          <div className="rounded-[1.2rem] border border-dashed border-border/80 bg-muted/60 px-4 py-5 text-sm text-muted-foreground">
            {response.errorMessage ??
              'This model did not return a valid answer in time.'}
          </div>
        ) : (
          <p className="text-pretty text-[0.98rem] leading-7 text-foreground">
            {response.text}
          </p>
        )}
      </CardContent>
      <CardFooter className="flex items-center justify-between gap-3">
        <div className="text-sm text-muted-foreground">
          {revealed
            ? `${response.votes} vote${response.votes === 1 ? '' : 's'}`
            : 'Anonymous until reveal'}
          {response.latencyMs
            ? ` · ${formatDurationMs(response.latencyMs)}`
            : ''}
        </div>
        {showVoteButton ? (
          <Button
            disabled={disabled || failed}
            onClick={() => onVote?.(response.id)}
          >
            Vote
          </Button>
        ) : null}
      </CardFooter>
    </Card>
  )
}
