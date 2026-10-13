import { useEffect, useState } from 'react'
import { DEFAULT_COUNTRY_ISO } from '#/data/countries.data'
import { DEFAULT_PLAN_ID } from '#/data/home.data'
import type { PlanBillingDto, PlanModeDto } from '#/interfaces/site.dto'
import { getCountry, isValidNumber } from '#/libs/phone'

interface SubscribeErrors {
  firstName?: true
  phone?: true
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
}

/**
 * Everything the plan form remembers. It has no back end to send to — a plan
 * is set up with a person — so "submitted" means the details are complete and
 * the visitor can carry on in WhatsApp with them already typed.
 *
 * Whether the form is open, and which plan, count and billing are picked, are
 * in the address and read from there; the plan cards on the home page read the
 * same count and billing, so the two always agree. The name and the number are
 * not put in the address.
 */
export function useSubscribeFlow({
  open,
  tier,
  mode,
  billing,
  change,
}: SubscribeFlowOptions) {
  const [firstName, setFirstName] = useState('')
  const [phone, setPhone] = useState('')
  const [phoneCountry, setPhoneCountry] = useState(DEFAULT_COUNTRY_ISO)
  const [errors, setErrors] = useState<SubscribeErrors>({})
  const [submitted, setSubmitted] = useState(false)
  /**
   * The plan picked. The address drops it when the form closes, so the form
   * keeps its own copy — it must not switch to another plan while it is still
   * fading out — and follows the address whenever the address names one.
   */
  const [planId, setPlanId] = useState(tier ?? DEFAULT_PLAN_ID)

  useEffect(() => {
    if (tier) setPlanId(tier)
  }, [tier])

  // Each time the form opens, an old complaint should not still be showing,
  // and a plan it remembers goes back in the address. The recommended plan is
  // what the form shows when the address names none, so it is not written —
  // a link that says only `modal=subscribe` is left exactly as it was sent.
  useEffect(() => {
    if (!open) return
    setErrors({})
    if (!tier && planId !== DEFAULT_PLAN_ID) change({ planId })
    // Only the moment it opens.
  }, [open])

  /** Starts again once the confirmation has finished closing. */
  const finish = () => {
    setSubmitted(false)
    setErrors({})
  }

  const changeFirstName = (value: string) => {
    setFirstName(value)
    setErrors((current) => ({ ...current, firstName: undefined }))
  }

  const changePhone = (next: { country: string; number: string }) => {
    setPhoneCountry(next.country)
    setPhone(next.number)
    setErrors((current) => ({ ...current, phone: undefined }))
  }

  /** Finishes the form, or answers with the first wrong field. */
  const submit = (): keyof SubscribeErrors | undefined => {
    const found: SubscribeErrors = {}
    if (!firstName.trim()) found.firstName = true
    if (!isValidNumber(getCountry(phoneCountry), phone)) found.phone = true

    setErrors(found)
    const firstWrong = Object.keys(found)[0] as
      keyof SubscribeErrors | undefined
    if (firstWrong) return firstWrong
    setSubmitted(true)
  }

  return {
    planId,
    mode,
    billing,
    firstName,
    phone,
    phoneCountry,
    errors,
    submitted,
    finish,
    setPlanId: (id: string) => {
      setPlanId(id)
      change({ planId: id })
    },
    setMode: (next: PlanModeDto) => change({ mode: next }),
    setBilling: (next: PlanBillingDto) => change({ billing: next }),
    changeFirstName,
    changePhone,
    submit,
  }
}

export type SubscribeFlow = ReturnType<typeof useSubscribeFlow>
