import { infiniteQueryOptions, useInfiniteQuery } from '@tanstack/react-query'
import accountApi from '#/libs/account.api'
import { accountKeys } from '#/libs/account-keys'

const PAGE_SIZE = 10

/** The customer's own pickup requests, newest first, a page at a time. */
export const myPickupsQueryOptions = () =>
  infiniteQueryOptions({
    queryKey: accountKeys.pickups,
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      accountApi.pickups({ page: pageParam, size: PAGE_SIZE }),
    getNextPageParam: (last) => last.nextPage ?? undefined,
    meta: { silent: true },
  })

export const useMyPickups = () => useInfiniteQuery(myPickupsQueryOptions())
