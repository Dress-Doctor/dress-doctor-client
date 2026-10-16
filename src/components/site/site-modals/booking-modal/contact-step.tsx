import type { BookingFlow } from '#/hooks/use-booking-flow'
import ContactFields from '../contact-fields'

/**
 * Step 4: who the visitor is. The fields are shared with the plan form, so
 * this only hands them the pickup form's values.
 */
function ContactStep({ flow }: { flow: BookingFlow }) {
  return (
    <ContactFields
      contact={flow.draft}
      errors={flow.errors}
      onChange={flow.update}
    />
  )
}

export default ContactStep
