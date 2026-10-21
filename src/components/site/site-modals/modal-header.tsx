import { Box, CloseButton, Dialog, Flex, Heading, Text } from '@chakra-ui/react'
import type { PropsWithChildren } from 'react'

/** The side padding every part of a form shares, so the edges line up. */
export const modalPadX = { base: 5, md: 8 } as const

interface ModalHeaderProps extends PropsWithChildren {
  eyebrow: string
  title: string
  sub?: string
  closeLabel: string
}

/**
 * The top of a form: a small turquoise label, the question, one line of help
 * and the close button. `children` sit above the label — the booking form puts
 * its progress bar there.
 */
function ModalHeader({
  eyebrow,
  title,
  sub,
  closeLabel,
  children,
}: ModalHeaderProps) {
  return (
    <Flex
      flex="none"
      gap={4}
      align="flex-start"
      justify="space-between"
      px={modalPadX}
      pt={{ base: 5, md: 6 }}
    >
      <Box flex="1" minW={0}>
        {children}

        <Text
          mt={children ? 3 : 0}
          fontFamily="label"
          fontSize="xs"
          fontWeight="bold"
          letterSpacing="0.12em"
          textTransform="uppercase"
          color="turquoise-blue.700"
        >
          {eyebrow}
        </Text>

        <Heading
          as="h2"
          mt={1.5}
          fontSize={{ base: '22px', md: '26px' }}
          fontWeight="bold"
          lineHeight="1.15"
          letterSpacing="-0.02em"
          textWrap="balance"
          color="site.ink"
        >
          {title}
        </Heading>

        {sub && (
          <Text
            mt={1.5}
            fontSize="14.5px"
            lineHeight="1.5"
            color="site.ink-muted"
          >
            {sub}
          </Text>
        )}
      </Box>

      <Dialog.CloseTrigger asChild position="static" flex="none">
        <CloseButton
          rounded="full"
          boxSize={9}
          color="site.ink"
          bg="site.sunken"
          colorPalette="gray"
          aria-label={closeLabel}
          _hover={{ bg: 'rgba(0, 23, 31, 0.08)' }}
        />
      </Dialog.CloseTrigger>
    </Flex>
  )
}

export default ModalHeader
