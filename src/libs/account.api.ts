import type {
  MyOrderDto,
  MyOrderRowDto,
  MyPickupDto,
  MyProfileDto,
  MySubscriptionDto,
  PageDto,
  PageParamsDto,
  PlanStatusDto,
  UpdateProfileDataDto,
} from '#/interfaces/account.dto'
import type { GetAllSuccessResponseDto } from '#/interfaces/api-client.dto'
import APIClient, { withChangeReason } from '#/libs/api-client'

/** A page of a list, with the gaps the envelope may leave filled in. */
const pageOf = <T>(response: GetAllSuccessResponseDto<T>): PageDto<T> => ({
  data: response.data,
  total: response.total ?? response.data.length,
  nextPage: response.nextPage ?? null,
})

/** The newest first, which is the order a customer expects to read a list in. */
const newestFirst = 'createdAt:desc'

/**
 * The calls behind the customer's account pages.
 *
 * The session is the HttpOnly cookie, and `x-portal: customer` goes on every
 * request (see `api-instances.ts`), so each of these is the signed-in
 * customer's own. None of them takes a customer id: the API reads who is asking
 * from the session, which is why a customer cannot ask for somebody else's.
 *
 * The answers are the API's customer-only views. A reason goes on each change,
 * because the API refuses a change without one and keeps it in the audit trail.
 */
const accountApi = {
  /** Who the customer is, and the code the profile is edited by. */
  profile: async () => {
    const response = await new APIClient<MyProfileDto>(
      '/v1/customers/me',
    ).getWithoutId()
    if (!response.data) throw new Error('The profile answer was empty')
    return response.data
  },

  /** Language, saved address and notifications. The contacts cannot be sent. */
  updateProfile: (customerCode: string, data: UpdateProfileDataDto) =>
    new APIClient<unknown, UpdateProfileDataDto>(
      `/v1/customers/${encodeURIComponent(customerCode)}`,
    ).patch(
      data,
      withChangeReason('Details changed by the customer on the website'),
    ),

  orders: async (customerCode: string, { page = 1, size = 10 } = {}) =>
    pageOf(
      await new APIClient<MyOrderRowDto>(
        `/v1/customers/${encodeURIComponent(customerCode)}/orders`,
      ).getAll({ params: { page, size } }),
    ),

  order: async (orderCode: string) => {
    const response = await new APIClient<MyOrderDto>('/v1/orders').get(
      encodeURIComponent(orderCode),
    )
    if (!response.data) throw new Error('The order answer was empty')
    return response.data
  },

  /**
   * The receipt as a PDF. It is fetched, not linked to: the API wants the
   * platform key and the session on the request, and a plain link sends
   * neither.
   */
  receipt: (orderCode: string, language: 'en' | 'fr') =>
    new APIClient<Blob>(
      `/v1/orders/${encodeURIComponent(orderCode)}/receipt`,
    ).download({
      params: { language, format: 'pdf' },
      responseType: 'blob',
    }),

  pickups: async ({ page = 1, size = 10 }: PageParamsDto = {}) =>
    pageOf(
      await new APIClient<MyPickupDto>('/v1/pickups/mine').getAll({
        params: { page, size },
      }),
    ),

  /** Only while the request is still waiting for our call. */
  cancelPickup: (reference: string) =>
    new APIClient<unknown, Record<string, never>>(
      `/v1/pickups/mine/${encodeURIComponent(reference)}/cancel`,
    ).post(
      {},
      withChangeReason('Pickup cancelled by the customer on the website'),
    ),

  /** All of the customer's plans and plan requests, newest first. */
  subscriptions: async (status?: PlanStatusDto) =>
    pageOf(
      await new APIClient<MySubscriptionDto>('/v1/subscriptions').getAll({
        params: { page: 1, size: 20, sort: newestFirst, status },
      }),
    ),

  pausePlan: (id: string) => planAction(id, 'pause', 'paused'),
  resumePlan: (id: string) => planAction(id, 'resume', 'resumed'),
  /** Ends a live plan, or withdraws a request still waiting for us. */
  cancelPlan: (id: string) => planAction(id, 'cancel', 'cancelled'),
}

function planAction(
  id: string,
  action: 'pause' | 'resume' | 'cancel',
  past: string,
) {
  return new APIClient<unknown, Record<string, never>>(
    `/v1/subscriptions/${encodeURIComponent(id)}/${action}`,
  ).post({}, withChangeReason(`Plan ${past} by the customer on the website`))
}

export default accountApi
