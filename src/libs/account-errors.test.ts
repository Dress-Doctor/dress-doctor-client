import { AxiosError } from 'axios'
import { describe, expect, it } from 'vitest'
import { accountErrorFrom, isNotFound } from './account-errors'

/** An error as axios builds it when the API answers with a status. */
function apiError(status: number, code?: string) {
  const error = new AxiosError('Request failed')
  error.response = {
    status,
    statusText: '',
    headers: {},
    config: {} as never,
    data: {
      success: false,
      statusCode: status,
      error: { code },
      message: 'Failed',
      timestamp: '2026-10-17T10:00:00.000Z',
    },
  }
  return error
}

describe('accountErrorFrom', () => {
  it('reads a pickup staff have already confirmed', () => {
    expect(accountErrorFrom(apiError(409, 'PICKUP_NOT_PENDING'))).toBe(
      'pickupNotPending',
    )
  })

  it('reads a plan that moved while the customer was looking', () => {
    expect(accountErrorFrom(apiError(409, 'INVALID_SUBSCRIPTION_STATUS'))).toBe(
      'planChanged',
    )
    expect(accountErrorFrom(apiError(409, 'SOMETHING_ELSE'))).toBe(
      'planChanged',
    )
  })

  it('reads an ended session from a 401 or a 403', () => {
    expect(accountErrorFrom(apiError(401))).toBe('sessionEnded')
    expect(accountErrorFrom(apiError(403))).toBe('sessionEnded')
  })

  it('reads details the API did not accept', () => {
    expect(accountErrorFrom(apiError(400, 'VALIDATION_ERROR'))).toBe('invalid')
    expect(accountErrorFrom(apiError(400))).toBe('invalid')
  })

  it('reads a call that never got an answer', () => {
    expect(accountErrorFrom(new AxiosError('Network Error'))).toBe('network')
  })

  it('does not blame the customer for a server fault', () => {
    expect(accountErrorFrom(apiError(500))).toBe('generic')
    expect(accountErrorFrom(apiError(503, 'PICKUP_NOT_PENDING'))).toBe(
      'pickupNotPending',
    )
  })

  it('treats anything that is not an API answer as generic', () => {
    expect(accountErrorFrom(new Error('boom'))).toBe('generic')
    expect(accountErrorFrom(undefined)).toBe('generic')
  })
})

describe('isNotFound', () => {
  it('is true for a 404 only', () => {
    expect(isNotFound(apiError(404))).toBe(true)
    expect(isNotFound(apiError(403))).toBe(false)
    expect(isNotFound(new Error('x'))).toBe(false)
  })
})
