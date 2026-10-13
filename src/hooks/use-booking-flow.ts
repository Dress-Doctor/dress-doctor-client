import { isAxiosError } from 'axios'
import { useEffect, useState } from 'react'
import { useSchedulePickup } from '#/hooks/use-schedule-pickup'
import type {
  BookingDraftDto,
  BookingErrorsDto,
  BookingFieldDto,
  BookingServiceIdDto,
  BookingStepDto,
} from '#/interfaces/booking.dto'
import type { ErrorResponseDto } from '#/interfaces/api-client.dto'
import {
  buildPickupDays,
  buildPickupPayload,
  emptyDraft,
  isDayOpen,
  isWindowOpen,
  validateStep,
  windowById,
} from '#/libs/booking'
import { m } from '#/paraglide/messages'

export const LAST_BOOKING_STEP = 3

/**
 * The words to show when sending failed. The API answers in the visitor's
 * language, so its message is used as it is — except for a validation failure,
 * whose text is for developers and says nothing a visitor can act on.
 */
function submitMessage(error: unknown) {
  if (isAxiosError<ErrorResponseDto>(error)) {
    const body = error.response?.data
    if (body?.message && body.error.code !== 'VALIDATION_ERROR') {
      return body.message
    }
  }
  return m.booking_error_submit()
}

interface BookingFlowOptions {
  /** Whether the address says the pickup form is open. */
  open: boolean
  /** The service in the address, if any. */
  service: BookingServiceIdDto | undefined
  /** Writes the service to the address; `undefined` takes it out. */
  setService: (service: BookingServiceIdDto | undefined) => void
}

/**
 * Everything the booking form remembers: the step, what has been typed, and
 * the outcome of sending it.
 *
 * Whether the form is open, and which service is picked, are not kept here —
 * they are in the address, and this reads them from there. That is what lets a
 * link, a refresh or the back button all land on the same screen. The rest
 * (dates, names, a phone number) stays out of the address on purpose: it is
 * personal, and long.
 *
 * It lives above the dialog on purpose. Closing the form half way keeps the
 * answers, so a visitor who taps outside by mistake does not start again;
 * only a sent request clears them.
 */
export function useBookingFlow({
  open,
  service,
  setService,
}: BookingFlowOptions) {
  const schedule = useSchedulePickup()

  const [step, setStep] = useState<BookingStepDto>(0)
  const [answers, setAnswers] = useState<BookingDraftDto>(emptyDraft)
  const [errors, setErrors] = useState<BookingErrorsDto>({})
  /** Fixed when the form opens, so the day list does not shift under a click. */
  const [now, setNow] = useState(() => new Date())
  const [reference, setReference] = useState<string | null>(null)
  /**
   * The service picked. The address is where it is written and where a link
   * puts it, but the address drops it when the form closes — and the form
   * must not blank while it is still fading out, nor forget it if the visitor
   * comes back. So the form keeps its own copy, and follows the address
   * whenever the address names a service.
   */
  const [chosen, setChosen] = useState(service)

  useEffect(() => {
    if (service) setChosen(service)
  }, [service])

  /** What the form shows: the typed answers, and the service chosen. */
  const draft: BookingDraftDto = { ...answers, service: chosen ?? null }
  const submitted = reference !== null
  const days = buildPickupDays(now)

  /** Brings the form up to date each time it opens. */
  const refresh = () => {
    const opened = new Date()
    const openDays = buildPickupDays(opened)

    // A day or a time chosen earlier may have gone by since.
    const day = openDays.find((candidate) => candidate.key === answers.date)
    const dayStillOpen = day !== undefined && isDayOpen(day)
    const window = windowById(answers.windowId)
    const windowStillOpen =
      window !== undefined && isWindowOpen(window, day, opened)

    schedule.reset()
    setNow(opened)
    setErrors({})
    setAnswers((current) => ({
      ...current,
      date: dayStillOpen ? current.date : null,
      windowId: dayStillOpen && windowStillOpen ? current.windowId : null,
    }))

    // Put a service the form remembers back in the address; without any
    // service there is nothing to carry on from.
    if (chosen && !service) setService(chosen)
    else if (!chosen) setStep(0)
  }

  useEffect(() => {
    if (open) refresh()
    // Only the moment it opens — `refresh` reads whatever is current then.
  }, [open])

  /**
   * Starts again once a sent request has finished closing — not before, or the
   * confirmation would blank out while it is still animating away.
   */
  const finish = () => {
    if (!submitted) return
    setAnswers(emptyDraft)
    setStep(0)
    setReference(null)
    setChosen(undefined)
  }

  const update = (patch: Partial<BookingDraftDto>) => {
    const { service: nextService, ...typed } = patch
    if ('service' in patch) {
      setChosen(nextService ?? undefined)
      setService(nextService ?? undefined)
    }

    const merged = { ...answers, ...typed }

    // Moving to today can leave the chosen window in the past.
    const day = days.find((candidate) => candidate.key === merged.date)
    const window = windowById(merged.windowId)
    if (window && !isWindowOpen(window, day, now)) merged.windowId = null

    setAnswers(merged)

    // An answer that was just changed is no longer wrong.
    setErrors((current) => {
      const next = { ...current }
      for (const key of Object.keys(patch) as BookingFieldDto[]) {
        delete next[key]
      }
      return next
    })
  }

  const submit = () => {
    schedule.mutate(buildPickupPayload(draft), {
      onSuccess: (response) =>
        setReference(response.data?.pickupRequest.reference ?? ''),
    })
  }

  /** Moves on, and answers with the first wrong field when it cannot. */
  const next = (): BookingFieldDto | undefined => {
    if (schedule.isPending) return

    const found = validateStep(step, draft)
    setErrors(found)
    const firstWrong = Object.keys(found)[0] as BookingFieldDto | undefined
    if (firstWrong) return firstWrong

    if (step < LAST_BOOKING_STEP) {
      setStep((step + 1) as BookingStepDto)
      return
    }
    submit()
  }

  const back = () => {
    if (step === 0 || schedule.isPending) return
    setErrors({})
    setStep((step - 1) as BookingStepDto)
  }

  return {
    step,
    draft,
    errors,
    days,
    now,
    reference: reference ?? '',
    submitted,
    sending: schedule.isPending,
    submitError: schedule.isError ? submitMessage(schedule.error) : null,
    finish,
    update,
    next,
    back,
  }
}

export type BookingFlow = ReturnType<typeof useBookingFlow>
