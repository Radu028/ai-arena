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

  function handleToggle() {
    document.documentElement.classList.add('theme-switching')
    setTheme(nextTheme)
    setTimeout(() => {
      document.documentElement.classList.remove('theme-switching')
    }, 450)
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="icon-sm"
      suppressHydrationWarning
      className="group rounded-full border-border/70 bg-background/70 backdrop-blur-sm"
      onClick={handleToggle}
      title={`Theme: ${currentTheme}`}
      aria-label={`Current Theme: ${currentTheme}`}
    >
      <span className="transition-transform duration-300 group-hover:-rotate-12">{icon}</span>
    </Button>
  )
}
