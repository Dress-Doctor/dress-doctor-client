import { Button, HStack, Icon, Text } from '@chakra-ui/react'
import icons from '#/config/icons'
import { m } from '#/paraglide/messages'

interface SignedInNoteProps {
  /** Who the request goes under, already worded: "Booking as Ada Deo". */
  label: string
  loggingOut: boolean
  /** A code or a request is on its way, so logging out would cut it off. */
  disabled: boolean
  onLogout: () => void
}

/**
 * Tells a signed-in customer whose name a request goes under, with a way out
 * for somebody who opened the form on another person's phone. Logging out
 * keeps the form open and asks for the details again.
 */
function SignedInNote({
  label,
  loggingOut,
  disabled,
  onLogout,
}: SignedInNoteProps) {
  return (
    <HStack mt={3} gap={2} wrap="wrap" fontSize="12.5px" color="site.ink-muted">
      <Icon aria-hidden boxSize={3.5} as={icons.user} />
      <Text as="span">{label}</Text>
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
        loadingText={m.common_account_loggingOut()}
        disabled={disabled}
        onClick={onLogout}
      >
        {m.common_account_logout()}
      </Button>
    </HStack>
  )
}

export default SignedInNote
