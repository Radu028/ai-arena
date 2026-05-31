import { CopyIcon } from 'lucide-react'
import { toast } from 'sonner'

export function JoinCodeChip({ code }: { code: string }) {
  return (
    <button
      type="button"
      onClick={(event) => {
        event.preventDefault()
        navigator.clipboard.writeText(code)
        toast.success(`Join code ${code} copied`)
      }}
      className="inline-flex items-center gap-1.5 rounded-md bg-muted/70 px-2 py-1 font-mono text-xs tracking-wider text-foreground transition-colors hover:bg-muted"
      title="Copy join code"
    >
      {code}
      <CopyIcon className="size-3 opacity-60" />
    </button>
  )
}
