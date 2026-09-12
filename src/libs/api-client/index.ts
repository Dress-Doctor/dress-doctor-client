import type {
  ErrorResponseDto,
  GetAllSuccessResponseDto,
  SuccessResponseDto,
} from '#/interfaces/api-client.dto'

import type { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios'
import { adminApi } from './api-instances'

export type ApiErrorDto = AxiosError<ErrorResponseDto>

/** Stable machine error code from an API error, or undefined. */
export const errorCodeFrom = (err: ApiErrorDto): string | undefined =>
  err.response?.data.error.code

/**
 * Per-field validation errors from an API error, ready to feed React Hook
 * Form's `setError` — e.g.
 * `fieldErrorsFrom(err).forEach(({ field, message }) => setError(field, { message }))`.
 */
export const fieldErrorsFrom = (
  err: ApiErrorDto,
): { field: string; message: string }[] =>
  err.response?.data.error.details ?? []

/**
 * Money/messaging mutations must carry x-idempotency-key so a retried request
 * can't double-charge (API §2.3). Merge into the request config.
 */
export const withIdempotencyKey = (
  config?: AxiosRequestConfig,
): AxiosRequestConfig => ({
  ...config,
  headers: { ...config?.headers, 'x-idempotency-key': crypto.randomUUID() },
})

/** The API's ChangeReasonGuard bounds — mirror them so the field validates here. */
export const CHANGE_REASON_MIN = 3
export const CHANGE_REASON_MAX = 500

/**
 * Every mutating request says why it was made: the API rejects any
 * POST/PATCH/PUT/DELETE without an `x-change-reason` header of at least
 * `CHANGE_REASON_MIN` characters (CHANGE_REASON_REQUIRED) and records the
 * value on the order's audit trail. Merge into the request config.
 */
export const withChangeReason = (
  reason: string,
  config?: AxiosRequestConfig,
): AxiosRequestConfig => ({
  ...config,
  headers: { ...config?.headers, 'x-change-reason': reason },
})

class APIClient<T, TData = unknown> {
  private readonly endpoint: string
  private readonly api: AxiosInstance = adminApi

  constructor(endpoint: string) {
    this.endpoint = endpoint
  }

  post = (data?: TData, config?: AxiosRequestConfig) => {
    return this.api
      .post<SuccessResponseDto<T>>(this.endpoint, data, config)
      .then((res) => res.data)
  }

  put = (data: TData, config?: AxiosRequestConfig) => {
    return this.api
      .put<SuccessResponseDto<T>>(this.endpoint, data, config)
      .then((res) => res.data)
  }

  patch = (data: TData, config?: AxiosRequestConfig) => {
    return this.api
      .patch<SuccessResponseDto<T>>(this.endpoint, data, config)
      .then((res) => res.data)
  }

  delete = (id: string | number, config?: AxiosRequestConfig) => {
    return this.api
      .delete<SuccessResponseDto<T>>(`${this.endpoint}/${id}`, config)
      .then((res) => res.data)
  }

  /** Paginated list — the API returns { total, data[], nextPage } top-level. */
  getAll = (config?: AxiosRequestConfig) => {
    return this.api
      .get<GetAllSuccessResponseDto<T>>(this.endpoint, config)
      .then((res) => res.data)
  }

  get = (id: string | number, config?: AxiosRequestConfig) => {
    return this.api
      .get<SuccessResponseDto<T>>(`${this.endpoint}/${id}`, config)
      .then((res) => res.data)
  }

  getWithoutId = (config?: AxiosRequestConfig) => {
    return this.api
      .get<SuccessResponseDto<T>>(this.endpoint, config)
      .then((res) => res.data)
  }

  download = (config?: AxiosRequestConfig) => {
    return this.api.get<T>(this.endpoint, config).then((res) => res.data)
  }
}

export default APIClient
