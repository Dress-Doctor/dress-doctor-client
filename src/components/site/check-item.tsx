import { Center, HStack, Icon, Text } from '@chakra-ui/react'
import type { StackProps } from '@chakra-ui/react'
import icons from '#/config/icons'

interface CheckItemProps extends StackProps {
  label: string
  /** `light` is the navy-panel palette; `dark` the one on white. */
  tone?: 'dark' | 'light'
}

/**
 * A ticked promise — one line of the reassurance lists beside the estimator
 * and the testimonials.
 */
function CheckItem({ label, tone = 'dark', ...props }: CheckItemProps) {
  const onNavy = tone === 'light'

  return (
    <HStack gap={2.5} align="flex-start" {...props}>
      <Center
        flex="none"
        boxSize="22px"
        mt={0.5}
        rounded="full"
        bg={onNavy ? 'rgba(46, 207, 220, 0.16)' : 'rgba(46, 207, 220, 0.12)'}
      >
        <Icon
          aria-hidden
          boxSize={3}
          as={icons.check}
          strokeWidth="3"
          color={onNavy ? 'turquoise-blue.500' : 'turquoise-blue.700'}
        />
      </Center>

      <Text
        fontSize={{ base: 'sm', md: 'md' }}
        lineHeight="1.5"
        color={onNavy ? 'whiteAlpha.800' : 'site.ink-muted'}
      >
        {label}
      </Text>
    </HStack>
  )
}

export default CheckItem
