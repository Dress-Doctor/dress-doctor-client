import { queryOptions, useQuery } from '@tanstack/react-query'
import { businessFacts } from '#/data/home.data'
import publicApi from '#/libs/public.api'

const FIVE_MINUTES = 5 * 60 * 1000

/** The shop's totals. Silent: the home page keeps its own figures if this fails. */
export const publicStatsQueryOptions = () =>
  queryOptions({
    queryKey: ['public', 'stats'] as const,
    queryFn: publicApi.stats,
    staleTime: FIVE_MINUTES,
    retry: false,
    meta: { silent: true },
  })

/**
 * The customer count to show. The figure in `businessFacts` is the least we
 * can say, so a missing, failed or lower answer never brings it down.
 */
export const customersServedFrom = (live?: number) =>
  Math.max(live ?? 0, businessFacts.customersServed)

export const usePublicStats = () => useQuery(publicStatsQueryOptions())
