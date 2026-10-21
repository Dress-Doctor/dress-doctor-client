import { queryOptions, useQuery } from '@tanstack/react-query'
import accountApi from '#/libs/account.api'
import { accountKeys } from '#/libs/account-keys'

/** One of the customer's orders, by its code. Someone else's is a 404. */
export const myOrderQueryOptions = (orderCode: string) =>
  queryOptions({
    queryKey: accountKeys.order(orderCode),
    queryFn: () => accountApi.order(orderCode),
    meta: { silent: true },
  })

export const useMyOrder = (orderCode: string) =>
  useQuery(myOrderQueryOptions(orderCode))
