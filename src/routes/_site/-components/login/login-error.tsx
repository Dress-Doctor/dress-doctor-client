import { Text } from '@chakra-ui/react'
import type { LoginChannelDto } from '#/interfaces/auth.dto'
import type { LoginErrorDto } from '#/libs/auth-errors'
import { m } from '#/paraglide/messages'

/** The words for each kind of failure, in the simple words the site uses. */
function loginErrorText(error: LoginErrorDto, channel: LoginChannelDto) {
  switch (error.kind) {
    case 'notFound':
      return channel === 'email'
        ? m.auth_error_notFoundEmail()
        : m.auth_error_notFoundPhone()
    case 'inactive':
      return m.auth_error_inactive()
    case 'locked':
      return m.auth_error_locked()
    case 'codeWrong':
      return m.auth_error_codeWrong()
    case 'wait':
      return error.minutes
        ? m.auth_error_wait({ minutes: error.minutes })
        : m.auth_error_waitShort()
    case 'invalid':
      return m.auth_error_invalid()
    case 'network':
      return m.auth_error_network()
    default:
      return m.auth_error_generic()
  }
}

interface LoginErrorProps {
  error: LoginErrorDto | null
  channel: LoginChannelDto
}

/** One red line above the button, read out when it appears. */
function LoginError({ error, channel }: LoginErrorProps) {
  if (!error) return null

  return (
    <Text
      role="alert"
      px={4}
      py={3}
      fontSize="13.5px"
      lineHeight="1.5"
      color="red.700"
      bg="red.50"
      borderWidth="1px"
      borderColor="red.200"
      rounded="14px"
    >
      {loginErrorText(error, channel)}
    </Text>
  )
}

export default LoginError
