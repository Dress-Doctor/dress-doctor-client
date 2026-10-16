import { queryOptions, useQuery } from '@tanstack/react-query'
import type { QueryClient } from '@tanstack/react-query'
import type { MeDto, MeUserDto } from '#/interfaces/auth.dto'
import authApi from '#/libs/auth.api'
import { isUnauthenticated } from '#/libs/auth-errors'

/** The one key for "who is signed in". Sign-in and sign-out reset it. */
export const meQueryKey = ['auth', 'me'] as const

/**
 * Who is signed in, or a 401 when nobody is.
 *
 * `silent` keeps the app-wide "Request failed" toast away: a visitor who is
 * not signed in is normal, and every page that asks (the login page, the
 * account page) decides for itself what a failure means.
 */
export const meQueryOptions = () =>
  queryOptions({
    queryKey: meQueryKey,
    staleTime: 5 * 60_000,
    retry: false,
    meta: { silent: true },
    queryFn: async (): Promise<MeDto> => {
      const response = await authApi.me()
      if (!response.data) throw new Error('The account answer was empty')
      return response.data
    },
  })

/**
 * Asks who is signed in right now, ignoring what was kept.
 *
 * Called the moment a code has been accepted: the session cookie is new, and
 * whatever the page is about to show (the header, the account page) trusts the
 * answer. The kept answer from before the code — "nobody" — must not outlive it.
 */
export const refreshMe = (queryClient: QueryClient) =>
  queryClient.fetchQuery({ ...meQueryOptions(), staleTime: 0 })

/** Customers only: this site has no staff pages and no staff sign-in. */
export function isCustomer(me: MeDto): boolean {
  const type = me.user.userTypeId
  return typeof type === 'object' && type.userTypeName === 'CUSTOMER'
}

/**
 * The customer who is signed in, or `null`.
 *
 * It is `null` until the answer arrives, so the server and the first paint
 * agree, and `null` again when nobody is signed in. The answer is kept for a
 * few minutes, so a refresh that finds the session gone (a 401 or 403) counts
 * as signed out even though the old answer is still held; any other failure,
 * such as a dropped connection, does not sign anybody out.
 */
export function useCustomer(): MeUserDto | null {
  const { data, error } = useQuery(meQueryOptions())

  if (!data || !isCustomer(data)) return null
  if (error && isUnauthenticated(error)) return null
  return data.user
}

/**
 * Whether a customer is signed in, for pages that only change a link or a
 * label — the header — and have no reason to wait or to show an error.
 */
export function useIsSignedIn(): boolean {
  return useCustomer() !== null
}
