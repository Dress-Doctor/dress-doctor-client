import { useMutation } from '@tanstack/react-query'
import type { SelfPickupDataDto } from '#/interfaces/signup.dto'
import signupApi from '#/libs/signup.api'

/**
 * Asks for a pickup as the signed-in customer. The request carries no name or
 * phone: the session the code started says who is asking, and the API keeps
 * what it already holds. If the customer already has a pickup open, the API
 * hands that one back instead of making a second.
 */
export function useRequestPickup() {
  return useMutation({
    mutationFn: (data: SelfPickupDataDto) => signupApi.requestPickup(data),
  })
}
