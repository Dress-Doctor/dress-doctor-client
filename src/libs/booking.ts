import { CLOSED_WEEKDAY, PICKUP_DAYS, pickupWindows } from '#/data/booking.data'
import { QUARTERLY_MULTIPLIER } from '#/data/home.data'
import type {
  BookingAnswersDto,
  BookingDraftDto,
  BookingErrorsDto,
  BookingServiceIdDto,
  BookingStepIdDto,
  PickupDayDto,
  PickupWindowDto,
  PickupWindowIdDto,
} from '#/interfaces/booking.dto'
import type {
  SelfPickupDataDto,
  SelfPricingModelDto,
} from '#/interfaces/signup.dto'
import type { PlanBillingDto } from '#/interfaces/site.dto'
import { emptyContact, validateContact } from '#/libs/contact'
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

/**
 * A pickup the API already holds, in the words of the form: "Wed, 8 Oct ·
 * Morning". The day and the window come back as the API stores them — an ISO
 * time and the window's own string — so the window is found by that string.
 */
export function formatHeldPickup(pickupDate: string, pickupTime: string) {
  const date = new Intl.DateTimeFormat(getLocale(), {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  }).format(new Date(pickupDate))
  const window = pickupWindows.find(
    (candidate) => candidate.apiValue === pickupTime,
  )

  return `${date} · ${window ? window.label() : pickupTime}`
}

/** What a plan costs each month once the billing choice is counted in. */
export const monthlyPlanPrice = (price: number, billing: PlanBillingDto) =>
  Math.round(price * (billing === 'quarterly' ? QUARTERLY_MULTIPLIER : 1))

export const windowById = (id: PickupWindowIdDto | null) =>
  pickupWindows.find((window) => window.id === id)

/**
 * The steps a visitor goes through, in order. Someone who is signed in has
 * already given their details and proved them, so they skip the last two and
 * the request goes from the address step.
 */
export const bookingSteps = (signedIn: boolean): BookingStepIdDto[] =>
  signedIn
    ? ['service', 'time', 'address']
    : ['service', 'time', 'address', 'contact', 'verify']

/** Which fields of one step are missing or wrong. */
export function validateStep(
  step: BookingStepIdDto,
  draft: BookingDraftDto,
): BookingErrorsDto {
  const errors: BookingErrorsDto = {}

  if (step === 'service' && !draft.service) errors.service = true

  if (step === 'time') {
    if (!draft.date) errors.date = true
    if (!draft.windowId) errors.windowId = true
  }

  if (step === 'address' && !draft.area.trim()) errors.area = true

  // Who the visitor is: the same check the plan form uses.
  if (step === 'contact') Object.assign(errors, validateContact(draft))

  return errors
}

/** The street and the area as one line, the way a driver reads an address. */
export const buildAddress = (draft: BookingDraftDto) =>
  [draft.street.trim(), draft.area.trim()].filter(Boolean).join(', ')

/** How a service is priced: the kilo services by weight, the other by piece. */
export const pricingModelFor = (
  service: BookingServiceIdDto,
): SelfPricingModelDto => (service === 'perpiece' ? 'PER_PIECE' : 'PER_KG')

/**
 * The body for a customer who has signed in: where and when, how they would
 * like to be priced, and their note. Their name, phone and the rest are not
 * repeated — the session says who is asking, and the account already holds
 * the details.
 */
export function buildSelfPickupPayload(
  draft: BookingDraftDto,
): SelfPickupDataDto {
  const note = draft.notes.trim()

  return {
    pickupAddress: buildAddress(draft),
    pickupTime: windowById(draft.windowId)!.apiValue,
    pickupDate: toPickupDate(draft.date!),
    ...(draft.service && { pricingModel: pricingModelFor(draft.service) }),
    ...(note && { note }),
  }
}
