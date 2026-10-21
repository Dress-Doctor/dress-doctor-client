import { useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { DEFAULT_PLAN_ID } from '#/data/home.data'
import type { ContactDraft } from '#/hooks/use-contact-draft'
import { useContactVerification } from '#/hooks/use-contact-verification'
import { useLogout } from '#/hooks/use-logout'
import { meQueryKey, useCustomer } from '#/hooks/use-me'
import { useRequestPlan } from '#/hooks/use-request-plan'
import type {
  ContactDraftDto,
  ContactErrorsDto,
  ContactFieldDto,
} from '#/interfaces/contact.dto'
import type { PlanBillingDto, PlanModeDto } from '#/interfaces/site.dto'
import type { SignupOutcomeDto } from '#/interfaces/signup.dto'
import { validateContact } from '#/libs/contact'
import {
  buildSignupProfile,
  phoneTarget,
  planCodeFor,
  verifyTargets,
} from '#/libs/signup'
import { signupErrorFrom } from '#/libs/signup-errors'
import type { SignupErrorDto } from '#/libs/signup-errors'

/** The two screens of the plan form: the details, then the code. */
export type SubscribeStepDto = 'details' | 'verify'

/**
 * What the visitor is shown once the plan has been dealt with.
 *
 * - `requested`: staff have the request and will ring to confirm it.
 * - `open`: they already have a plan or a request waiting, so nothing was made.
 * - `whatsapp`: the website does not know this plan (it may have been taken
 *   off), so the details go to a person over WhatsApp, as they used to.
 */
export type PlacedPlanKindDto = 'requested' | 'open' | 'whatsapp'

export interface PlacedPlanDto {
  kind: PlacedPlanKindDto
  /**
   * How the visitor got in just now: a new account, or one they already had.
   * `null` for a customer who was signed in before they started.
   */
  outcome: SignupOutcomeDto | null
}

interface SubscribeFlowOptions {
  /** Whether the address says the plan form is open. */
  open: boolean
  /** The plan named in the address, if any. */
  tier: string | undefined
  /** The count and the billing — read from the address. */
  mode: PlanModeDto
  billing: PlanBillingDto
  /** Writes a change to the plan, the count or the billing into the address. */
  change: (patch: {
    planId?: string
    mode?: PlanModeDto
    billing?: PlanBillingDto
  }) => void
  /**
   * Who the visitor is. Kept above the form because the pickup form asks for
   * the same details: what is typed in one is there in the other.
   */
  contact: ContactDraft
}

/**
 * Everything the plan form remembers: the plan, who the visitor is, the code
 * that proves their contact, and the outcome of asking.
 *
 * Whether the form is open, and which plan, count and billing are picked, are
 * in the address and read from there; the plan cards on the home page read the
 * same count and billing, so the two always agree. Who the visitor is, and the
 * code, are not put in the address.
 *
 * **A visitor who is not signed in** gives their details, then proves a contact
 * with a code, which also makes their account and signs them in; the plan is
 * asked for the moment it is accepted. **A customer who is signed in** just
 * asks. Either way the plan is only a request: nothing is paid online, and
 * staff ring to confirm it.
 */
export function useSubscribeFlow({
  open,
  tier,
  mode,
  billing,
  change,
  contact,
}: SubscribeFlowOptions) {
  const queryClient = useQueryClient()
  const customer = useCustomer()
  const requestPlan = useRequestPlan()
  const { logout, loggingOut } = useLogout()

  const [step, setStep] = useState<SubscribeStepDto>('details')
  const [errors, setErrors] = useState<ContactErrorsDto>({})
  const [placed, setPlaced] = useState<PlacedPlanDto | null>(null)
  /** Why the request could not be sent, once the visitor's contact is proven. */
  const [sendError, setSendError] = useState<SignupErrorDto | null>(null)
  /** How the visitor got in, kept so a failed request can be sent again. */
  const [outcome, setOutcome] = useState<SignupOutcomeDto | null>(null)
  /**
   * The plan picked. The address drops it when the form closes, so the form
   * keeps its own copy — it must not switch to another plan while it is still
   * fading out — and follows the address whenever the address names one.
   */
  const [planId, setPlanId] = useState(tier ?? DEFAULT_PLAN_ID)

  useEffect(() => {
    if (tier) setPlanId(tier)
  }, [tier])

  const draft = contact.contact
  const submitted = placed !== null
  const planCode = planCodeFor(planId, mode, billing)

  /** Asks for the plan. The session says who is asking. */
  function sendRequest(result: SignupOutcomeDto | null) {
    setSendError(null)
    requestPlan.mutate(
      { planCode },
      {
        onSuccess: () => setPlaced({ kind: 'requested', outcome: result }),
        onError: (caught) => {
          const error = signupErrorFrom(caught, 'send')

          // Not a failure the visitor can fix, and not one to hide behind a
          // red box: say what is true.
          if (error.kind === 'requestOpen') {
            setPlaced({ kind: 'open', outcome: result })
            return
          }
          if (error.kind === 'planUnavailable') {
            setPlaced({ kind: 'whatsapp', outcome: result })
            return
          }

          setSendError(error)
          if (error.kind === 'sessionEnded') {
            // The session is gone, so the visitor is not a customer any more:
            // ask again who they are, and prove it.
            void queryClient.invalidateQueries({ queryKey: meQueryKey })
            verification.changeContact()
            setOutcome(null)
            setStep('details')
          }
        },
      },
    )
  }

  const verification = useContactVerification({
    profile: buildSignupProfile(draft),
    onVerified: (result) => {
      setOutcome(result)
      sendRequest(result)
    },
  })

  // The code was accepted, so the visitor is being carried on to the request.
  // That lasts until the request fails: from then on nothing is on its way,
  // and "Try again" must work. (`verification.finishing` stays set for good,
  // because the code cannot be un-proved.)
  const carryingOn = verification.finishing && sendError === null
  // Only the check of the digits, not the carrying on after it.
  const checkingCode = verification.verifying && !verification.finishing

  const busy =
    requestPlan.isPending ||
    verification.sending ||
    checkingCode ||
    carryingOn ||
    loggingOut

  // Each time the form opens, an old complaint should not still be showing,
  // and a plan it remembers goes back in the address. The recommended plan is
  // what the form shows when the address names none, so it is not written —
  // a link that says only `modal=subscribe` is left exactly as it was sent.
  useEffect(() => {
    if (!open) return
    setErrors({})
    setSendError(null)
    requestPlan.reset()
    if (!tier && planId !== DEFAULT_PLAN_ID) change({ planId })
    // Only the moment it opens.
  }, [open])

  /** Starts again once the confirmation has finished closing. */
  const finish = () => {
    if (!submitted) return
    contact.clear()
    setStep('details')
    setPlaced(null)
    setOutcome(null)
    setSendError(null)
    setErrors({})
    verification.changeContact()
  }

  /** A change to who the visitor is. An answer just changed is no longer wrong. */
  const update = (patch: Partial<ContactDraftDto>) => {
    contact.change(patch)
    setErrors((current) => {
      const next = { ...current }
      for (const key of Object.keys(patch) as ContactFieldDto[]) {
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
  const submit = (): ContactFieldDto | undefined => {
    if (busy) return

    // The code. Once it was accepted, pressing the button again sends the
    // request again.
    if (step === 'verify') {
      if (verification.outcome) sendRequest(outcome)
      else verification.submitCode()
      return
    }

    // A signed-in customer just asks.
    if (customer) {
      sendRequest(null)
      return
    }

    const found = validateContact(draft)
    setErrors(found)
    const firstWrong = Object.keys(found)[0] as ContactFieldDto | undefined
    if (firstWrong) return firstWrong

    setSendError(null)
    setStep('verify')
    startVerification()
  }

  const back = () => {
    // Once the code is accepted there is no un-proving it.
    if (step === 'details' || busy || verification.outcome) return
    setSendError(null)
    setStep('details')
  }

  return {
    planId,
    planCode,
    mode,
    billing,
    step,
    draft,
    errors,
    customer,
    /** Where a code can be sent for this visitor, best first. */
    targets: verifyTargets(draft),
    /** WhatsApp on the phone itself, for a phone that already has an account. */
    phoneTarget: phoneTarget(draft),
    verification,
    placed,
    submitted,
    /** A code, a check or the request is on its way. */
    sending: busy,
    sendError,
    /** The code was accepted but the request did not go. */
    canRetry: verification.outcome !== null && sendError !== null,
    loggingOut,
    finish,
    update,
    submit,
    back,
    setPlanId: (id: string) => {
      setPlanId(id)
      change({ planId: id })
    },
    setMode: (next: PlanModeDto) => change({ mode: next }),
    setBilling: (next: PlanBillingDto) => change({ billing: next }),
    /** Logs out and stays on the form, which asks for the details again. */
    logoutHere: () => logout({ stay: true }),
  }
}

export type SubscribeFlow = ReturnType<typeof useSubscribeFlow>
