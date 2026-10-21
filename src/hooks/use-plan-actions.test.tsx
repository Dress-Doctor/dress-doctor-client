// @vitest-environment jsdom
import { act, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { accountKeys } from '#/libs/account-keys'
import { rejecting } from '#/test/mocks'
import { renderHookWithClient } from '#/test/render'
import { usePlanActions } from './use-plan-actions'

const api = vi.hoisted(() => ({
  pausePlan: vi.fn(),
  resumePlan: vi.fn(),
  cancelPlan: vi.fn(),
}))
vi.mock('#/libs/account.api', () => ({ default: api }))

describe('usePlanActions', () => {
  beforeEach(() => {
    for (const fn of Object.values(api)) fn.mockReset()
  })

  const stale = (client: ReturnType<typeof renderHookWithClient>['client']) =>
    client.getQueryState(accountKeys.subscriptions)?.isInvalidated

  it.each([
    ['pause', 'pausePlan'],
    ['resume', 'resumePlan'],
    ['cancel', 'cancelPlan'],
  ] as const)(
    '%s goes to its own call, with the plan’s id',
    async (name, call) => {
      api[call].mockResolvedValue({})
      const { result } = renderHookWithClient(() => usePlanActions())

      await act(() => result.current[name].mutateAsync('sub-1'))

      expect(api[call]).toHaveBeenCalledWith('sub-1')
    },
  )

  it('asks for the plans again once it worked', async () => {
    api.pausePlan.mockResolvedValue({})
    const { result, client } = renderHookWithClient(() => usePlanActions())
    client.setQueryData(accountKeys.subscriptions, [])

    await act(() => result.current.pause.mutateAsync('sub-1'))

    await waitFor(() => expect(stale(client)).toBe(true))
  })

  it('asks again when it failed too, since staff may have changed the plan first', async () => {
    api.resumePlan.mockImplementation(
      rejecting(new Error('INVALID_SUBSCRIPTION_STATUS')),
    )
    const { result, client } = renderHookWithClient(() => usePlanActions())
    client.setQueryData(accountKeys.subscriptions, [])

    act(() => result.current.resume.mutate('sub-1'))

    await waitFor(() => expect(result.current.resume.isError).toBe(true))
    await waitFor(() => expect(stale(client)).toBe(true))
  })

  it('keeps the three actions apart: one failing does not mark the others', async () => {
    api.cancelPlan.mockImplementation(rejecting(new Error('x')))
    const { result } = renderHookWithClient(() => usePlanActions())

    act(() => result.current.cancel.mutate('sub-1'))

    await waitFor(() => expect(result.current.cancel.isError).toBe(true))
    expect(result.current.pause.isError).toBe(false)
    expect(result.current.resume.isError).toBe(false)
  })
})
