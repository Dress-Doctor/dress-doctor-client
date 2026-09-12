export type OrderStatusCounts = {
  all: number
  draft: number
  ready: number
  washing: number
  received: number
  confirmed: number
  delivered: number
  cancelled: number
}

/**
 * Response envelopes — must mirror the dress-doctor-api contract.
 *
 * Success:  { success, statusCode, data, message, timestamp }
 * Error:    { success:false, statusCode, error:{ code, details? }, message, timestamp }
 *
 * `error.code` is a stable SCREAMING_SNAKE_CASE machine code (switch on it / map to
 * i18n). `error.details[]` carries per-field validation messages — map onto form
 * fields (see `fieldErrorsFrom` in libs/api-client). `message` is already localized
 * server-side via Accept-Language, so it's safe to show directly.
 */
export interface SuccessResponseDto<T> {
  success: true
  statusCode: number
  data?: T
  message: string
  timestamp: string
}

/**
 * Paginated list envelope. NOTE: verify this shape against a live Swagger list
 * response before relying on it — the API's response interceptor adds pagination
 * fields alongside `data`; confirm whether they are top-level (`total`/`nextPage`)
 * or nested, and adjust here to match reality (Swagger wins).
 */
export interface GetAllSuccessResponseDto<T> {
  success: true
  statusCode: number
  data: T[]
  total?: number
  nextPage?: number
  message: string
  timestamp: string
}

export interface ErrorDetailDto {
  /** Dotted field path, e.g. `items.0.qty` */
  field: string
  message: string
}

export interface ErrorResponseDto {
  success: false
  statusCode: number
  error: {
    code: string
    details?: ErrorDetailDto[]
    /**
     * Set when a business rule (not a validation failure) is about one
     * specific field — e.g. DRAFT_EXISTS naming `customerId`. Validation
     * failures use `details[]` instead.
     */
    field?: string
  }
  message: string
  timestamp: string
}
