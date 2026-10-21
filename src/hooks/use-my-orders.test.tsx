// @vitest-environment jsdom
import { waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { renderHookWithClient } from '#/test/render'
import { useMyOrders } from './use-my-orders'

const { orders } = vi.hoisted(() => ({ orders: vi.fn() }))
vi.mock('#/libs/account.api', () => ({ default: { orders } }))

const row = (orderCode: string) => ({ _id: orderCode, orderCode })

describe('useMyOrders', () => {
  beforeEach(() => {
    orders.mockReset()
  })

  it('waits for the customer’s code before it asks for anything', () => {
    const { result } = renderHookWithClient(() => useMyOrders(undefined))

    expect(orders).not.toHaveBeenCalled()
    expect(result.current.isPending).toBe(true)
  })

  it('asks for the first page of the customer’s own orders', async () => {
    orders.mockResolvedValue({ data: [row('OR-1')], total: 1, nextPage: null })
    const { result } = renderHookWithClient(() => useMyOrders('CU-1'))

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(orders).toHaveBeenCalledWith('CU-1', { page: 1, size: 10 })
    expect(result.current.hasNextPage).toBe(false)
  })

  it('follows the API’s next page, and stops when there is none', async () => {
    orders
      .mockResolvedValueOnce({ data: [row('OR-1')], total: 2, nextPage: 2 })
      .mockResolvedValueOnce({ data: [row('OR-2')], total: 2, nextPage: null })
    const { result } = renderHookWithClient(() => useMyOrders('CU-1'))

    await waitFor(() => expect(result.current.hasNextPage).toBe(true))
    await result.current.fetchNextPage()

    await waitFor(() => expect(result.current.data?.pages).toHaveLength(2))
    expect(orders).toHaveBeenLastCalledWith('CU-1', { page: 2, size: 10 })
    expect(result.current.hasNextPage).toBe(false)
  })
})
