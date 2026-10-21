import { Box, HStack, Icon, Text } from '@chakra-ui/react'
import type { ElementType, PropsWithChildren } from 'react'

interface InfoNoteProps extends PropsWithChildren {
  icon: ElementType
  /** Colour of the round mark at the start: the WhatsApp green or the brand. */
  tone?: 'brand' | 'whatsapp'
}

/** A quiet card with one tip, under the main button. */
function InfoNote({ icon, tone = 'brand', children }: InfoNoteProps) {
  const whatsapp = tone === 'whatsapp'

  return (
    <HStack
      align="flex-start"
      gap={3}
      p={3.5}
      bg="site.sunken"
      rounded="16px"
      borderWidth="1px"
      borderColor="rgba(0, 23, 31, 0.06)"
    >
      <Box
        flex="none"
        display="grid"
        placeItems="center"
        boxSize={9}
        rounded="10px"
        bg={whatsapp ? 'rgba(37, 211, 102, 0.14)' : 'turquoise-blue.50'}
        color={whatsapp ? 'green.600' : 'turquoise-blue.700'}
      >
        <Icon aria-hidden boxSize={4.5} as={icon} />
      </Box>
      <Text fontSize="13px" lineHeight="1.55" color="site.ink-muted">
        {children}
      </Text>
    </HStack>
  )
}

export default InfoNote
