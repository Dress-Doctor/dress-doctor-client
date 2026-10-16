import type { ContactDraftDto, ContactFieldDto, GenderDto } from './contact.dto'
import type { KgServiceIdDto, PlanBillingDto, PlanModeDto } from './site.dto'

/** The two forms that open over a page. */
export type SiteModalDto = 'booking' | 'subscribe'

/**
 * The query parameters every public page understands — the address is where
 * the forms' open/closed state and their main choices live, so a link, a
 * refresh or the back button all land on the same screen.
 */
export interface SiteSearchDto {
  /** Which form is open. Absent when none is. */
  modal?: SiteModalDto
  /** The pickup form's service. */
  service?: BookingServiceIdDto
  /** The plan form's plan: `basic`, `standard` or `premium`. */
  tier?: string
  /** Pieces or kilos — shared by the plan cards and the plan form. */
  plan?: PlanModeDto
  /** Monthly or every three months — shared the same way. */
  billing?: PlanBillingDto
}

/** What a visitor can ask us to pick up. */
export type BookingServiceIdDto = KgServiceIdDto | 'perpiece'

export type PickupWindowIdDto = 'morning' | 'afternoon' | 'evening'

/** The four steps of the booking form, in order. */
export type BookingStepDto = 0 | 1 | 2 | 3

/** The pickup itself: what, when and where. */
export interface BookingAnswersDto {
  service: BookingServiceIdDto | null
  /** The chosen day as a local `YYYY-MM-DD` key. */
  date: string | null
  windowId: PickupWindowIdDto | null
  area: string
  street: string
  notes: string
}

/**
 * What the visitor has typed or picked so far: the pickup, and who they are.
 * Who they are is the same set of fields the plan form asks for.
 */
export interface BookingDraftDto extends BookingAnswersDto, ContactDraftDto {}

/** Values the page can hand the form when it opens. */
export interface BookingPrefillDto {
  service?: BookingServiceIdDto
}

/** Values the page can hand the plan form when it opens. */
export interface SubscribePrefillDto {
  /** A plan id from `homePlans` — `basic`, `standard` or `premium`. */
  plan?: string
  mode?: PlanModeDto
  billing?: PlanBillingDto
}

/** The form fields that can show an error. */
export type BookingFieldDto =
  'service' | 'date' | 'windowId' | 'area' | ContactFieldDto

export type BookingErrorsDto = Partial<Record<BookingFieldDto, true>>

export interface PickupWindowDto {
  id: PickupWindowIdDto
  /** The exact string the API accepts for `pickupTime`. */
  apiValue: string
  /** First and last hour of the window, 24-hour clock. */
  startHour: number
  endHour: number
  label: () => string
  hours: () => string
}

export interface PickupDayDto {
  /** Local `YYYY-MM-DD`. */
  key: string
  date: Date
  isToday: boolean
  isSunday: boolean
  /** True when no pickup window is left today. */
  isOver: boolean
}

export interface BookingServiceOptionDto {
  id: BookingServiceIdDto
  name: () => string
  description: () => string
  price: () => string
}

/** The body of the public `POST /v1/pickups` — the API rejects any other field. */
export interface SchedulePickupDataDto {
  firstName: string
  lastName: string
  /** Only sent when the visitor picked one. */
  gender?: GenderDto
  /** `+` and the country code, then the number: `+237689688248`. */
  phone: string
  /** Written like `phone`. Only sent when the visitor gave one; the API refuses an empty string. */
  whatsappPhone?: string
  /** Only sent when the visitor gave one; the API refuses an empty string. */
  email?: string
  pickupAddress: string
  pickupTime: string
  pickupDate: string
}

export interface PickupScheduledDto {
  pickupRequest: {
    _id: string
    reference: string
  }
}
