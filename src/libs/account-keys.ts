/**
 * The query keys for everything on the account pages, in one place so a change
 * can say exactly what it makes stale. All of them start with `account`, so
 * one call can drop the lot.
 */
export const accountKeys = {
  all: ['account'] as const,
  profile: ['account', 'profile'] as const,
  orders: (customerCode: string) =>
    ['account', 'orders', customerCode] as const,
  order: (orderCode: string) => ['account', 'order', orderCode] as const,
  pickups: ['account', 'pickups'] as const,
  subscriptions: ['account', 'subscriptions'] as const,
}
