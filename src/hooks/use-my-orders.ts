import { infiniteQueryOptions, useInfiniteQuery } from '@tanstack/react-query'
import accountApi from '#/libs/account.api'
import { accountKeys } from '#/libs/account-keys'

const PAGE_SIZE = 10

/**
 * The customer's orders, newest first, a page at a time. The list asks for
 * more when the customer taps "Show more", so there is no page number to keep
 * in the address.
 */
export const myOrdersQueryOptions = (customerCode: string) =>
  infiniteQueryOptions({
    queryKey: accountKeys.orders(customerCode),
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      accountApi.orders(customerCode, { page: pageParam, size: PAGE_SIZE }),
    getNextPageParam: (last) => last.nextPage ?? undefined,
    meta: { silent: true },
  })

export const useMyOrders = (customerCode: string | undefined) =>
  useInfiniteQuery({
    ...myOrdersQueryOptions(customerCode ?? ''),
    enabled: !!customerCode,
  })
