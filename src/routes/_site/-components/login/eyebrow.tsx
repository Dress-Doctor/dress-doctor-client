import { HStack, Icon, Text } from '@chakra-ui/react'
import type { ElementType, PropsWithChildren } from 'react'

type EyebrowTone = 'brand' | 'whatsapp'

interface EyebrowProps extends PropsWithChildren {
  icon: ElementType
  tone?: EyebrowTone
}

const tones = {
  brand: { bg: 'turquoise-blue.50', color: 'turquoise-blue.700' },
  whatsapp: { bg: 'rgba(37, 211, 102, 0.14)', color: 'green.700' },
} as const

/** The small capital-letter tag above a heading. */
function Eyebrow({ icon, tone = 'brand', children }: EyebrowProps) {
  return (
    <HStack
      display="inline-flex"
      gap={2}
      px={3}
      py={1.5}
      rounded="full"
      {...tones[tone]}
    >
      <Icon aria-hidden boxSize={3.5} as={icon} />
      <Text
        as="span"
        fontFamily="label"
        fontSize="11.5px"
        fontWeight="bold"
        letterSpacing="0.08em"
        textTransform="uppercase"
      >
        {children}
      </Text>
    </HStack>
  )
}

export default Eyebrow
