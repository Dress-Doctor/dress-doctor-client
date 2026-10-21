import { queryOptions, useQuery } from '@tanstack/react-query'
import accountApi from '#/libs/account.api'
import { accountKeys } from '#/libs/account-keys'

/** All of the customer's plans and plan requests, newest first. */
export const mySubscriptionsQueryOptions = () =>
  queryOptions({
    queryKey: accountKeys.subscriptions,
    queryFn: async () => (await accountApi.subscriptions()).data,
    meta: { silent: true },
  })

export const useMySubscriptions = () => useQuery(mySubscriptionsQueryOptions())
