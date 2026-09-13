import { Center, HStack, Icon, Stack, Text } from '@chakra-ui/react'
import type { StackProps } from '@chakra-ui/react'
import type { IconType } from 'react-icons/lib'

interface FloatingCardProps extends StackProps {
  icon: IconType
  title: string
  subtitle: string
  /** Which gradient fills the icon tile. */
  accent: 'turquoise' | 'amber'
}

const tiles = {
  turquoise: {
    gradientFrom: '#2ECFDC',
    gradientTo: '#24B9C6',
    boxShadow: '0 6px 14px rgba(46, 207, 220, 0.4)',
  },
  amber: {
    gradientFrom: '#FF9D68',
    gradientTo: '#FF894A',
    boxShadow: '0 6px 14px rgba(255, 137, 74, 0.4)',
  },
} as const

/**
 * One of the frosted cards that hover over the hero photograph — the two
 * promises a first-time visitor is weighing: that pickup is free, and that the
 * clothes come back in two days.
 */
function FloatingCard({
  icon,
  title,
  subtitle,
  accent,
  ...props
}: FloatingCardProps) {
  return (
    <HStack
      gap={3}
      px="18px"
      py={3.5}
      rounded="18px"
      position="absolute"
      bg="rgba(255, 255, 255, 0.78)"
      backdropFilter="blur(14px)"
      borderWidth="1px"
      borderColor="rgba(255, 255, 255, 0.7)"
      boxShadow="0 20px 44px rgba(0, 23, 31, 0.16)"
      _motionReduce={{ animation: 'none' }}
      {...props}
    >
      <Center
        flex="none"
        boxSize={10}
        rounded="13px"
        color="white"
        bgGradient="to-br"
        {...tiles[accent]}
      >
        <Icon aria-hidden as={icon} boxSize={5} />
      </Center>

      <Stack gap={0}>
        <Text fontSize="sm" fontWeight="semibold" color="site.ink">
          {title}
        </Text>
        <Text fontSize="12.5px" color="site.ink-muted">
          {subtitle}
        </Text>
      </Stack>
    </HStack>
  )
}

export default FloatingCard
