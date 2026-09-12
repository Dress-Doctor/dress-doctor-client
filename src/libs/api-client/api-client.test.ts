import { AxiosError } from 'axios'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import APIClient, {
  errorCodeFrom,
  fieldErrorsFrom,
  withIdempotencyKey,
} from './index'
import type { ApiErrorDto } from './index'
import type { ErrorResponseDto } from '#/interfaces/api-client.dto'
import { adminApi } from './api-instances'

/*
 * The request interceptor forwards the document's cookie during SSR, and in a
 * test `typeof window === 'undefined'` makes it take that branch — which needs
 * TanStack Start's server runtime and throws "No StartEvent found in
 * AsyncLocalStorage" without it. Stubbed to the value it returns in a browser,
 * where the cookie jar belongs to the browser: undefined.
 */
vi.mock('./server-cookies', () => ({
  forwardedCookieHeader: () => undefined,
  relaySetCookie: () => {},
  cookiePairsFrom: (values: string[]) =>
    values.map((value) => value.split(';')[0]).join('; '),
}))

const makeApiError = (data: ErrorResponseDto): ApiErrorDto => {
  const err = new AxiosError<ErrorResponseDto>('Request failed')
  err.response = { data, status: data.statusCode } as ApiErrorDto['response']
  return err
}

describe('envelope unwrap (against the real list shape)', () => {
  /*
   * No network. Axios takes an `adapter` — the piece that actually performs
   * the request — so swapping it for one that answers from memory exercises
   * the real instance, its interceptors and the real unwrapping, and stops at
   * the point where bytes would leave the machine.
   */
  const originalAdapter = adminApi.defaults.adapter

  beforeEach(() => {
    adminApi.defaults.adapter = async (config) => ({
      config,
      status: 200,
      statusText: 'OK',
      headers: {},
      // The envelope exactly as the API sends a list: `total` and `nextPage`
      // beside `data`, which is what the unwrapping has to preserve.
      data: {
        success: true,
        statusCode: 200,
        total: 1,
        nextPage: null,
        data: [{ orderCode: 'OR-TEST01' }],
        message: 'Orders retrieved',
        timestamp: '2026-07-16T12:00:00.000Z',
      },
    })
  })

  afterEach(() => {
    adminApi.defaults.adapter = originalAdapter
  })

  it('getAll returns { total, data[], nextPage } top-level alongside data', async () => {
    const res = await new APIClient<{ orderCode: string }>('/v1/orders').getAll(
      {
        params: { page: 1, size: 20 },
      },
    )
    expect(res.success).toBe(true)
    expect(res.total).toBe(1)
    expect(res.nextPage).toBeNull()
    expect(res.data[0].orderCode).toBe('OR-TEST01')
  })
})

describe('error helpers (nested error envelope)', () => {
  const validationError = makeApiError({
    success: false,
    statusCode: 400,
    error: {
      code: 'VALIDATION_ERROR',
      details: [{ field: 'phone', message: 'Phone must be 9 digit long' }],
    },
    message: 'Validation failed',
    timestamp: '2026-07-16T12:00:00.000Z',
  })

  it('errorCodeFrom reads the stable machine code', () => {
    expect(errorCodeFrom(validationError)).toBe('VALIDATION_ERROR')
  })

  it('fieldErrorsFrom maps details[] for RHF setError', () => {
    expect(fieldErrorsFrom(validationError)).toEqual([
      { field: 'phone', message: 'Phone must be 9 digit long' },
    ])
  })

  it('fieldErrorsFrom is empty for detail-less errors', () => {
    const plain = makeApiError({
      success: false,
      statusCode: 401,
      error: { code: 'UNAUTHENTICATED' },
      message: 'Invalid API credentials',
      timestamp: '2026-07-16T12:00:00.000Z',
    })
    expect(fieldErrorsFrom(plain)).toEqual([])
  })
})

describe('withIdempotencyKey', () => {
  it('adds a unique x-idempotency-key header', () => {
    const a = withIdempotencyKey()
    const b = withIdempotencyKey({ headers: { 'X-Other': '1' } })
    const headerA = (a.headers as Record<string, string>)['x-idempotency-key']
    const headerB = (b.headers as Record<string, string>)['x-idempotency-key']
    expect(headerA).toBeTruthy()
    expect(headerB).toBeTruthy()
    expect(headerA).not.toBe(headerB)
    expect((b.headers as Record<string, string>)['X-Other']).toBe('1')
  })
})
