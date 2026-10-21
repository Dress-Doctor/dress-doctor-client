import { Box, Center, Heading, Icon, Text } from '@chakra-ui/react'
import { keyframes } from '@emotion/react'
import type { PropsWithChildren } from 'react'
import icons from '#/config/icons'

const pop = keyframes`
  0% { transform: scale(0.4); opacity: 0; }
  60% { transform: scale(1.1); }
  100% { transform: scale(1); opacity: 1; }
`

interface SuccessHeroProps extends PropsWithChildren {
  title: string
  body: string
}

/**
 * The top of a finished form: a ticked circle that pops in, a short headline
 * and one line of what happens next, on a pale turquoise wash. `children` sit
 * under the text — the booking form shows its reference number there.
 */
function SuccessHero({ title, body, children }: SuccessHeroProps) {
  return (
    <Box
      flex="none"
      px={{ base: 5, md: 7 }}
      pt={{ base: 8, md: 9 }}
      pb={{ base: 6, md: 7 }}
      textAlign="center"
      borderBottomWidth="1px"
      borderColor="rgba(0, 23, 31, 0.06)"
      bgImage="radial-gradient(700px 300px at 50% 0%, rgba(46, 207, 220, 0.18), transparent 65%), linear-gradient(180deg, #E8FAFC 0%, #FBFDFD 100%)"
    >
      <Center
        mx="auto"
        mb={3.5}
        boxSize="72px"
        rounded="full"
        bg="white"
        color="turquoise-blue.600"
        boxShadow="0 24px 48px -16px rgba(36, 169, 181, 0.45), 0 0 0 8px rgba(46, 207, 220, 0.12)"
        animation={`${pop} 0.5s cubic-bezier(0.5, 1.7, 0.5, 1) both`}
        _motionReduce={{ animation: 'none' }}
      >
        <Icon aria-hidden boxSize={7} as={icons.check} strokeWidth="2.4" />
      </Center>

      <Heading
        as="h2"
        mb={1.5}
        fontSize={{ base: '22px', md: '26px' }}
        fontWeight="bold"
        letterSpacing="-0.02em"
        color="site.ink"
      >
        {title}
      </Heading>

      <Text
        mx="auto"
        maxW="52ch"
        fontSize="14.5px"
        lineHeight="1.55"
        color="site.ink-muted"
      >
        {body}
      </Text>

      {children}
    </Box>
  )
}

export default SuccessHero
