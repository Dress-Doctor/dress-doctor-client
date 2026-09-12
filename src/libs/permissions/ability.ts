import { createMongoAbility } from '@casl/ability'
import type { MongoAbility, RawRuleOf } from '@casl/ability'
import type { AbilityRuleDto } from '#/interfaces/login.dto'

/**
 * Client CASL mirror built from `/v1/auth/me` `abilities` (the API's
 * serialised rules — conditions arrive already interpolated server-side).
 * Gates nav + routes for UX ONLY — the server is the real enforcer;
 * visibility never implies authorisation.
 *
 * Same createMongoAbility the API uses, so `manage`/`all` wildcards and
 * subject-type checks behave identically. A type-level `can('READ','Order')`
 * check matches conditional rules too — exactly what nav gating needs.
 */
export type AppAbility = MongoAbility<[string, string]>

export function buildAbility(rules: AbilityRuleDto[]): AppAbility {
  return createMongoAbility<[string, string]>(rules as RawRuleOf<AppAbility>[])
}

/**
 * Mirrors the API's `PermissionActionEnum` *values*. `manage` is lowercase on
 * purpose — that is the spelling CASL treats as "every action", and the server
 * enum spells it that way too (`MANAGE = 'manage'`).
 */
export type PermissionAction =
  | 'READ'
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'ASSIGN'
  | 'manage'
  | 'UNLOCK'
  | 'CONFIRM'
  | 'EXPORT'

/**
 * Mirrors the API's `SubjectEnum`. `can()` compares subjects as exact strings,
 * so a subject the server never emits is not a failed check — it is a check
 * that can only ever pass via a `manage`/`all` wildcard. Spelling these out
 * turns that class of typo into a compile error.
 *
 * Keep in step with the API enum; there is no shared package to import from.
 */
export type PermissionSubject =
  | 'all'
  | 'OtpRequest'
  | 'OtpSecurityState'
  | 'AffiliatePartner'
  | 'AffiliateTransaction'
  | 'Role'
  | 'ApiClient'
  | 'Permission'
  | 'RolePermission'
  | 'User'
  | 'UserType'
  | 'UserRole'
  | 'Customer'
  | 'Office'
  | 'OfficeUser'
  | 'OfficeType'
  | 'PickupStatus'
  | 'PickupRequest'
  | 'PickupAssignment'
  | 'Order'
  | 'OrderItem'
  | 'OrderStatus'
  | 'Payment'
  | 'PaymentType'
  | 'PaymentMethod'
  | 'Promo'
  | 'PromoCodeUsage'
  | 'Item'
  | 'Service'
  | 'Category'
  | 'Currency'
  | 'SubCategory'
  | 'ServiceType'
  | 'FollowUp'
  | 'RewardRule'
  | 'RewardTier'
  | 'RewardLedger'
  | 'Subscription'
  | 'SubscriptionPlan'
  | 'Activity'

/** Sidebar/route gate descriptor: [action, subject]. */
export type RequiredPermission = readonly [PermissionAction, PermissionSubject]

