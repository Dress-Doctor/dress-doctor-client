import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { sitePaths } from '#/data/site.data'
import authApi from '#/libs/auth.api'

/**
 * Logs the customer out. The page is left even when the call fails: the
 * visitor asked to leave, and the cookie is short-lived anyway. Everything
 * cached about them is dropped first, so the next person on this device sees
 * nothing of theirs.
 */
export function useLogout() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [loggingOut, setLoggingOut] = useState(false)

  const logout = async () => {
    if (loggingOut) return
    setLoggingOut(true)
    try {
      await authApi.logout()
    } catch {
      // Nothing to show: see above.
    } finally {
      queryClient.clear()
      await navigate({ to: sitePaths.home, replace: true })
      setLoggingOut(false)
    }
  }

  return { logout, loggingOut }
}
