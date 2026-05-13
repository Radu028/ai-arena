import { useEffect, useState } from 'react'
import { LaptopIcon, MoonIcon, SunIcon } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Button } from '#/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '#/components/ui/dropdown-menu'

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  function pick(next: 'light' | 'dark' | 'system') {
    document.documentElement.classList.add('theme-switching')
    setTheme(next)
    setTimeout(() => {
      document.documentElement.classList.remove('theme-switching')
    }, 360)
  }

  const current = mounted ? (theme ?? 'system') : 'system'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          className="rounded-full"
          suppressHydrationWarning
          aria-label={`Theme: ${current}`}
          title={`Theme: ${current}`}
        >
          <SunIcon className="size-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <MoonIcon className="absolute size-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-36">
        <DropdownMenuItem onClick={() => pick('light')}>
          <SunIcon className="size-4" /> Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => pick('dark')}>
          <MoonIcon className="size-4" /> Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => pick('system')}>
          <LaptopIcon className="size-4" /> System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