export const PERMISSIONS = {
  orders: ['READ', 'Order'],
  ordersCreate: ['CREATE', 'Order'],
  /**
   * Every status move is an UPDATE on the order — forward, corrected or
   * cancelled alike. The API dropped its separate CONFIRM action because no
   * role was ever seeded with it.
   */
  ordersUpdate: ['UPDATE', 'Order'],
  /** Garment lines are their own subject: crud(Order) does not imply them. */
  orderItemsCreate: ['CREATE', 'OrderItem'],
  orderItemsUpdate: ['UPDATE', 'OrderItem'],
  orderItemsDelete: ['DELETE', 'OrderItem'],
  payments: ['READ', 'Payment'],
  paymentsCreate: ['CREATE', 'Payment'],
  /**
   * What the customer owes. The API asks for this on top of `UPDATE Order`
   * before it will take an agreed amount or a manual discount, so the two
   * money fields on the edit panel are gated on it separately.
   */
  paymentsUpdate: ['UPDATE', 'Payment'],
  /** Customers file pickups; staff read the queue and work it from here. */
  pickups: ['READ', 'PickupRequest'],
  /** The call-back: PENDING → CONFIRMED. Its own action, not `UPDATE`. */
  pickupsConfirm: ['CONFIRM', 'PickupRequest'],
  /** Putting an agent on the round is an act on the assignment, not the request. */
  pickupsAssign: ['ASSIGN', 'PickupAssignment'],
  /** Calling the collection off goes through plain `UPDATE`, unlike confirm. */
  pickupsCancel: ['UPDATE', 'PickupRequest'],
  customers: ['READ', 'Customer'],
  customersCreate: ['CREATE', 'Customer'],
  /**
   * Correcting a customer's contact details and preferences. The API's own
   * `UpdateProfileDto` is the narrower gate: names and the phone number are
   * not in it, so this permission cannot rewrite an identity.
   */
  customersUpdate: ['UPDATE', 'Customer'],
  /**
   * The reference screen. Read on the user types is what the whole page is
   * gated on: the other three collections are lookups every signed-in role
   * already reads to fill a picker, so they add nothing to the gate.
   */
  reference: ['READ', 'UserType'],

  /*
   * Reading the lookups themselves.
   *
   * These gate the *fetch*, not a screen: the pickers they fill are spread
   * across drawers that mount with their page, so an unguarded lookup fires on
   * every visit whether the drawer is opened or not. A role without the read
   * — an Office Manager has no `READ Currency` — collected a refusal and a red
   * toast on a page that was otherwise working perfectly.
   *
   * Not every role holds every one of these, which is the whole point. The
   * server decides; this only decides whether it is worth asking.
   */
  readCurrencies: ['READ', 'Currency'],
  readItems: ['READ', 'Item'],
  readServiceTypes: ['READ', 'ServiceType'],
  readOrderStatuses: ['READ', 'OrderStatus'],
  readPickupStatuses: ['READ', 'PickupStatus'],
  readPaymentMethods: ['READ', 'PaymentMethod'],
  readPaymentTypes: ['READ', 'PaymentType'],
  readOfficeTypes: ['READ', 'OfficeType'],
  readUserTypes: ['READ', 'UserType'],
  readRoles: ['READ', 'Role'],
  /** Adding a user type. Reference data, but a write like any other. */
  userTypesCreate: ['CREATE', 'UserType'],
  /**
   * Adding a pickup status. The list itself is read through
   * `READ PickupRequest` — it is the picker lookup a driver needs — but the
   * reference screen's own reads and writes are gated on the narrower subject.
   */
  pickupStatusesCreate: ['CREATE', 'PickupStatus'],
  /**
   * Rewording a pickup status or switching it off. There is no rename here:
   * the API's update DTO has no `pickupStatusName`, because the pickup and
   * order services match the seeded rows by that exact string.
   */
  pickupStatusesUpdate: ['UPDATE', 'PickupStatus'],
  /**
   * Adding an order status. Reading the list is `READ OrderStatus`, which
   * every role that may touch an order already holds — the reference screen's
   * own writes are what this and the next one gate.
   */
  orderStatusesCreate: ['CREATE', 'OrderStatus'],
  /**
   * Rewording an order status or switching it off. No rename here either: the
   * API's update DTO has no `orderStatusName`, because `order.service` runs
   * the order state machine off that exact string.
   */
  orderStatusesUpdate: ['UPDATE', 'OrderStatus'],
  /**
   * Adding an office type. Reading the list is `READ OfficeType`, which any
   * role that may open a branch already holds — `POST /offices` takes an
   * `officeTypeId`, so the picker behind it has to be able to list them.
   */
  officeTypesCreate: ['CREATE', 'OfficeType'],
  /**
   * Rewording an office type or switching it off. No rename here either: the
   * API's update DTO has no `officeTypeName`, because `api-client.guard.ts`
   * finds FACTORY by that exact string and the office list filter resolves a
   * type the same way.
   */
  officeTypesUpdate: ['UPDATE', 'OfficeType'],
  /** Adding a payment method. Reading the list is `READ PaymentMethod`. */
  paymentMethodsCreate: ['CREATE', 'PaymentMethod'],
  /**
   * Rewording a payment method or switching it off. No rename: the API's
   * update DTO has no `paymentMethodName`, because the payment list's method
   * filter matches on that exact string.
   */
  paymentMethodsUpdate: ['UPDATE', 'PaymentMethod'],
  /** Adding a payment type. Reading the list is `READ PaymentType`. */
  paymentTypesCreate: ['CREATE', 'PaymentType'],
  /**
   * Rewording a payment type or switching it off. No rename here either: the
   * API tells a refund from a payment by that exact string, so a rename would
   * report the money wrong.
   */
  paymentTypesUpdate: ['UPDATE', 'PaymentType'],
  /**
   * Rewording a user type or switching it off. There is no rename: the API's
   * update DTO has no `userTypeName`, because the name travels in the JWT as
   * the `userType` claim and the services branch on it. There is no delete
   * permission either, because the API has no delete: a type users still point
   * at is switched off, never removed.
   */
  userTypesUpdate: ['UPDATE', 'UserType'],
  /**
   * The catalogue screen. Read on the items is what the whole page is gated
   * on: they are the rows anyone comes here for, and the other five
   * collections are lookups every signed-in role already reads to fill a
   * picker, so they add nothing to the gate.
   */
  catalogue: ['READ', 'Item'],
  /**
   * The catalogue writes. Unlike the reference collections these all allow a
   * rename — nothing on the API matches a catalogue row by its name, so a
   * correction is a correction. The one exception is a currency's `isoCode`,
   * which is not on the API's update DTO and not on the edit panel either:
   * `payment.service` looks the house currency up by that exact string.
   *
   * There is no delete permission for any of them, because the API has no
   * delete: a row the catalogue still points at is switched off, never
   * removed.
   */
  itemsCreate: ['CREATE', 'Item'],
  itemsUpdate: ['UPDATE', 'Item'],
  servicesCreate: ['CREATE', 'Service'],
  servicesUpdate: ['UPDATE', 'Service'],
  serviceTypesCreate: ['CREATE', 'ServiceType'],
  serviceTypesUpdate: ['UPDATE', 'ServiceType'],
  categoriesCreate: ['CREATE', 'Category'],
  categoriesUpdate: ['UPDATE', 'Category'],
  subCategoriesCreate: ['CREATE', 'SubCategory'],
  subCategoriesUpdate: ['UPDATE', 'SubCategory'],
  currenciesCreate: ['CREATE', 'Currency'],
  currenciesUpdate: ['UPDATE', 'Currency'],
  /**
   * The user file. Staff and customer accounts alike live in one `User`
   * collection on the API, so this is the gate on the whole screen.
   */
  users: ['READ', 'User'],
  /** Adding an account. An admin one also needs a password, which the API checks. */
  usersCreate: ['CREATE', 'User'],
  /**
   * Correcting a profile — names, email, WhatsApp number, gender and
   * language. The API's own `UpdateUserDto` is the narrower gate: the phone
   * number and the user type are not in it, so this cannot rewrite an
   * identity or promote a customer to staff.
   */
  usersUpdate: ['UPDATE', 'User'],
  /**
   * Switching an account on or off, and granting or revoking a role.
   * `manage`, not `UPDATE`: the API gates all three on the wildcard, so a role
   * that may correct a spelling still cannot hand out authority.
   */
  usersManage: ['manage', 'User'],
  /**
   * Its own action, not `READ User`: the file is a list of names, phones and
   * emails leaving the building, so a role can work the user file on screen
   * without being able to extract it.
   */
  exportUser: ['EXPORT', 'User'],
  /**
   * The who-did-what trail. Its own subject, not `READ User`: the rows say
   * where a colleague was working from and on what device, so a role can work
   * the staff file without being able to follow somebody around.
   *
   * The API scopes the rows it returns by the same rule, so an office-scoped
   * reviewer sees their branch and nothing else even when this passes.
   */
  activity: ['READ', 'Activity'],
  offices: ['READ', 'Office'],
  /**
   * Opening a branch. A GLOBAL act on the API: a new office mints an office
   * code, a signed link and the QR code behind it.
   */
  officesCreate: ['CREATE', 'Office'],
  /**
   * Editing a branch — name, type, address, city, region and status. The
   * office code and slug are not in the API's `UpdateOfficeDto`, so this
   * permission cannot break a public link that is already printed.
   */
  officesUpdate: ['UPDATE', 'Office'],
  /**
   * Posting staff to a branch and taking them off it. `manage`, not `UPDATE`:
   * the API gates both writes on the wildcard, so an office-scoped role that
   * may correct an address still cannot move people between branches.
   */
  officeStaff: ['manage', 'Office'],
  /**
   * Its own action, not `READ Office`: the API gates the bulk download
   * separately, so a role can work the office file on screen without being
   * able to extract it.
   */
  exportOffice: ['EXPORT', 'Office'],
  followUps: ['READ', 'FollowUp'],
  pricingQuote: ['READ', 'Item'],
  exportOrder: ['EXPORT', 'Order'],
  /**
   * Its own action, not `READ PickupRequest`: the API gates the bulk download
   * separately so reporting roles can have the file without the queue.
   */
  exportPickup: ['EXPORT', 'PickupRequest'],
  /**
   * Its own action, not `READ Payment`: the API gates the bulk download
   * separately so finance/reporting roles can have the file without the
   * ledger, and a cashier can take money without being able to extract it.
   */
  exportPayment: ['EXPORT', 'Payment'],
  /**
   * Its own action, not `READ Customer`: the file is a list of names, phones
   * and addresses leaving the building. The API seeds it for Office Manager
   * and deliberately not for Customer Service, who can still work the file
   * on screen.
   */
  exportCustomer: ['EXPORT', 'Customer'],
  /**
   * Correcting a payment that was already recorded. The global wildcard and
   * nothing less: `UPDATE Payment` is the money-authority every cashier
   * carries for an order's own figures, but rewriting money already taken
   * moves a customer's balance after the fact. The API gates the PATCH on the
   * same `manage`/`all`, so this only hides a control the server would refuse.
   */
  paymentsEdit: ['manage', 'all'],

  /*
   * The roles screen — the authority model itself.
   *
   * Read is what the page is gated on. The three writes are separate because
   * they are different acts: adding a role and rewording one change a label,
   * while `rolesSetPermissions` changes what every person holding that role
   * may do, which is why it is its own subject on the API too.
   */
  roles: ['READ', 'Role'],
  rolesCreate: ['CREATE', 'Role'],
  rolesUpdate: ['UPDATE', 'Role'],
  rolesSetPermissions: ['UPDATE', 'RolePermission'],
  /** The catalogue the permission matrix draws its rows from. */
  permissions: ['READ', 'Permission'],
} as const satisfies Record<string, RequiredPermission>
