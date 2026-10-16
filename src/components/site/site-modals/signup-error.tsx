import { Stack, Text } from '@chakra-ui/react'
import type { PropsWithChildren } from 'react'
import type { SignupErrorDto } from '#/libs/signup-errors'
import { signupErrorText } from './signup-error-text'

interface SignupErrorProps extends PropsWithChildren {
  error: SignupErrorDto | null
}

/**
 * One red box with what went wrong, read out when it appears. `children` sit
 * under the words — the one thing the visitor can do about it, when there is
 * one (use the phone's WhatsApp, chat to us).
 */
function SignupError({ error, children }: SignupErrorProps) {
  if (!error) return null

  return (
    <Stack
      role="alert"
      gap={2.5}
      px={4}
      py={3}
      align="flex-start"
      rounded="14px"
      color="red.700"
      bg="red.50"
      borderWidth="1px"
      borderColor="red.200"
    >
      <Text fontSize="13.5px" lineHeight="1.5">
        {signupErrorText(error)}
      </Text>
      {children}
    </Stack>
  )
}

export default SignupError
