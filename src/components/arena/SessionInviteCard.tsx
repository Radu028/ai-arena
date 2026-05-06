import { useId, useState } from 'react'
import {
  CheckIcon,
  CopyIcon,
  ExternalLinkIcon,
  Maximize2Icon,
  Minimize2Icon,
  QrCodeIcon,
} from 'lucide-react'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { cn } from '#/lib/utils'

type SessionInviteCardProps = {
  slug: string
  title?: string
  description?: string
  className?: string
}

export function SessionInviteCard({
  slug,
  title = 'Invite spectators',
  description = 'Share this public room link or scan the QR code to join the live session.',
  className,
}: SessionInviteCardProps) {
  const shareInputId = useId()
  const [copied, setCopied] = useState(false)
  const [largeQr, setLargeQr] = useState(false)
  const joinPath = `/sessions/${slug}`
  const shareUrl =
    typeof window === 'undefined'
      ? joinPath
      : new URL(joinPath, window.location.origin).toString()
  const qrSize = largeQr ? 520 : 240
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${qrSize}x${qrSize}&margin=12&data=${encodeURIComponent(shareUrl)}`

  async function copyShareUrl() {
    await navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <section
      className={cn(
        'flex flex-col gap-4 rounded-2xl border border-border/60 bg-background/40 p-5',
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
          <QrCodeIcon className="size-4" />
        </span>
        <div>
          <h2 className="text-sm font-semibold">{title}</h2>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            {description}
          </p>
        </div>
      </div>

      <div className="flex items-start gap-4 max-sm:flex-col">
        <img
          src={qrUrl}
          alt={`QR code for ${shareUrl}`}
          className={cn(
            'shrink-0 rounded-xl border border-border/60 bg-white p-2 transition-all',
            largeQr ? 'size-64 sm:size-80' : 'size-32',
          )}
        />
        <div className="flex w-full min-w-0 flex-col gap-2">
          <Label
            htmlFor={shareInputId}
            className="text-[0.7rem] uppercase tracking-[0.16em] text-muted-foreground"
          >
            Public invitation link
          </Label>
          <Input
            id={shareInputId}
            value={shareUrl}
            readOnly
            className="h-9 font-mono text-xs"
          />
          <div className="grid gap-2 sm:grid-cols-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={copyShareUrl}
            >
              {copied ? (
                <>
                  <CheckIcon className="size-3.5" />
                  Copied
                </>
              ) : (
                <>
                  <CopyIcon className="size-3.5" />
                  Copy link
                </>
              )}
            </Button>
            <Button asChild type="button" variant="outline" size="sm">
              <a href={shareUrl} target="_blank" rel="noreferrer">
                <ExternalLinkIcon className="size-3.5" />
                Open
              </a>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setLargeQr((value) => !value)}
            >
              {largeQr ? (
                <Minimize2Icon className="size-3.5" />
              ) : (
                <Maximize2Icon className="size-3.5" />
              )}
              {largeQr ? 'Smaller QR' : 'Bigger QR'}
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
