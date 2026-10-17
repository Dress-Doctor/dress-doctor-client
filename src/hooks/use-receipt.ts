import { useMutation } from '@tanstack/react-query'
import accountApi from '#/libs/account.api'
import { receiptLanguage } from '#/libs/account'

/**
 * Gives the customer their receipt as a PDF.
 *
 * It is fetched and then saved from memory, not linked to, because the API
 * wants the platform key and the session on the request and a plain link
 * sends neither. Browser only: it runs from a tap, never while a page is drawn.
 */
export function useReceipt() {
  return useMutation({
    mutationFn: async (orderCode: string) => {
      const pdf = await accountApi.receipt(orderCode, receiptLanguage())
      const url = URL.createObjectURL(
        new Blob([pdf], { type: 'application/pdf' }),
      )

      const link = document.createElement('a')
      link.href = url
      link.download = `receipt-${orderCode}.pdf`
      document.body.append(link)
      link.click()
      link.remove()

      // The browser has started the save by now; free the copy in memory.
      setTimeout(() => URL.revokeObjectURL(url), 10_000)
    },
    meta: { silent: true },
  })
}
