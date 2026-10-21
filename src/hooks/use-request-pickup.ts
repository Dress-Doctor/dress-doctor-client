import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { SelfPickupDataDto } from '#/interfaces/signup.dto'
import { accountKeys } from '#/libs/account-keys'
import signupApi from '#/libs/signup.api'

/**
 * Asks for a pickup as the signed-in customer. The request carries no name or
 * phone: the session the code started says who is asking, and the API keeps
 * what it already holds. If the customer already has a pickup open, the API
 * hands that one back instead of making a second.
 *
 * The account's pickup list is asked for again, so a customer who opens it
 * next sees the request they just made.
 */
export function useRequestPickup() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: SelfPickupDataDto) => signupApi.requestPickup(data),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: accountKeys.pickups }),
  })
}
