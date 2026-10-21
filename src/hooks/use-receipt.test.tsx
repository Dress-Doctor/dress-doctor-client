// @vitest-environment jsdom
import { act, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { rejecting } from '#/test/mocks'
import { renderHookWithClient } from '#/test/render'
import { useReceipt } from './use-receipt'

const { receipt } = vi.hoisted(() => ({ receipt: vi.fn() }))
vi.mock('#/libs/account.api', () => ({ default: { receipt } }))

describe('useReceipt', () => {
  const createObjectURL = vi.fn(() => 'blob:receipt')
  const revokeObjectURL = vi.fn()
  let clicked: HTMLAnchorElement[] = []

  beforeEach(() => {
    receipt.mockReset()
    createObjectURL.mockClear()
    revokeObjectURL.mockClear()
    clicked = []
    vi.stubGlobal(
      'URL',
      Object.assign(URL, { createObjectURL, revokeObjectURL }),
    )
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (
      this: HTMLAnchorElement,
    ) {
      clicked.push(this)
    })
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('asks for the PDF in the language of the page', async () => {
    receipt.mockResolvedValue(new Blob(['%PDF']))
    const { result } = renderHookWithClient(() => useReceipt())

    await act(() => result.current.mutateAsync('OR-A4F92C'))

    expect(receipt).toHaveBeenCalledWith('OR-A4F92C', 'en')
  })

  it('saves it under a name that carries the order’s code', async () => {
    receipt.mockResolvedValue(new Blob(['%PDF']))
    const { result } = renderHookWithClient(() => useReceipt())

    await act(() => result.current.mutateAsync('OR-A4F92C'))

    expect(createObjectURL).toHaveBeenCalledTimes(1)
    expect(clicked).toHaveLength(1)
    expect(clicked[0].download).toBe('receipt-OR-A4F92C.pdf')
    expect(clicked[0].href).toBe('blob:receipt')
  })

  it('does not leave its link on the page', async () => {
    receipt.mockResolvedValue(new Blob(['%PDF']))
    const { result } = renderHookWithClient(() => useReceipt())

    await act(() => result.current.mutateAsync('OR-A4F92C'))

    expect(document.querySelector('a[download]')).toBeNull()
  })

  it('frees the saved copy once the browser has started the download', async () => {
    vi.useFakeTimers()
    receipt.mockResolvedValue(new Blob(['%PDF']))
    const { result } = renderHookWithClient(() => useReceipt())

    await act(() => result.current.mutateAsync('OR-A4F92C'))
    expect(revokeObjectURL).not.toHaveBeenCalled()

    vi.advanceTimersByTime(10_000)
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:receipt')
  })

  it('says it failed, and saves nothing, when the receipt cannot be fetched', async () => {
    receipt.mockImplementation(rejecting(new Error('500')))
    const { result } = renderHookWithClient(() => useReceipt())

    act(() => result.current.mutate('OR-A4F92C'))

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(clicked).toHaveLength(0)
    expect(createObjectURL).not.toHaveBeenCalled()
  })
})
