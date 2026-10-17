import { queryOptions, useQuery } from '@tanstack/react-query'
import accountApi from '#/libs/account.api'
import { accountKeys } from '#/libs/account-keys'

/**
 * The customer's own profile. `silent` keeps the app-wide "Request failed"
 * toast away: the page shows its own message with a way to try again.
 */
export const myProfileQueryOptions = () =>
  queryOptions({
    queryKey: accountKeys.profile,
    queryFn: () => accountApi.profile(),
    meta: { silent: true },
  })

export const useMyProfile = () => useQuery(myProfileQueryOptions())
