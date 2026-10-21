import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { InternalAxiosRequestConfig } from 'axios'
import { adminApi } from './api-client/api-instances'
import accountApi from './account.api'

// See api-client.test.ts: the SSR cookie forwarding needs the Start runtime.
vi.mock('./api-client/server-cookies', () => ({
  forwardedCookieHeader: () => undefined,
  relaySetCookie: () => {},
  cookiePairsFrom: (values: string[]) =>
    values.map((value) => value.split(';')[0]).join('; '),
}))

describe('the customer’s account calls', () => {
  const originalAdapter = adminApi.defaults.adapter
  let seen: InternalAxiosRequestConfig[] = []
  let answer: unknown = {}
  let listAnswer: unknown = undefined

  beforeEach(() => {
    seen = []
    answer = {}
    listAnswer = undefined
    adminApi.defaults.adapter = async (config) => {
      seen.push(config)
      return {
        config,
        status: 200,
        statusText: 'OK',
        headers: {},
        data: listAnswer ?? {
          success: true,
          statusCode: 200,
          data: answer,
          message: 'ok',
          timestamp: '2026-10-17T10:00:00.000Z',
        },
      }
    }
  })

  afterEach(() => {
    adminApi.defaults.adapter = originalAdapter
  })

  const headerOf = (config: InternalAxiosRequestConfig, name: string) =>
    (config.headers as unknown as Record<string, string>)[name]

  const bodyOf = (config: InternalAxiosRequestConfig) =>
    JSON.parse(String(config.data)) as Record<string, unknown>

  it('names the customer portal on every call', async () => {
    answer = { customerCode: 'CU-1' }
    await accountApi.profile()
    await accountApi.updateProfile('CU-1', { preferredLanguage: 'fr' })
    listAnswer = {
      success: true,
      statusCode: 200,
      data: [],
      total: 0,
      message: '',
      timestamp: '',
    }
    await accountApi.orders('CU-1')
    await accountApi.pickups()
    await accountApi.subscriptions()
    await accountApi.cancelPickup('PU-1')
    await accountApi.pausePlan('s1')

    expect(seen.length).toBeGreaterThan(5)
    for (const config of seen) {
      expect(headerOf(config, 'x-portal')).toBe('customer')
    }
  })

  it('reads the profile from the customer’s own route, with no id to forge', async () => {
    answer = { customerCode: 'CU-1' }
    await accountApi.profile()

    expect(seen[0].url).toBe('/v1/customers/me')
    expect(seen[0].method).toBe('get')
  })

  it('refuses an empty profile answer', async () => {
    answer = undefined
    await expect(accountApi.profile()).rejects.toThrow()
  })

  it('saves only what it is given, with a reason, to the customer’s code', async () => {
    await accountApi.updateProfile('CU-AH7LCH', { notificationsOptIn: false })

    expect(seen[0].url).toBe('/v1/customers/CU-AH7LCH')
    expect(seen[0].method).toBe('patch')
    expect(bodyOf(seen[0])).toEqual({ notificationsOptIn: false })
    expect(headerOf(seen[0], 'x-change-reason')).toMatch(/customer/i)
  })

  it('asks for a page of orders, by the customer’s code', async () => {
    listAnswer = {
      success: true,
      statusCode: 200,
      data: [{ orderCode: 'OR-1' }],
      total: 11,
      nextPage: 2,
      message: '',
      timestamp: '',
    }
    const page = await accountApi.orders('CU-1', { page: 1, size: 10 })

    expect(seen[0].url).toBe('/v1/customers/CU-1/orders')
    expect(seen[0].params).toEqual({ page: 1, size: 10 })
    expect(page).toEqual({
      data: [{ orderCode: 'OR-1' }],
      total: 11,
      nextPage: 2,
    })
  })

  it('reports no next page on the last one', async () => {
    listAnswer = {
      success: true,
      statusCode: 200,
      data: [],
      message: '',
      timestamp: '',
    }
    const page = await accountApi.pickups()

    expect(page.nextPage).toBeNull()
    expect(page.total).toBe(0)
  })

  it('keeps a code with odd characters from changing the path', async () => {
    await accountApi.order('OR-1/../x')
    expect(seen[0].url).toBe('/v1/orders/OR-1%2F..%2Fx')
  })

  it('fetches the receipt as a PDF in the reader’s language', async () => {
    await accountApi.receipt('OR-1', 'fr')

    expect(seen[0].url).toBe('/v1/orders/OR-1/receipt')
    expect(seen[0].params).toEqual({ language: 'fr', format: 'pdf' })
    expect(seen[0].responseType).toBe('blob')
  })

  it('cancels a pickup through the customer’s own route, with a reason', async () => {
    await accountApi.cancelPickup('PU-A4F92C')

    expect(seen[0].url).toBe('/v1/pickups/mine/PU-A4F92C/cancel')
    expect(seen[0].method).toBe('post')
    expect(headerOf(seen[0], 'x-change-reason')).toMatch(/pickup/i)
  })

  it('asks for the newest plans first, and only one status when told', async () => {
    listAnswer = {
      success: true,
      statusCode: 200,
      data: [],
      message: '',
      timestamp: '',
    }
    await accountApi.subscriptions('PENDING')

    expect(seen[0].url).toBe('/v1/subscriptions')
    expect(seen[0].params).toMatchObject({
      sort: 'createdAt:desc',
      status: 'PENDING',
    })
  })

  it('pauses, resumes and cancels a plan, each with its own reason', async () => {
    await accountApi.pausePlan('s1')
    await accountApi.resumePlan('s1')
    await accountApi.cancelPlan('s1')

    expect(seen.map((config) => config.url)).toEqual([
      '/v1/subscriptions/s1/pause',
      '/v1/subscriptions/s1/resume',
      '/v1/subscriptions/s1/cancel',
    ])
    expect(headerOf(seen[0], 'x-change-reason')).toMatch(/paused/i)
    expect(headerOf(seen[1], 'x-change-reason')).toMatch(/resumed/i)
    expect(headerOf(seen[2], 'x-change-reason')).toMatch(/cancelled/i)
  })
})
