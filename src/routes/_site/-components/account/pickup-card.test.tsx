// @vitest-environment jsdom
import { screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { MyPickupDto } from '#/interfaces/account.dto'
import { renderWithProviders } from '#/test/render'
import PickupCard from './pickup-card'

const pickup = (over: Partial<MyPickupDto> = {}): MyPickupDto => ({
  reference: 'PU-SGEAJC',
  pickupDate: '2026-10-21T11:00:00.000Z',
  pickupTime: 'AFTERNOON 12PM - 5PM',
  pickupAddress: 'Bonaberi, 4 Etages',
  pricingModel: 'PER_KG',
  status: 'PENDING',
  createdAt: '2026-10-19T20:04:03.000Z',
  orderCodes: [],
  ...over,
})

const draw = (over: Partial<MyPickupDto> = {}) =>
  renderWithProviders(<PickupCard pickup={pickup(over)} onCancel={vi.fn()} />)

describe('PickupCard', () => {
  it('says how the customer chose to be priced', () => {
    draw({ pricingModel: 'PER_KG' })

    expect(screen.getByText('Pricing')).toBeTruthy()
    expect(screen.getByText('Per kg')).toBeTruthy()
  })

  it('reads per piece too', () => {
    draw({ pricingModel: 'PER_PIECE' })

    expect(screen.getByText('Per piece')).toBeTruthy()
  })

  it('leaves the pricing line out for a pickup that has none', () => {
    draw({ pricingModel: undefined })

    expect(screen.queryByText('Pricing')).toBeNull()
  })

  it('shows the day the request was sent', () => {
    draw({ createdAt: '2026-10-19T20:04:03.000Z' })

    expect(screen.getByText('Sent on')).toBeTruthy()
    expect(screen.getByText('19 Oct 2026')).toBeTruthy()
  })

  it('writes that day in the shop’s time zone, not the browser’s', () => {
    // 23:30 UTC on the 19th is already 00:30 on the 20th in Douala (UTC+1).
    draw({ createdAt: '2026-10-19T23:30:00.000Z' })

    expect(screen.getByText('20 Oct 2026')).toBeTruthy()
  })
})
