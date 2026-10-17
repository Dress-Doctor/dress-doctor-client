import type {
  OrderStatusDto,
  PaymentStatusDto,
  PickupStatusDto,
  PlanStatusDto,
} from '#/interfaces/account.dto'
import type { AccountErrorKindDto } from '#/libs/account-errors'
import type { FileRoutesByTo } from '#/routeTree.gen'
import { sitePaths } from '#/data/site.data'
import { m } from '#/paraglide/messages'

/** How loud a status pill is. Nothing here is an error the customer caused. */
export type StatusToneDto =
  'neutral' | 'info' | 'success' | 'warning' | 'danger'

export interface StatusViewDto {
  label: () => string
  tone: StatusToneDto
}

/**
 * What each status is called to a customer, and how it looks.
 *
 * The words are the customer's, not the shop's: staff say "RECEIVED" and
 * "WASHING", a customer reads "We have your clothes" and "Being cleaned".
 * The API's own spelling is never shown.
 */
export const orderStatusView: Record<OrderStatusDto, StatusViewDto> = {
  DRAFT: { label: m.account_orderStatus_draft, tone: 'neutral' },
  CONFIRMED: { label: m.account_orderStatus_confirmed, tone: 'info' },
  RECEIVED: { label: m.account_orderStatus_received, tone: 'info' },
  WASHING: { label: m.account_orderStatus_washing, tone: 'info' },
  READY: { label: m.account_orderStatus_ready, tone: 'success' },
  DELIVERED: { label: m.account_orderStatus_delivered, tone: 'success' },
  CANCELLED: { label: m.account_orderStatus_cancelled, tone: 'danger' },
}

export const paymentStatusView: Record<PaymentStatusDto, StatusViewDto> = {
  UNPAID: { label: m.account_paymentStatus_unpaid, tone: 'warning' },
  PARTIAL: { label: m.account_paymentStatus_partial, tone: 'warning' },
  PAID: { label: m.account_paymentStatus_paid, tone: 'success' },
}

export const pickupStatusView: Record<PickupStatusDto, StatusViewDto> = {
  PENDING: { label: m.account_pickupStatus_pending, tone: 'warning' },
  CONFIRMED: { label: m.account_pickupStatus_confirmed, tone: 'success' },
  ASSIGNED: { label: m.account_pickupStatus_assigned, tone: 'success' },
  PICKED_UP: { label: m.account_pickupStatus_pickedUp, tone: 'success' },
  CANCELLED: { label: m.account_pickupStatus_cancelled, tone: 'danger' },
}

export const planStatusView: Record<PlanStatusDto, StatusViewDto> = {
  PENDING: { label: m.account_planStatus_pending, tone: 'warning' },
  ACTIVE: { label: m.account_planStatus_active, tone: 'success' },
  PAUSED: { label: m.account_planStatus_paused, tone: 'neutral' },
  CANCELLED: { label: m.account_planStatus_cancelled, tone: 'danger' },
  EXPIRED: { label: m.account_planStatus_expired, tone: 'neutral' },
}

/**
 * The steps an order moves through, in order. A cancelled or draft order is on
 * none of them.
 */
export const orderSteps = [
  'CONFIRMED',
  'RECEIVED',
  'WASHING',
  'READY',
  'DELIVERED',
] as const satisfies readonly OrderStatusDto[]

/** The five sections of the account, in the order the navigation lists them. */
export const accountSections = [
  { id: 'details', to: sitePaths.account, label: m.account_nav_details },
  {
    id: 'orders',
    to: sitePaths.accountOrders,
    label: m.account_nav_orders,
  },
  {
    id: 'subscription',
    to: sitePaths.accountSubscription,
    label: m.account_nav_subscription,
  },
  {
    id: 'pickups',
    to: sitePaths.accountPickups,
    label: m.account_nav_pickups,
  },
] as const satisfies readonly {
  id: string
  to: keyof FileRoutesByTo
  label: () => string
}[]

/** What each way an account call can fail is called, in words the customer reads. */
export const accountErrorText: Record<AccountErrorKindDto, () => string> = {
  sessionEnded: m.account_error_sessionEnded,
  pickupNotPending: m.account_error_pickupNotPending,
  planChanged: m.account_error_planChanged,
  invalid: m.account_error_invalid,
  network: m.account_error_network,
  generic: m.account_error_generic,
}
