import { useEffect, useState } from 'react'

const QUERY = '(prefers-reduced-motion: reduce)'

/**
 * Whether the reader has asked the system to cut animation.
 *
 * Starts `false` so the server and the first client frame agree — the value is
 * only knowable in the browser, and reading it during render would hydrate
 * differently on a machine that has the preference set.
 */
export function useReducedMotion() {
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    const media = window.matchMedia(QUERY)
    const sync = () => setReduced(media.matches)

    sync()
    media.addEventListener('change', sync)
    return () => media.removeEventListener('change', sync)
  }, [])

  return reduced
}
