interface ArenaLogoProps {
  size?: number
  className?: string
  /**
   * When true the logo renders without the rounded background tile so the
   * inner mark can sit on top of any surface.
   */
  bare?: boolean
}

/**
 * AI Arena mark.
 *
 * Concept: two model nodes connected through a vertical "spark" channel.
 * The two nodes face off horizontally — competition; the spark threads them
 * together — collaboration / arbitration. Ramped violet → amber gradient
 * carries the "intelligence becomes a champion" idea.
 */
export function ArenaLogo({
  size = 36,
  className,
  bare = false,
}: ArenaLogoProps) {
  const id = 'arena-logo-grad'
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="AI Arena"
      className={className}
    >
      <defs>
        <linearGradient
          id={id}
          x1="2"
          y1="2"
          x2="38"
          y2="38"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="oklch(0.62 0.22 274)" />
          <stop offset="55%" stopColor="oklch(0.66 0.2 304)" />
          <stop offset="100%" stopColor="oklch(0.78 0.16 75)" />
        </linearGradient>
        <linearGradient
          id={`${id}-spark`}
          x1="20"
          y1="6"
          x2="20"
          y2="34"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="white" stopOpacity="0.95" />
          <stop offset="100%" stopColor="white" stopOpacity="0.6" />
        </linearGradient>
      </defs>

      {!bare && <rect width="40" height="40" rx="10" fill={`url(#${id})`} />}

      {/* Left node */}
      <circle cx="11" cy="20" r="3.4" fill="white" fillOpacity="0.18" />
      <circle cx="11" cy="20" r="1.6" fill="white" fillOpacity="0.95" />

      {/* Right node */}
      <circle cx="29" cy="20" r="3.4" fill="white" fillOpacity="0.18" />
      <circle cx="29" cy="20" r="1.6" fill="white" fillOpacity="0.95" />

      {/* Connection arcs */}
      <path
        d="M14 20 Q20 11 26 20"
        stroke="white"
        strokeOpacity="0.55"
        strokeWidth="1.1"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M14 20 Q20 29 26 20"
        stroke="white"
        strokeOpacity="0.55"
        strokeWidth="1.1"
        strokeLinecap="round"
        fill="none"
      />

      {/* Center spark — the lightning that picks a winner */}
      <path
        d="M21.4 9.6 L16.2 19.6 L19.4 19.6 L18.4 30.4 L24.6 18.6 L21.4 18.6 Z"
        fill={`url(#${id}-spark)`}
      />
    </svg>
  )
}
