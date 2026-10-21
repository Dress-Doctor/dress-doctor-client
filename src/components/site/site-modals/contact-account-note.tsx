import { HStack, Icon, Text } from '@chakra-ui/react'
import icons from '#/config/icons'
import { m } from '#/paraglide/messages'

/**
 * Under the details: what the next button does. It sends a code to the
 * visitor's WhatsApp, and that is also what makes their account — so they are
 * told before, not surprised after.
 */
function ContactAccountNote() {
  return (
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
      <Text>{m.common_contact_accountNote()}</Text>
    </HStack>
  )
}

export default ContactAccountNote
