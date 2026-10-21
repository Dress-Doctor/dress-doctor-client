import { useMutation, useQueryClient } from '@tanstack/react-query'
import { meQueryKey } from '#/hooks/use-me'
import type { UpdateProfileDataDto } from '#/interfaces/account.dto'
import accountApi from '#/libs/account.api'
import { accountKeys } from '#/libs/account-keys'

/**
 * Saves the language, saved address and notification choice. The contacts are
 * not here: the API refuses a customer who sends one.
 *
 * Both the profile and "who is signed in" are asked for again, since the
 * language is on both.
 */
export function useUpdateProfile(customerCode: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdateProfileDataDto) =>
      accountApi.updateProfile(customerCode, data),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: accountKeys.profile }),
        queryClient.invalidateQueries({ queryKey: meQueryKey }),
      ])
    },
  })
}
