// @vitest-environment jsdom
import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import { AxiosError } from 'axios'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { MySubscriptionDto } from '#/interfaces/account.dto'
import { apiError } from '#/test/api-errors'
import { rejecting } from '#/test/mocks'
import { renderWithProviders } from '#/test/render'
import PlanCard from './plan-card'

const api = vi.hoisted(() => ({
  pausePlan: vi.fn(),
  resumePlan: vi.fn(),
  cancelPlan: vi.fn(),
  renewPlan: vi.fn(),
}))
vi.mock('#/libs/account.api', () => ({ default: api }))

const plan = (over: Partial<MySubscriptionDto> = {}): MySubscriptionDto => ({
  _id: 's1',
  status: 'ACTIVE',
  planId: {
    _id: 'p1',
    planName: 'Standard',
    code: 'standard-pieces-monthly',
    price: 40000,
    billingCycle: 'MONTHLY',
    quotaType: 'PIECES',
    quotaAmount: 100,
  },
  billingCycle: 'MONTHLY',
  quotaType: 'PIECES',
  quotaAmount: 100,
  price: 40000,
  remainingQuota: 62,
  currentPeriodStart: '2026-10-12T09:00:00.000Z',
  currentPeriodEnd: '2026-11-11T09:00:00.000Z',
  createdAt: '2026-10-01T09:00:00.000Z',
  ...over,
})

const squash = (text: string) => text.replace(/\s+/g, ' ')

