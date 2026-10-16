import { HStack, Icon, Stack, Text } from '@chakra-ui/react'
import icons from '#/config/icons'
import type { BookingFlow } from '#/hooks/use-booking-flow'
import { m } from '#/paraglide/messages'
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

      <HStack
        gap={2.5}
        px={4}
        py={3}
        align="flex-start"
        rounded="14px"
        fontSize="13px"
        lineHeight="1.55"
        color="site.ink-muted"
        bg="site.sunken"
      >
        <Icon
          aria-hidden
          flex="none"
          boxSize={4}
          mt={0.5}
          as={icons.secure}
          color="turquoise-blue.700"
        />
        <Text>{m.booking_contact_accountNote()}</Text>
      </HStack>
    </Stack>
  )
}

export default ContactStep
