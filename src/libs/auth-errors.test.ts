import { AxiosError } from 'axios'
import { describe, expect, it } from 'vitest'
import { isUnauthenticated, loginErrorFrom } from './auth-errors'

/** An error as axios builds it when the API answers with a status. */
function apiError(status: number, code: string, message = 'Failed') {
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
      message,
      timestamp: '2026-10-14T10:00:00.000Z',
    },
  }
  return error
}

describe('loginErrorFrom', () => {
  it('reads an unknown account when asking for a code', () => {
    const error = apiError(401, 'INVALID_CREDENTIALS')
    expect(loginErrorFrom(error, 'request')).toEqual({ kind: 'notFound' })
  })

  it('reads a wrong or old code when checking one', () => {
    const error = apiError(401, 'UNAUTHENTICATED')
    expect(loginErrorFrom(error, 'verify')).toEqual({ kind: 'codeWrong' })
  })

  it('reads a stopped account, whichever step it comes from', () => {
    const error = apiError(403, 'ACCOUNT_INACTIVE')
    expect(loginErrorFrom(error, 'request')).toEqual({ kind: 'inactive' })
    expect(loginErrorFrom(error, 'verify')).toEqual({ kind: 'inactive' })
  })

  it('reads a locked account', () => {
    const error = apiError(403, 'FORBIDDEN')
    expect(loginErrorFrom(error, 'request')).toEqual({ kind: 'locked' })
  })

  it('takes the minutes from a cool-down', () => {
    const error = apiError(
      400,
      'BAD_REQUEST',
      'Please wait for 10 minute(s) before requesting another code.',
    )
    expect(loginErrorFrom(error, 'request')).toEqual({
      kind: 'wait',
      minutes: 10,
    })
  })

  it('still reads a cool-down that names no minutes', () => {
    const error = apiError(400, 'BAD_REQUEST', 'Slow down')
    expect(loginErrorFrom(error, 'verify')).toEqual({
      kind: 'wait',
      minutes: undefined,
    })
  })

  it('tells a badly typed identifier from a cool-down', () => {
    const error = apiError(400, 'VALIDATION_ERROR', 'Validation failed')
    expect(loginErrorFrom(error, 'request')).toEqual({ kind: 'invalid' })
  })

  it('reads a call that got no answer as the network', () => {
    const error = new AxiosError('Network Error')
    expect(loginErrorFrom(error, 'request')).toEqual({ kind: 'network' })
  })

  it('keeps a server fault and a stray error generic', () => {
    expect(
      loginErrorFrom(apiError(500, 'INTERNAL_SERVER_ERROR'), 'verify'),
    ).toEqual({ kind: 'generic' })
    expect(loginErrorFrom(new Error('boom'), 'verify')).toEqual({
      kind: 'generic',
    })
  })
})

describe('isUnauthenticated', () => {
  it('is true for a 401 and a 403', () => {
    expect(isUnauthenticated(apiError(401, 'UNAUTHENTICATED'))).toBe(true)
    expect(isUnauthenticated(apiError(403, 'FORBIDDEN'))).toBe(true)
  })

  it('is false for a fault that is not about who is asking', () => {
    expect(isUnauthenticated(apiError(500, 'INTERNAL_SERVER_ERROR'))).toBe(
      false,
    )
    expect(isUnauthenticated(new AxiosError('Network Error'))).toBe(false)
    expect(isUnauthenticated(new Error('boom'))).toBe(false)
  })
})
