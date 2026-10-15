import { describe, expect, it } from 'vitest'
import { formatClock, secondsUntil } from './countdown'

describe('secondsUntil', () => {
  it('rounds a part second up, so 0 means it has really arrived', () => {
    expect(secondsUntil(10_500, 10_000)).toBe(1)
    expect(secondsUntil(70_000, 10_000)).toBe(60)
  })

  it('is zero when there is nothing to wait for or the time has passed', () => {
    expect(secondsUntil(null, 10_000)).toBe(0)
    expect(secondsUntil(9_000, 10_000)).toBe(0)
    expect(secondsUntil(10_000, 10_000)).toBe(0)
  })
})

describe('formatClock', () => {
  it('writes minutes and two-digit seconds', () => {
    expect(formatClock(65)).toBe('1:05')
    expect(formatClock(300)).toBe('5:00')
    expect(formatClock(9)).toBe('0:09')
    expect(formatClock(0)).toBe('0:00')
  })

  it('never goes below zero', () => {
    expect(formatClock(-4)).toBe('0:00')
  })
})
