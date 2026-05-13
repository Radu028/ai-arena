import { cn } from '#/lib/utils'

export function ArenaLogo({
  size = 40,
  className,
}: {
  size?: number
  className?: string
}) {
  return (
    <svg
      className={cn(
        'transition-transform duration-500 hover:rotate-12',
        className,
      )}
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="AI Arena logo"
    >
      <defs>
        <radialGradient
          id="arena-logo-bg"
          cx="32%"
          cy="24%"
          r="76%"
          gradientUnits="userSpaceOnUse"
          x1="0"
          y1="0"
          x2="40"
          y2="40"
        >
          <stop offset="0%" stopColor="#ff9553" />
          <stop offset="100%" stopColor="#b91c1c" />
        </radialGradient>
      </defs>

      {/* Badge background */}
      <rect width="40" height="40" rx="9" fill="url(#arena-logo-bg)" />

      {/* Left model node */}
      <circle cx="9.5" cy="20" r="3.5" fill="white" fillOpacity="0.25" />
      <circle cx="9.5" cy="20" r="1.5" fill="white" fillOpacity="0.7" />

      {/* Right model node */}
      <circle cx="30.5" cy="20" r="3.5" fill="white" fillOpacity="0.25" />
      <circle cx="30.5" cy="20" r="1.5" fill="white" fillOpacity="0.7" />

      {/* Connection arc — top */}
      <path
        d="M13 20 Q20 9 27 20"
        stroke="white"
        strokeWidth="1.2"
        strokeOpacity="0.35"
        fill="none"
        strokeLinecap="round"
      />
      {/* Connection arc — bottom */}
      <path
        d="M13 20 Q20 31 27 20"
        stroke="white"
        strokeWidth="1.2"
        strokeOpacity="0.35"
        fill="none"
        strokeLinecap="round"
      />

      {/* Lightning bolt — center spark */}
      <path d="M22 10L15 22H20.5L19 30L27 18H21.5L22 10Z" fill="white" />
    </svg>
  )
}
