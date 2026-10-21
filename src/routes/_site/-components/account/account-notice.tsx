import { Text } from '@chakra-ui/react'
import type { PropsWithChildren } from 'react'

/**
 * A note at the top of a page, for something that happened that the customer
 * should read: a plan or a pickup that had already changed. It is read out
 * when it appears.
 */
function AccountNotice({ children }: PropsWithChildren) {
  return (
    <Text
      role="alert"
      p={4}
      rounded="16px"
      bg="amber-orange.50"
      borderWidth="1px"
      borderColor="amber-orange.200"
      fontSize="14.5px"
      lineHeight="1.55"
      textWrap="pretty"
      color="amber-orange.900"
    >
      {children}
    </Text>
  )
}

export default AccountNotice
