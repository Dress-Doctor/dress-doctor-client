// @vitest-environment jsdom
import { act, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { accountKeys } from '#/libs/account-keys'
import { rejecting } from '#/test/mocks'
import { renderHookWithClient } from '#/test/render'
import { useRequestPickup } from './use-request-pickup'

const { requestPickup } = vi.hoisted(() => ({ requestPickup: vi.fn() }))
vi.mock('#/libs/signup.api', () => ({ default: { requestPickup } }))

const data = {
  pickupAddress: 'Akwa',
  pickupTime: 'MORNING 8AM - 12PM',
  pickupDate: '2026-10-20T11:00:00.000Z',
}

describe('useRequestPickup', () => {
  beforeEach(() => {
    requestPickup.mockReset()
  })

  it('sends the pickup it is given', async () => {
    requestPickup.mockResolvedValue({ data: {} })
    const { result } = renderHookWithClient(() => useRequestPickup())

    await act(() => result.current.mutateAsync(data))

    expect(requestPickup).toHaveBeenCalledWith(data)
  })

  it('makes the account’s pickup list ask again, so the new request shows there', async () => {
    requestPickup.mockResolvedValue({ data: {} })
    const { result, client } = renderHookWithClient(() => useRequestPickup())
    client.setQueryData(accountKeys.pickups, { pages: [] })

    await act(() => result.current.mutateAsync(data))

    await waitFor(() =>
      expect(client.getQueryState(accountKeys.pickups)?.isInvalidated).toBe(
        true,
      ),
    )
  })

  it('leaves the list alone when the request did not go', async () => {
    requestPickup.mockImplementation(rejecting(new Error('no')))
    const { result, client } = renderHookWithClient(() => useRequestPickup())
    client.setQueryData(accountKeys.pickups, { pages: [] })

    act(() => result.current.mutate(data))

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(client.getQueryState(accountKeys.pickups)?.isInvalidated).toBe(false)
  })
})
