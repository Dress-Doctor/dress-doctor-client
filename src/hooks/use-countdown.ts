import { useEffect, useState } from 'react'
import { secondsUntil } from '#/libs/countdown'

/**
 * Whole seconds left until `until` (a time in milliseconds), counting down
 * once a second. Zero when there is nothing to wait for or the time has come.
 */
export function useCountdown(until: number | null) {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (until === null) return
    setNow(Date.now())

    const timer = setInterval(() => {
      const current = Date.now()
      setNow(current)
      if (current >= until) clearInterval(timer)
    }, 1000)

    return () => clearInterval(timer)
  }, [until])

  return secondsUntil(until, now)
}
