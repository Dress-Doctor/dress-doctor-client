// @vitest-environment jsdom
import { act, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { accountKeys } from '#/libs/account-keys'
import { rejecting } from '#/test/mocks'
import { renderHookWithClient } from '#/test/render'
import { useRequestPlan } from './use-request-plan'

const { requestPlan } = vi.hoisted(() => ({ requestPlan: vi.fn() }))
vi.mock('#/libs/signup.api', () => ({ default: { requestPlan } }))

describe('useRequestPlan', () => {
  beforeEach(() => {
    requestPlan.mockReset()
  })

  it('sends the plan code it is given', async () => {
    requestPlan.mockResolvedValue({ data: {} })
    const { result } = renderHookWithClient(() => useRequestPlan())

    await act(() =>
      result.current.mutateAsync({ planCode: 'standard-kg-monthly' }),
    )

    expect(requestPlan).toHaveBeenCalledWith({
      planCode: 'standard-kg-monthly',
    })
  })

  it('makes the account’s plan page ask again, so the new request shows there', async () => {
    requestPlan.mockResolvedValue({ data: {} })
    const { result, client } = renderHookWithClient(() => useRequestPlan())
    client.setQueryData(accountKeys.subscriptions, [])

    await act(() =>
      result.current.mutateAsync({ planCode: 'standard-kg-monthly' }),
    )

    await waitFor(() =>
      expect(
        client.getQueryState(accountKeys.subscriptions)?.isInvalidated,
      ).toBe(true),
    )
  })

  it('leaves the plan page alone when the request did not go', async () => {
    requestPlan.mockImplementation(rejecting(new Error('no')))
    const { result, client } = renderHookWithClient(() => useRequestPlan())
    client.setQueryData(accountKeys.subscriptions, [])

    act(() => result.current.mutate({ planCode: 'standard-kg-monthly' }))

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(client.getQueryState(accountKeys.subscriptions)?.isInvalidated).toBe(
      false,
    )
  })
})
