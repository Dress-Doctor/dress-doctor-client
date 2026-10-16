import type { BookingFlow } from '#/hooks/use-booking-flow'
import utils from '#/libs/utils'
import { m } from '#/paraglide/messages'
import SignedInNote from '../signed-in-note'

/** Whose name the pickup goes under, for a signed-in customer. */
function AccountNote({ flow }: { flow: BookingFlow }) {
  const { customer } = flow
  if (!customer) return null

  return (
    <SignedInNote
      label={m.booking_account_title({ name: utils.fullName(customer) })}
      loggingOut={flow.loggingOut}
      disabled={flow.sending}
      onLogout={flow.logoutHere}
    />
  )
}

export default AccountNote
