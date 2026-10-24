import { describe, expect, it } from 'vitest'
import { customersServedFrom } from './use-public-stats'

describe('customersServedFrom', () => {
  it('shows 120 until the API has answered, or if it fails', () => {
    expect(customersServedFrom(undefined)).toBe(120)
  })

  it('shows a higher live count', () => {
    expect(customersServedFrom(250)).toBe(250)
  })

  it('never shows less than 120, even if the API counts fewer', () => {
    expect(customersServedFrom(0)).toBe(120)
    expect(customersServedFrom(90)).toBe(120)
  })
})
