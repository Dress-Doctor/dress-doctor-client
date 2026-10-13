import { Text } from '@chakra-ui/react'
import type { PropsWithChildren } from 'react'

/**
 * A line of error text under a group of cards, where there is no single box
 * for `Field` to attach one to. Renders nothing when there is nothing to say,
 * and is read out when it appears.
 */
function FieldMessage({ children }: PropsWithChildren) {
  return (
    <Text role="alert" fontSize="12.5px" color="red.600" hidden={!children}>
      {children}
    </Text>
  )
}

export default FieldMessage