describe('PlanCard', () => {
  const onChanged = vi.fn()

  beforeEach(() => {
    for (const fn of Object.values(api)) fn.mockReset()
    onChanged.mockReset()
  })

  const show = (subscription: MySubscriptionDto) =>
    renderWithProviders(<PlanCard plan={subscription} onChanged={onChanged} />)

  const button = (name: RegExp) => screen.queryByRole('button', { name })

  describe('renewing', () => {
    it('says why an ended plan ended, and offers to renew it', () => {
      show(
        plan({
          status: 'EXPIRED',
          expiredReason: 'CONSUMED',
          remainingQuota: 0,
        }),
      )

      expect(
        screen.getByText(/ended early because you used everything/),
      ).toBeTruthy()
      expect(button(/renew my plan/i)).toBeTruthy()
      // An ended plan cannot be paused or cancelled.
      expect(button(/pause/i)).toBeNull()
    })

    it('tells apart a plan that ended on its date', () => {
      show(plan({ status: 'EXPIRED', expiredReason: 'DATE' }))

      expect(screen.getByText(/ended because its date came/)).toBeTruthy()
    })

    it('offers renewal on a running plan only once it is due to answer', () => {
      const { unmount } = show(plan())
      expect(button(/renew my plan/i)).toBeNull()
      unmount()

      show(plan({ awaitingRenewal: true }))
      expect(button(/renew my plan/i)).toBeTruthy()
    })

    it('does not ask again once the customer has confirmed', () => {
      show(plan({ awaitingRenewal: true, renewalConfirmed: true }))

      expect(button(/renew my plan/i)).toBeNull()
      expect(screen.getByText(/You have confirmed your renewal/)).toBeTruthy()
    })

    it('asks first, then confirms the renewal for that plan', async () => {
      api.renewPlan.mockResolvedValue({})
      show(plan({ status: 'EXPIRED' }))

      fireEvent.click(button(/renew my plan/i)!)
      const dialog = await screen.findByRole('alertdialog')
      expect(api.renewPlan).not.toHaveBeenCalled()

      fireEvent.click(
        within(dialog).getByRole('button', { name: /renew plan/i }),
      )

      await waitFor(() => expect(api.renewPlan).toHaveBeenCalledWith('s1'))
    })

    it('shows what is still to pay without hiding that the plan is running', () => {
      show(
        plan({
          currentPeriod: {
            planPrice: 40000,
            amountPaid: 10000,
            outstanding: 30000,
            paymentStatus: 'PARTIALLY_PAID',
            startsAt: '2026-10-12T09:00:00.000Z',
            endsAt: '2026-11-11T09:00:00.000Z',
          },
        }),
      )

      expect(squash(document.body.textContent)).toContain(
        '30 000 XAF is still to pay',
      )
      expect(screen.getByText('62 of 100 pieces left')).toBeTruthy()
    })
  })

  describe('what it shows', () => {
    it('names the plan, what it costs and what it includes', () => {
      show(plan())

      expect(screen.getByRole('heading', { name: 'Standard' })).toBeTruthy()
      expect(squash(document.body.textContent)).toContain(
        '40 000 XAF every month',
      )
      expect(screen.getByText('Includes 100 pieces every month')).toBeTruthy()
    })

    it('shows how much is left of a running plan', () => {
      show(plan())

      expect(screen.getByText('62 of 100 pieces left')).toBeTruthy()
      expect(screen.getByRole('progressbar')).toBeTruthy()
    })

    it('uses the price the customer was quoted, not today’s', () => {
      show(plan({ price: 35000 }))

      expect(squash(document.body.textContent)).toContain(
        '35 000 XAF every month',
      )
    })

    it('shows a request that is waiting without a meter, and says we will call', () => {
      show(plan({ status: 'PENDING', remainingQuota: 0 }))

      expect(screen.queryByRole('progressbar')).toBeNull()
      expect(screen.getByText(/We will call you soon to confirm/i)).toBeTruthy()
    })
  })

  describe('which buttons it offers', () => {
    it('lets a running plan be paused or ended, not resumed', () => {
      show(plan())

      expect(button(/^Pause plan$/)).toBeTruthy()
      expect(button(/^Cancel plan$/)).toBeTruthy()
      expect(button(/^Resume plan$/)).toBeNull()
    })

    it('lets a paused plan be resumed or ended, not paused', () => {
      show(plan({ status: 'PAUSED' }))

      expect(button(/^Resume plan$/)).toBeTruthy()
      expect(button(/^Cancel plan$/)).toBeTruthy()
      expect(button(/^Pause plan$/)).toBeNull()
    })

    it('lets a waiting request be withdrawn, and calls it that', () => {
      show(plan({ status: 'PENDING' }))

      expect(button(/^Withdraw request$/)).toBeTruthy()
      expect(button(/^Cancel plan$/)).toBeNull()
      expect(button(/^Pause plan$/)).toBeNull()
    })
  })

  describe('asking first', () => {
    const openDialog = async (name: RegExp) => {
      fireEvent.click(screen.getByRole('button', { name }))
      return await screen.findByRole('alertdialog')
    }

    it('does nothing until the customer confirms', async () => {
      show(plan())

      const dialog = await openDialog(/^Pause plan$/)

      expect(within(dialog).getByText('Pause your plan?')).toBeTruthy()
      expect(api.pausePlan).not.toHaveBeenCalled()
    })

    it('puts the safe choice first, so Enter does not end a plan by accident', async () => {
      show(plan())

      const dialog = await openDialog(/^Cancel plan$/)

      const buttons = within(dialog).getAllByRole('button')
      expect(buttons[0].textContent).toBe('Keep my plan')
    })

    it('says plainly that ending a plan cannot be undone', async () => {
      show(plan())

      const dialog = await openDialog(/^Cancel plan$/)

      expect(within(dialog).getByText(/cannot undo this/i)).toBeTruthy()
    })

    it('says taking back a request loses nothing', async () => {
      show(plan({ status: 'PENDING' }))

      const dialog = await openDialog(/^Withdraw request$/)

      expect(within(dialog).getByText('Withdraw your request?')).toBeTruthy()
      expect(within(dialog).queryByText(/cannot undo/i)).toBeNull()
    })

    it('backs out without touching the plan', async () => {
      show(plan())
      const dialog = await openDialog(/^Cancel plan$/)

      fireEvent.click(
        within(dialog).getByRole('button', { name: 'Keep my plan' }),
      )

      await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull())
      expect(api.cancelPlan).not.toHaveBeenCalled()
    })

    it.each([
      ['Pause plan', /^Pause plan$/, 'pausePlan', 'ACTIVE'],
      ['Resume plan', /^Resume plan$/, 'resumePlan', 'PAUSED'],
      ['Yes, cancel my plan', /^Cancel plan$/, 'cancelPlan', 'ACTIVE'],
      ['Withdraw request', /^Withdraw request$/, 'cancelPlan', 'PENDING'],
    ] as const)(
      '"%s" calls the API with the plan’s id and closes',
      async (confirm, opener, call, status) => {
        api[call].mockResolvedValue({})
        show(plan({ status }))
        const dialog = await openDialog(opener)

        fireEvent.click(within(dialog).getByRole('button', { name: confirm }))

        await waitFor(() => expect(api[call]).toHaveBeenCalledWith('s1'))
        await waitFor(() =>
          expect(screen.queryByRole('alertdialog')).toBeNull(),
        )
        expect(onChanged).not.toHaveBeenCalled()
      },
    )
  })

  describe('when it goes wrong', () => {
    it('leaves the question open with the reason when the connection fails, so it can be tried again', async () => {
      api.pausePlan.mockImplementation(
        rejecting(new AxiosError('Network Error')),
      )
      show(plan())
      fireEvent.click(screen.getByRole('button', { name: /^Pause plan$/ }))
      const dialog = await screen.findByRole('alertdialog')

      fireEvent.click(
        within(dialog).getByRole('button', { name: 'Pause plan' }),
      )

      await within(dialog).findByText(/cannot reach Dress Doctor/i)
      expect(screen.getByRole('alertdialog')).toBeTruthy()
      expect(onChanged).not.toHaveBeenCalled()
    })

    it('closes the question and tells the page when staff changed the plan first', async () => {
      api.resumePlan.mockImplementation(
        rejecting(apiError(409, 'INVALID_SUBSCRIPTION_STATUS')),
      )
      show(plan({ status: 'PAUSED' }))
      fireEvent.click(screen.getByRole('button', { name: /^Resume plan$/ }))
      const dialog = await screen.findByRole('alertdialog')

      fireEvent.click(
        within(dialog).getByRole('button', { name: 'Resume plan' }),
      )

      await waitFor(() => expect(onChanged).toHaveBeenCalledTimes(1))
      await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull())
    })
  })
})
