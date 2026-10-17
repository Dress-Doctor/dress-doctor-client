// @vitest-environment jsdom
import { act, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { accountKeys } from '#/libs/account-keys'
import { renderHookWithClient } from '#/test/render'
import { meQueryKey } from './use-me'
import { useUpdateProfile } from './use-update-profile'

const { updateProfile } = vi.hoisted(() => ({ updateProfile: vi.fn() }))
vi.mock('#/libs/account.api', () => ({ default: { updateProfile } }))

describe('useUpdateProfile', () => {
  beforeEach(() => {
    updateProfile.mockReset()
  })

  it('saves to the customer’s own code, with only what it is given', async () => {
    updateProfile.mockResolvedValue({})
    const { result } = renderHookWithClient(() => useUpdateProfile('CU-AH7LCH'))

    await act(() => result.current.mutateAsync({ preferredLanguage: 'fr' }))

    expect(updateProfile).toHaveBeenCalledWith('CU-AH7LCH', {
      preferredLanguage: 'fr',
    })
  })

  it('asks again for the profile and for who is signed in, since both hold the language', async () => {
    updateProfile.mockResolvedValue({})
    const { result, client } = renderHookWithClient(() =>
      useUpdateProfile('CU-1'),
    )
    client.setQueryData(accountKeys.profile, {})
    client.setQueryData(meQueryKey, {})

    await act(() => result.current.mutateAsync({ notificationsOptIn: false }))

    await waitFor(() => {
      expect(client.getQueryState(accountKeys.profile)?.isInvalidated).toBe(
        true,
      )
      expect(client.getQueryState(meQueryKey)?.isInvalidated).toBe(true)
    })
  })
})
