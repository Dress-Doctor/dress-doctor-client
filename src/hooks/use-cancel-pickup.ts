import { useMutation, useQueryClient } from '@tanstack/react-query'
import accountApi from '#/libs/account.api'
import { accountKeys } from '#/libs/account-keys'

/**
 * Cancels a pickup request that is still waiting for our call. The list is
 * asked for again afterwards even when the API says no: the usual reason is
 * that staff confirmed it a moment ago, and the list should show that.
 */
export function useCancelPickup() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (reference: string) => accountApi.cancelPickup(reference),
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: accountKeys.pickups }),
  })
}
