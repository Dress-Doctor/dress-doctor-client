import type { BookingFlow } from '#/hooks/use-booking-flow'
import VerifyContact from '../verify-contact'

/**
 * The last step for a visitor who is not signed in: the code that proves their
 * WhatsApp or email. The form's button sends the pickup once it is accepted.
 */
function VerifyStep({ flow }: { flow: BookingFlow }) {
  return (
    <VerifyContact
      verification={flow.verification}
      targets={flow.targets}
      phoneTarget={flow.phoneTarget}
      sendError={flow.sendError}
    />
  )
}

export default VerifyStep
