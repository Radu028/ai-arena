export function formatDateTime(value: number | null | undefined) {
  if (!value) {
    return 'Not available'
  }
  return new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(value)
}

export function formatClock(value: number | null | undefined) {
  if (!value) {
    return 'TBD'
  }
  return new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(value)
}

export function formatDurationMs(value: number | null | undefined) {
  if (!value) {
    return 'n/a'
  }
  if (value < 1_000) {
    return `${value} ms`
  }
  return `${(value / 1_000).toFixed(1)} s`
}

export function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('')
}
