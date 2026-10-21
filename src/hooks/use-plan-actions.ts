import { useMutation, useQueryClient } from '@tanstack/react-query'
import accountApi from '#/libs/account.api'
import { accountKeys } from '#/libs/account-keys'

/**
 * Pause, resume, cancel and renew a plan. After each, the plans are asked for again
 * whether or not it worked: when it did not, the usual reason is that staff
 * changed the plan a moment ago, and the page should show how it stands now.
 */
export function usePlanActions() {
  const queryClient = useQueryClient()
  const settled = () =>
    queryClient.invalidateQueries({ queryKey: accountKeys.subscriptions })

  const pause = useMutation({
    mutationFn: (id: string) => accountApi.pausePlan(id),
    onSettled: settled,
  })
  const resume = useMutation({
    mutationFn: (id: string) => accountApi.resumePlan(id),
    onSettled: settled,
  })
  const cancel = useMutation({
    mutationFn: (id: string) => accountApi.cancelPlan(id),
    onSettled: settled,
  })

  const renew = useMutation({
    mutationFn: (id: string) => accountApi.renewPlan(id),
    onSettled: settled,
  })

  return { pause, resume, cancel, renew }
}
