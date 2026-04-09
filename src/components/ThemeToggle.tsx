import { MoonStarIcon, SunIcon, SunMoonIcon } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Button } from '#/components/ui/button'

const ORDER = ['light', 'dark', 'system'] as const

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const currentTheme = theme ?? 'system'
  const nextTheme =
    ORDER[
      (ORDER.indexOf(currentTheme as (typeof ORDER)[number]) + 1) % ORDER.length
    ]

  const icon =
    currentTheme === 'light' ? (
      <SunIcon className="size-4" />
    ) : currentTheme === 'dark' ? (
      <MoonStarIcon className="size-4" />
    ) : (
      <SunMoonIcon className="size-4" />
    )

  return (
    <Button
      type="button"
      variant="outline"
      size="icon-sm"
      suppressHydrationWarning
      className="rounded-full border-border/70 bg-background/70 backdrop-blur-sm"
      onClick={() => setTheme(nextTheme)}
      title={`Theme: ${currentTheme}`}
      aria-label={`Theme: ${currentTheme}`}
    >
      {icon}
    </Button>
  )
}
