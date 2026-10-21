/** Whole seconds from `now` until `until`, never below zero. */
export function secondsUntil(until: number | null, now: number): number {
  if (until === null) return 0
  return Math.max(Math.ceil((until - now) / 1000), 0)
}

/** `65` becomes `1:05`. */
export function formatClock(totalSeconds: number): string {
  const seconds = Math.max(Math.floor(totalSeconds), 0)
  const minutes = Math.floor(seconds / 60)
  return `${minutes}:${String(seconds % 60).padStart(2, '0')}`
}
