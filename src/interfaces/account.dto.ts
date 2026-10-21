/**
 * What the customer's account pages read and send. It mirrors the safe,
 * customer-only answers of dress-doctor-api: `GET /v1/customers/me`, the
 * customer's own orders, `/v1/pickups/mine` and `/v1/subscriptions`.
 *
 * Each of those is an allow-list, so a field is only here when the API sends
 * it to a customer. Nothing staff wrote about the customer is in any of them.
 */

export type OrderStatusDto =
  | 'DRAFT'
  | 'CONFIRMED'
  | 'RECEIVED'
  | 'WASHING'
  | 'READY'
  | 'DELIVERED'
  | 'CANCELLED'

export type PaymentStatusDto = 'UNPAID' | 'PARTIAL' | 'PAID'

export type PickupStatusDto =
  'PENDING' | 'CONFIRMED' | 'ASSIGNED' | 'PICKED_UP' | 'CANCELLED'

export type PlanStatusDto =
  'PENDING' | 'ACTIVE' | 'PAUSED' | 'CANCELLED' | 'EXPIRED'

export type BillingCycleDto = 'MONTHLY' | 'QUARTERLY'

/** What a plan counts: whole pieces of clothing, or kilograms of laundry. */
export type QuotaTypeDto = 'PIECES' | 'WEIGHT_KG'

export type LanguageDto = 'en' | 'fr'

/** The customer's own profile, from `GET /v1/customers/me`. */
export interface MyProfileDto {
  /** The code the profile is edited by, e.g. `CU-AH7LCH`. */
  customerCode: string
  firstName: string
  lastName: string
  gender?: string
  /** Digits with the country code. Absent for a customer reached through a contact. */
  phone?: string
  whatsappPhone?: string
  email?: string
  /** The phone was typed on a form and no code has ever reached it. */
  phoneUnverified: boolean
  preferredLanguage: LanguageDto
  pickupAddress?: string
  notificationsOptIn: boolean
}

/** What a customer may change about themselves. The contacts are not here. */
export interface UpdateProfileDataDto {
  preferredLanguage?: LanguageDto
  pickupAddress?: string
  notificationsOptIn?: boolean
}

/** The paging the account lists take. */
export interface PageParamsDto {
  page?: number
  size?: number
}

/** One page of a list, as the API sends it. `nextPage` is empty on the last. */
export interface PageDto<T> {
  data: T[]
  total: number
  nextPage?: number | null
}

/** The pickup an order came off, when it came off one. */
export interface OrderPickupLinkDto {
  reference: string
  pickupDate: string
}

/** One row of the customer's order list. */
export interface MyOrderRowDto {
  _id: string
  /** The code the customer reads out and the receipt carries, e.g. `OR-A4F92C`. */
  orderCode: string
  receivedAt?: string
  createdAt: string
  deliveredAt?: string
  estimatedDeliveryDate?: string
  totalAmount: number
  amountPaid: number
  balanceDue: number
  paymentStatus: PaymentStatusDto
  pickup?: OrderPickupLinkDto
  status: OrderStatusDto | null
  /** Garments on the order, counted by piece. */
  items: number
}

export interface MyOrderItemDto {
  _id: string
  quantity: number
  unitPrice: number
  lineTotal: number
  condition?: string
  colour?: string
  item?: {
    itemName: string
    /** The name with its filing: `T-Shirt (Men - Tops)`. */
    displayName?: string
    service?: { serviceName: string }
    serviceType?: { serviceTypeName: string }
  }
}

export interface MyPaymentDto {
  _id: string
  reference?: string
  amount: number
  paidAt: string
  paymentMethod?: { paymentMethodName: string }
  paymentType?: { paymentTypeName: string }
}

export type PricingModelDto = 'PER_PIECE' | 'PER_KG' | 'SUBSCRIPTION' | 'FREE'

/** One order, from `GET /v1/orders/:orderCode`, cut down to what its customer may read. */
export interface MyOrderDto {
  _id: string
  orderCode: string
  currency?: { isoCode: string; symbol?: string }
  orderStatus?: { orderStatusName: OrderStatusDto }
  pricingModel: PricingModelDto
  totalWeightKg?: number
  orderItems?: MyOrderItemDto[]
  /** What the items add up to, before any discount. */
  orderAmount: number
  totalAmount: number
  amountPaid: number
  balanceDue: number
  paymentStatus: PaymentStatusDto
  receivedAt?: string
  estimatedDeliveryDate?: string
  deliveredAt?: string
  createdAt: string
  payments: MyPaymentDto[]
  pickupRequest?: {
    reference: string
    pickupDate: string
    pickupTime: string
    pickupAddress: string
  }
}

/** One of the customer's own pickup requests. */
export interface MyPickupDto {
  reference: string
  pickupDate: string
  /** The window, as the API spells it: `MORNING 8AM - 12PM`. */
  pickupTime: string
  pickupAddress: string
  /** What the customer chose when they asked. Absent on older pickups. */
  pricingModel?: PricingModelDto
  status: PickupStatusDto
  createdAt: string
  /** The orders raised off this pickup. */
  orderCodes: string[]
}

/** The plan a subscription points at, as the list joins it in. */
export interface MyPlanDto {
  _id: string
  planName: string
  /** `basic-pieces-monthly`: the tier, what it counts, how often it bills. */
  code?: string
  price: number
  billingCycle: BillingCycleDto
  quotaType: QuotaTypeDto
  quotaAmount: number
}

/** One of the customer's own plans, or plan requests. */
export interface MySubscriptionDto {
  _id: string
  status: PlanStatusDto
  planId?: MyPlanDto | null
  billingCycle: BillingCycleDto
  quotaType: QuotaTypeDto
  quotaAmount: number
  /** What the customer pays each cycle, as it was when they asked. */
  price?: number
  remainingQuota: number
  /** Whether the allowance is used up. Separate from `status`. */
  consumptionStatus?: 'AVAILABLE' | 'CONSUMED'
  /** Set on an ended plan: its date passed, or its allowance ran out. */
  expiredReason?: 'DATE' | 'CONSUMED'
  /** Empty until staff confirm the request. */
  currentPeriodStart?: string
  currentPeriodEnd?: string
  /** The period the plan is in, with its fee and what has been paid. */
  currentPeriod?: MyPlanPeriodDto | null
  /** The customer has already said yes to another period. */
  renewalConfirmed?: boolean
  /** The plan is ending (or has ended) and needs the customer's answer. */
  awaitingRenewal?: boolean
  /** Owed across every period that has started, net of waivers. */
  totalOutstanding?: number
  createdAt: string
}

/** One billing period of a plan: its fee and how much of it has been paid. */
export interface MyPlanPeriodDto {
  planPrice: number
  amountPaid: number
  /** What is still to pay. Worked out by the API. */
  outstanding: number
  paymentStatus: 'UNPAID' | 'PARTIALLY_PAID' | 'PAID' | 'WAIVED'
  /** Set when the customer confirmed this period and a payment date was agreed. */
  renewal?: { confirmedAt: string; paymentDueAt?: string }
  startsAt: string
  endsAt: string
}
