import { useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import type { ContactDraft } from '#/hooks/use-contact-draft'
import { useContactVerification } from '#/hooks/use-contact-verification'
import { useLogout } from '#/hooks/use-logout'
import { meQueryKey, useCustomer } from '#/hooks/use-me'
import { useRequestPickup } from '#/hooks/use-request-pickup'
import type {
  BookingAnswersDto,
  BookingDraftDto,
  BookingErrorsDto,
  BookingFieldDto,
  BookingServiceIdDto,
  BookingStepIdDto,
} from '#/interfaces/booking.dto'
import type { SelfPickupDto, SignupOutcomeDto } from '#/interfaces/signup.dto'
import {
  bookingSteps,
  buildPickupDays,
  buildSelfPickupPayload,
  emptyAnswers,
  isDayOpen,
  isWindowOpen,
  validateStep,
  windowById,
} from '#/libs/booking'
import { splitContactPatch } from '#/libs/contact'
import { buildSignupProfile, phoneTarget, verifyTargets } from '#/libs/signup'
import { signupErrorFrom } from '#/libs/signup-errors'
import type { SignupErrorDto } from '#/libs/signup-errors'

/** A pickup request that went through, and how the visitor got there. */
export interface PlacedPickupDto {
  reference: string
  /** `false` when the customer already had a pickup open, and this is it. */
  created: boolean
  /**
   * How the visitor got in just now: a new account, or one they already had.
   * `null` for a customer who was signed in before they started.
   */
  outcome: SignupOutcomeDto | null
  /** The pickup already in hand, when `created` is `false`. */
  existing: SelfPickupDto['pickupRequest'] | null
}

interface BookingFlowOptions {
  /** Whether the address says the pickup form is open. */
  open: boolean
  /** The service in the address, if any. */
  service: BookingServiceIdDto | undefined
  /** Writes the service to the address; `undefined` takes it out. */
  setService: (service: BookingServiceIdDto | undefined) => void
  /**
   * Who the visitor is. Kept above the form because the plan form asks for the
   * same details: what is typed in one is there in the other.
   */
  contact: ContactDraft
}

/**
 * Everything the booking form remembers: the step, what has been typed, the
 * code that proves the visitor's contact, and the outcome of sending.
 *
 * Whether the form is open, and which service is picked, are not kept here —
 * they are in the address, and this reads them from there. That is what lets a
 * link, a refresh or the back button all land on the same screen. The rest
 * (dates, names, a phone number, the code) stays out of the address on
 * purpose: it is personal, and long.
 *
 * **A visitor who is not signed in** goes through all five steps. The last
 * proves their contact with a code, which also makes their account and signs
 * them in; the pickup is asked for the moment the code is accepted.
 * **A customer who is signed in** skips the last two and asks for the pickup
 * from the address step.
 *
 * It lives above the dialog on purpose. Closing the form half way keeps the
 * answers, so a visitor who taps outside by mistake does not start again;
 * only a sent request clears them.
 */
export function useBookingFlow({
  open,
  service,
  setService,
  contact,
}: BookingFlowOptions) {
  const queryClient = useQueryClient()
  const customer = useCustomer()
  const requestPickup = useRequestPickup()
  const { logout, loggingOut } = useLogout()

  const [stepId, setStepId] = useState<BookingStepIdDto>('service')
  const [answers, setAnswers] = useState<BookingAnswersDto>(emptyAnswers)
  const [errors, setErrors] = useState<BookingErrorsDto>({})
  /** Fixed when the form opens, so the day list does not shift under a click. */
  const [now, setNow] = useState(() => new Date())
  const [placed, setPlaced] = useState<PlacedPickupDto | null>(null)
  /** Why the request could not be sent, once the visitor's contact is proven. */
  const [sendError, setSendError] = useState<SignupErrorDto | null>(null)
  /** How the visitor got in, kept so a failed request can be sent again. */
  const [outcome, setOutcome] = useState<SignupOutcomeDto | null>(null)
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

  /**
   * What the form shows: the pickup's answers, who the visitor is, and the
   * service chosen.
   */
  const draft: BookingDraftDto = {
    ...answers,
    ...contact.contact,
    service: chosen ?? null,
  }
  const submitted = placed !== null
  const days = buildPickupDays(now)

  // A signed-in customer skips the details and the code. The code step itself
  // is kept in the list while it is on screen: the moment a code is accepted
  // the visitor becomes a signed-in customer, and the step they are on must
  // not vanish from under them.
  const steps = bookingSteps(customer !== null && stepId !== 'verify')
  // A step that is no longer in the list (the visitor signed in from another
  // tab while on the details step) falls back to the last one, which sends.
  const step = steps.includes(stepId) ? stepId : steps[steps.length - 1]
  const stepIndex = steps.indexOf(step)
  const isLast = stepIndex === steps.length - 1

  const verification = useContactVerification({
    profile: buildSignupProfile(draft),
    onVerified: (result) => {
      setOutcome(result)
      sendRequest(result)
    },
  })

  /** Asks for the pickup. The session says who is asking. */
  function sendRequest(result: SignupOutcomeDto | null) {
    setSendError(null)
    requestPickup.mutate(buildSelfPickupPayload(draft), {
      onSuccess: (response) => {
        const data = response.data
        setPlaced({
          reference: data?.pickupRequest.reference ?? '',
          created: data?.created ?? true,
          outcome: result,
          existing: data && !data.created ? data.pickupRequest : null,
        })
      },
      onError: (caught) => {
        const error = signupErrorFrom(caught, 'send')
        setSendError(error)
        if (error.kind === 'sessionEnded') {
          // The session is gone, so the visitor is not a customer any more:
          // ask again who they are, and prove it.
          void queryClient.invalidateQueries({ queryKey: meQueryKey })
          verification.changeContact()
          setOutcome(null)
          setStepId('contact')
        }
      },
    })
  }

  // The code was accepted, so the visitor is being carried on to the request.
  // That lasts until the request fails: from then on nothing is on its way,
  // and "Try again" must work. (`verification.finishing` stays set for good,
  // because the code cannot be un-proved.)
  const carryingOn = verification.finishing && sendError === null
  // Only the check of the digits, not the carrying on after it.
  const checkingCode = verification.verifying && !verification.finishing

  const busy =
    requestPickup.isPending ||
    verification.sending ||
    checkingCode ||
    carryingOn ||
    loggingOut

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

    requestPickup.reset()
    setSendError(null)
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
    else if (!chosen) setStepId('service')
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
    setAnswers(emptyAnswers)
    contact.clear()
    setStepId('service')
    setPlaced(null)
    setOutcome(null)
    setSendError(null)
    verification.changeContact()
    setChosen(undefined)
  }

  const update = (patch: Partial<BookingDraftDto>) => {
    const { service: nextService, ...typed } = patch
    if ('service' in patch) {
      setChosen(nextService ?? undefined)
      setService(nextService ?? undefined)
    }

    // Who the visitor is goes to the shared draft; the rest is the pickup's.
    const { contact: aboutVisitor, rest } = splitContactPatch(typed)
    if (Object.keys(aboutVisitor).length > 0) contact.change(aboutVisitor)

    const merged = { ...answers, ...rest }

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

  /**
   * Sends a code to the visitor, unless one is already out for a contact they
   * still have — going back to fix a typo and forward again must not use up
   * the codes the API allows.
   */
  const startVerification = () => {
    const targets = verifyTargets(draft)
    const kept =
      verification.target !== null &&
      !verification.expired &&
      targets.some(
        (target) => target.identifier === verification.target?.identifier,
      )
    if (!kept) verification.send(targets[0])
  }

  /** Moves on, and answers with the first wrong field when it cannot. */
  const next = (): BookingFieldDto | undefined => {
    if (busy) return

    // The last step of a visitor who is not signed in: the code. Once it was
    // accepted, pressing the button again sends the request again.
    if (step === 'verify') {
      if (verification.outcome) sendRequest(outcome)
      else verification.submitCode()
      return
    }

    const found = validateStep(step, draft)
    setErrors(found)
    const firstWrong = Object.keys(found)[0] as BookingFieldDto | undefined
    if (firstWrong) return firstWrong

    setSendError(null)

    if (step === 'contact') {
      setStepId('verify')
      startVerification()
      return
    }

    // A signed-in customer asks from the last step.
    if (isLast) {
      sendRequest(null)
      return
    }

    setStepId(steps[stepIndex + 1])
  }

  const back = () => {
    // Once the code is accepted there is no un-proving it.
    if (stepIndex === 0 || busy || verification.outcome) return
    setErrors({})
    setSendError(null)
    setStepId(steps[stepIndex - 1])
  }

  /** Sends the request again after it failed, without asking for a new code. */
  const retry = () => {
    if (busy) return
    sendRequest(outcome)
  }

  return {
    step,
    steps,
    stepIndex,
    isLast,
    draft,
    errors,
    days,
    now,
    customer,
    /** Where a code can be sent for this visitor, best first. */
    targets: verifyTargets(draft),
    /** WhatsApp on the phone itself, for a phone that already has an account. */
    phoneTarget: phoneTarget(draft),
    verification,
    placed,
    reference: placed?.reference ?? '',
    submitted,
    /** A code, a check or the request is on its way. */
    sending: busy,
    sendError,
    /** The code was accepted but the request did not go. */
    canRetry: verification.outcome !== null && sendError !== null,
    loggingOut,
    finish,
    update,
    next,
    back,
    retry,
    /** Logs out and stays on the form, which asks for the details again. */
    logoutHere: () => logout({ stay: true }),
  }
}

export type BookingFlow = ReturnType<typeof useBookingFlow>
