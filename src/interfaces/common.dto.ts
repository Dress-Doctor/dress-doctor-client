export type FormatDto = 'csv' | 'excel'
export type OrderStatusTypeDto =
  | 'DRAFT'
  | 'CONFIRMED'
  | 'RECEIVED'
  | 'WASHING'
  | 'READY'
  | 'DELIVERED'
  | 'CANCELLED'

export type PaymentStatusTypeDto = 'UNPAID' | 'PARTIAL' | 'PAID' | 'OVERPAID'

/**
 * The API's `PickupStatusEnum`. `CONFIRMED` and `CANCELLED` are spelled the
 * same as the order statuses and share their colour and label — a confirmed
 * pickup and a confirmed order mean the same thing to whoever reads the row.
 */
export type PickupStatusTypeDto =
  'PENDING' | 'CONFIRMED' | 'ASSIGNED' | 'PICKED_UP' | 'CANCELLED'

/**
 * The API's `PickupTimeEnum` verbatim — the value *is* the window, so it is
 * stored and filtered as this whole string, not as `MORNING`.
 */
export type PickupTimeDto =
  'MORNING 8AM - 12PM' | 'AFTERNOON 12PM - 5PM' | 'EVENING 5PM - 8PM'

export type AppStatusTypeDto =
  | PaymentStatusTypeDto
  | OrderStatusTypeDto
  | PickupStatusTypeDto
  | 'ACTIVE'
  | 'INACTIVE'

export type PropsWithLoaders = { isLoading?: boolean; isFetching?: boolean }
export type DialCodeDataDto = {
  flag: string
  /** ISO 3166-1 alpha-2 country code. */
  country: string
  /** The country's name, as the picker lists it. */
  name: string
  /** Dialling code, including the leading `+`. */
  dialCode: string
  /** Expected length of the local (national) number. */
  nationalLength: number
}

export type LanguageDto = 'en' | 'fr'
export type LanguageDataDto = {
  flag: string
  label: string
  value: LanguageDto
}

/**
 * List query params serialised to the API's PaginationDto contract:
 * `page` (1-based), `size` (≤100), `sort` ("field:asc,other:desc"),
 * plus per-endpoint filters (customerId, orderStatusId, q, …).
 */
export type ListParamsDto = {
  page?: number
  size?: number
  sort?: string
}

export type CurrencyDto = {
  _id: string
  isoCode: string
  countryName: string
  createdAt: string
  decimalPlaces: number
  isActive: boolean
  name: string
  numericCode: number
  symbol: string
  updatedAt: string
}

export type OfficeDto = {
  _id: string
  slug: string
  address: string
  city: string
  isActive: boolean
  officeCode: string
  officeName: string
  officeTypeId: string
  region: string
}

export interface OrderStatusDto {
  _id: string
  createdAt: string
  updatedAt: string
  isActive: boolean
  description?: string
  orderStatusName: OrderStatusTypeDto
}

export interface ServiceTypeDto {
  _id: string
  serviceTypeName: string
  description?: string
}

export type PaymentModeDto = 'BB' | 'Cash' | 'MTN Momo' | 'Orange Money'
