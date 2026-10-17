import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { PlanRequestDataDto } from '#/interfaces/signup.dto'
import { accountKeys } from '#/libs/account-keys'
import signupApi from '#/libs/signup.api'

/**
 * Asks for a plan as the signed-in customer. Nothing is paid or switched on:
 * the API keeps it as a request, and staff ring the customer to confirm it.
 *
 * The account's plan page is asked for again, so a customer who opens it next
 * sees the request they just made.
 */
export function useRequestPlan() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: PlanRequestDataDto) => signupApi.requestPlan(data),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: accountKeys.subscriptions }),
  })
}
