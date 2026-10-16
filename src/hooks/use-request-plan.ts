import { useMutation } from '@tanstack/react-query'
import type { PlanRequestDataDto } from '#/interfaces/signup.dto'
import signupApi from '#/libs/signup.api'

/**
 * Asks for a plan as the signed-in customer. Nothing is paid or switched on:
 * the API keeps it as a request, and staff ring the customer to confirm it.
 */
export function useRequestPlan() {
  return useMutation({
    mutationFn: (data: PlanRequestDataDto) => signupApi.requestPlan(data),
  })
}
