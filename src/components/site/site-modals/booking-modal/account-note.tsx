import { Button, HStack, Icon, Text } from '@chakra-ui/react'
import icons from '#/config/icons'
import type { BookingFlow } from '#/hooks/use-booking-flow'
import utils from '#/libs/utils'
import { m } from '#/paraglide/messages'

/**
 * Tells a signed-in customer whose name the pickup goes under, with a way out
 * for somebody who opened the form on another person's phone. Logging out
 * keeps the form open and asks for the details again.
 */
function AccountNote({ flow }: { flow: BookingFlow }) {
  const { customer, loggingOut, sending } = flow
  if (!customer) return null

  return (
    <HStack mt={3} gap={2} wrap="wrap" fontSize="12.5px" color="site.ink-muted">
      <Icon aria-hidden boxSize={3.5} as={icons.user} />
      <Text as="span">
        {m.booking_account_title({ name: utils.fullName(customer) })}
      </Text>
      <Button
        type="button"
        variant="plain"
        h="auto"
        p={0}
        fontSize="12.5px"
        fontWeight="semibold"
        color="turquoise-blue.700"
        _hover={{ color: 'turquoise-blue.800' }}
        loading={loggingOut}
        loadingText={m.booking_account_loggingOut()}
        disabled={sending}
        onClick={flow.logoutHere}
      >
        {m.booking_account_logout()}
      </Button>
    </HStack>
  )
}

export default AccountNote
