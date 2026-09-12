import { toaster } from '#/components/ui/toaster'
import type { ApiErrorDto } from '#/libs/api-client'
import { QueryCache, QueryClient } from '@tanstack/react-query'

export default function getContext() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        retry: (failureCount, err) => {
          // Never retry 4xx (auth/validation/permission); retry 5xx/network once.
          const status = (err as ApiErrorDto).response?.status
          if (status && status < 500) return false
          return failureCount < 1
        },
      },
    },
    queryCache: new QueryCache({
      onError: (err) => {
        if (err instanceof Error && err.name === 'CancelledError') return
        const { response } = err as ApiErrorDto
        // 401 is handled by the silent-refresh interceptor + route guard —
        // a toast here would double-report every expired session.
        if (response?.status === 401) return

        /**
         * A refusal is not a failure the operator can do anything about.
         *
         * 403 means the API scoped the answer to this person's own rules and
         * there was nothing in it for them — the system working, not breaking.
         * Every query that could hit one is gated on the same ability first
         * (see `useCan`), so reaching here means a gate was missed or the
         * client's mirror of the rules is behind the server's; either way a
         * red banner on an otherwise working page tells them nothing and
         * teaches them to ignore the ones that matter.
         *
         * Still logged, because a 403 the user never asked for is a gate this
         * app should have had.
         */
        if (response?.status === 403) {
          console.warn(
            '[permissions] refused, and asked for anyway:',
            response.config.url,
          )
          return
        }

        const data = response?.data
        toaster.create({
          type: 'error',
          title: 'Request failed',
          description: data?.message || 'An unknown error occurred',
        })
      },
    }),
  })

  return {
    queryClient,
  }
}
