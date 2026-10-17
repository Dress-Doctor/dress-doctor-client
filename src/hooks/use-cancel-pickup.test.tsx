// @vitest-environment jsdom
import { act, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { accountKeys } from '#/libs/account-keys'
import { rejecting } from '#/test/mocks'
import { renderHookWithClient } from '#/test/render'
import { useCancelPickup } from './use-cancel-pickup'

const { cancelPickup } = vi.hoisted(() => ({ cancelPickup: vi.fn() }))
vi.mock('#/libs/account.api', () => ({ default: { cancelPickup } }))

describe('useCancelPickup', () => {
  beforeEach(() => {
    cancelPickup.mockReset()
  })

  it('cancels the pickup it is given', async () => {
    cancelPickup.mockResolvedValue({})
    const { result } = renderHookWithClient(() => useCancelPickup())

    await act(() => result.current.mutateAsync('PU-1'))

    expect(cancelPickup).toHaveBeenCalledWith('PU-1')
  })

  it('asks for the pickups again afterwards', async () => {
    cancelPickup.mockResolvedValue({})
    const { result, client } = renderHookWithClient(() => useCancelPickup())
    client.setQueryData(accountKeys.pickups, { pages: [] })

    await act(() => result.current.mutateAsync('PU-1'))

    await waitFor(() =>
      expect(client.getQueryState(accountKeys.pickups)?.isInvalidated).toBe(
        true,
      ),
    )
  })

  it('asks again even when the API said no, since it usually means staff got there first', async () => {
    cancelPickup.mockImplementation(rejecting(new Error('PICKUP_NOT_PENDING')))
    const { result, client } = renderHookWithClient(() => useCancelPickup())
    client.setQueryData(accountKeys.pickups, { pages: [] })

    // `mutate`, as the page calls it: a refusal is read from the state, not thrown.
    act(() => result.current.mutate('PU-1'))

    await waitFor(() => expect(result.current.isError).toBe(true))
    await waitFor(() =>
      expect(client.getQueryState(accountKeys.pickups)?.isInvalidated).toBe(
        true,
      ),
    )
  })
})
