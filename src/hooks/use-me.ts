import { queryOptions, useQuery } from '@tanstack/react-query'
import type { MeDto } from '#/interfaces/auth.dto'
import authApi from '#/libs/auth.api'

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

/** Customers only: this site has no staff pages and no staff sign-in. */
export function isCustomer(me: MeDto): boolean {
  const type = me.user.userTypeId
  return typeof type === 'object' && type.userTypeName === 'CUSTOMER'
}

/**
 * Whether a customer is signed in, for pages that only change a link or a
 * label — the header — and have no reason to wait or to show an error.
 *
 * It is `false` until the answer arrives, so the server and the first paint
 * agree, and `false` again when the visitor is not signed in or the call fails.
 */
export function useIsSignedIn(): boolean {
  const { data } = useQuery(meQueryOptions())
  return data ? isCustomer(data) : false
}
