import { CLOSED_WEEKDAY, PICKUP_DAYS, pickupWindows } from '#/data/booking.data'
import { QUARTERLY_MULTIPLIER } from '#/data/home.data'
import type {
  BookingAnswersDto,
  BookingDraftDto,
  BookingErrorsDto,
  BookingStepDto,
  PickupDayDto,
  PickupWindowDto,
  PickupWindowIdDto,
  SchedulePickupDataDto,
} from '#/interfaces/booking.dto'
import type { SelfPickupDataDto } from '#/interfaces/signup.dto'
import type { PlanBillingDto } from '#/interfaces/site.dto'
import {
  contactEmail,
  contactPhone,
  contactWhatsapp,
  emptyContact,
  validateContact,
} from '#/libs/contact'
import { getLocale } from '#/paraglide/runtime'

/** The pickup's own answers before the visitor has given any. */
export const emptyAnswers: BookingAnswersDto = {
  service: null,
  date: null,
  windowId: null,
  area: '',
  street: '',
  notes: '',
}

export const emptyDraft: BookingDraftDto = { ...emptyAnswers, ...emptyContact }

/** A local calendar day as `YYYY-MM-DD`. `toISOString` would shift it by the UTC offset. */
export function toDateKey(date: Date) {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

/** True when a pickup window has already ended at `now`. */
export function isWindowOver(window: PickupWindowDto, now: Date) {
  return now.getHours() >= window.endHour
}

/** The next `PICKUP_DAYS` days from `now`, with the ones we cannot take marked. */
export function buildPickupDays(now: Date): PickupDayDto[] {
  const lastWindow = pickupWindows[pickupWindows.length - 1]

  return Array.from({ length: PICKUP_DAYS }, (_, offset) => {
    const date = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + offset,
    )
    return {
      key: toDateKey(date),
      date,
      isToday: offset === 0,
      isSunday: date.getDay() === CLOSED_WEEKDAY,
      isOver: offset === 0 && isWindowOver(lastWindow, now),
    }
  })
}

/** Whether a visitor can pick this day at all. */
export const isDayOpen = (day: PickupDayDto) => !day.isSunday && !day.isOver

/** Whether a window can still be picked on a given day. */
export function isWindowOpen(
  window: PickupWindowDto,
  day: PickupDayDto | undefined,
  now: Date,
) {
  if (!day?.isToday) return true
  return !isWindowOver(window, now)
}

/**
 * The pickup day at midday, local time. Midday so that a server in another
 * time zone still reads the same calendar day.
 */
export function toPickupDate(dateKey: string) {
  const [year, month, day] = dateKey.split('-').map(Number)
  return new Date(year, month - 1, day, 12).toISOString()
}

/**
 * The three parts of a day button: "Wed", "8" and "Oct". `Intl` so a French
 * reader gets "mer." and "oct." without this knowing the words.
 */
export function dayLabels(date: Date) {
  const locale = getLocale()
  const part = (options: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat(locale, options).format(date)

  return {
    weekday: part({ weekday: 'short' }),
    dayOfMonth: part({ day: 'numeric' }),
    month: part({ month: 'short' }),
  }
}

/** "Wed, 8 Oct · Morning" — the day and the time window in one line. */
export function formatPickup(day: PickupDayDto, window: PickupWindowDto) {
  const date = new Intl.DateTimeFormat(getLocale(), {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  }).format(day.date)

  return `${date} · ${window.label()}`
}

/** What a plan costs each month once the billing choice is counted in. */
export const monthlyPlanPrice = (price: number, billing: PlanBillingDto) =>
  Math.round(price * (billing === 'quarterly' ? QUARTERLY_MULTIPLIER : 1))

export const windowById = (id: PickupWindowIdDto | null) =>
  pickupWindows.find((window) => window.id === id)

/** Which fields of one step are missing or wrong. */
export function validateStep(
  step: BookingStepDto,
  draft: BookingDraftDto,
): BookingErrorsDto {
  const errors: BookingErrorsDto = {}

  if (step === 0 && !draft.service) errors.service = true

  if (step === 1) {
    if (!draft.date) errors.date = true
    if (!draft.windowId) errors.windowId = true
  }

  if (step === 2 && !draft.area.trim()) errors.area = true

  // Who the visitor is: the same check the plan form uses.
  if (step === 3) Object.assign(errors, validateContact(draft))

  return errors
}

/** The street and the area as one line, the way a driver reads an address. */
export const buildAddress = (draft: BookingDraftDto) =>
  [draft.street.trim(), draft.area.trim()].filter(Boolean).join(', ')

/**
 * The request body. Only the fields the API knows: it refuses the rest, so the
 * service and the notes travel in the WhatsApp message instead. The WhatsApp
 * number and the email are left out when empty — the API checks any it is
 * given, and an empty string fails that check.
 */
export function buildPickupPayload(
  draft: BookingDraftDto,
): SchedulePickupDataDto {
  const whatsappPhone = contactWhatsapp(draft)
  const email = contactEmail(draft)

  return {
    firstName: draft.firstName.trim(),
    lastName: draft.lastName.trim(),
    ...(draft.gender && { gender: draft.gender }),
    phone: contactPhone(draft),
    ...(whatsappPhone && { whatsappPhone }),
    ...(email && { email }),
    pickupAddress: buildAddress(draft),
    pickupTime: windowById(draft.windowId)!.apiValue,
    pickupDate: toPickupDate(draft.date!),
  }
}

/**
 * The body for a customer who has signed in: where and when, nothing more.
 * Their name, phone and the rest are not repeated — the session says who is
 * asking, and the account already holds the details.
 */
export function buildSelfPickupPayload(
  draft: BookingDraftDto,
): SelfPickupDataDto {
  return {
    pickupAddress: buildAddress(draft),
    pickupTime: windowById(draft.windowId)!.apiValue,
    pickupDate: toPickupDate(draft.date!),
  }
}
