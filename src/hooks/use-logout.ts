import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { sitePaths } from '#/data/site.data'
import { meQueryKey } from '#/hooks/use-me'
import authApi from '#/libs/auth.api'

/**
 * Logs the customer out. The page is left even when the call fails: the
 * visitor asked to leave, and the cookie is short-lived anyway. Everything
 * cached about them is dropped first, so the next person on this device sees
 * nothing of theirs.
 *
 * It takes the visitor home, unless they are in the middle of a form that
 * should stay open — then `stay` leaves them where they are.
 */
export function useLogout() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [loggingOut, setLoggingOut] = useState(false)

  const logout = async ({ stay = false }: { stay?: boolean } = {}) => {
    if (loggingOut) return
    setLoggingOut(true)
    try {
      await authApi.logout()
    } catch {
      // Nothing to show: see above.
    } finally {
      if (stay) {
        // Whoever is looking at this page is still looking at it, and the
        // header is mounted. Put "who is signed in" back to unknown so it asks
        // again and finds nobody — clearing the cache would leave the header
        // holding the old answer.
        await queryClient.resetQueries({ queryKey: meQueryKey })
      } else {
        queryClient.clear()
        await navigate({ to: sitePaths.home, replace: true })
      }
      setLoggingOut(false)
    }
  }

  return { logout, loggingOut }
}
