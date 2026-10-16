import { Stack } from '@chakra-ui/react'
import type { BookingFlow } from '#/hooks/use-booking-flow'
import ContactAccountNote from '../contact-account-note'
import ContactFields from '../contact-fields'

/**
 * Step 4: who the visitor is. The fields are shared with the plan form, so
 * this hands them the pickup form's values — and says what the next button
 * does, since it also makes the visitor's account.
 */
function ContactStep({ flow }: { flow: BookingFlow }) {
  return (
    <Stack gap={4}>
      <ContactFields
        contact={flow.draft}
        errors={flow.errors}
        onChange={flow.update}
      />
      <ContactAccountNote />
    </Stack>
  )
}

export default ContactStep
