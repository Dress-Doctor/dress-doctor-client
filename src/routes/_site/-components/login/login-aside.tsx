import { Box, HStack, Icon, Image, Text } from '@chakra-ui/react'
import type { ElementType } from 'react'
import driverImage from '#/assets/imagery/login-driver.webp'
import icons from '#/config/icons'
import { m } from '#/paraglide/messages'

interface AsideProps {
  /** `contact` while asking for the email or number, `code` after. */
  step: 'contact' | 'code'
}

interface PillProps {
  icon: ElementType
  label: string
}

/** A small frosted tag on the photo. */
function Pill({ icon, label }: PillProps) {
  return (
    <HStack
      gap={2}
      px={3.5}
      py={2}
      rounded="full"
      color="white"
      fontSize="12.5px"
      fontWeight="semibold"
      bg="rgba(255, 255, 255, 0.12)"
      borderWidth="1px"
      borderColor="rgba(255, 255, 255, 0.22)"
      backdropFilter="blur(8px)"
    >
      <Icon aria-hidden boxSize={3.5} as={icon} />
      <Text as="span">{label}</Text>
    </HStack>
  )
}

/**
 * The photo side of the login page. It says what logging in gets the customer,
 * and changes with the step. Decorative: everything useful is on the form, so
 * it is left out below the large breakpoint rather than pushed under it.
 */
function LoginAside({ step }: AsideProps) {
  const isCode = step === 'code'

  return (
    <Box
      display={{ base: 'none', lg: 'block' }}
      bg="dark-bluish-gray.700"
      p={6}
    >
      <Box
        position="relative"
        h="full"
        minH="40rem"
        overflow="hidden"
        rounded="32px"
        bg="dark-bluish-gray.600"
      >
        <Image
          src={driverImage}
          alt=""
          width={1008}
          height={1066}
          position="absolute"
          inset={0}
          w="full"
          h="full"
          objectFit="cover"
          objectPosition="center top"
        />

        {/* Darkens the lower half so the words stay readable on the photo. */}
        <Box
          position="absolute"
          inset={0}
          bgImage="linear-gradient(to top, rgba(7, 10, 13, 0.92) 0%, rgba(7, 10, 13, 0.55) 40%, transparent 75%)"
        />

        <HStack
          position="absolute"
          top={5}
          left={5}
          gap={2}
          px={3.5}
          py={2}
          rounded="full"
          fontSize="12.5px"
          fontWeight="semibold"
          color="turquoise-blue.700"
          bg="rgba(255, 255, 255, 0.92)"
          backdropFilter="blur(8px)"
        >
          <Icon
            aria-hidden
            boxSize={4}
            as={isCode ? icons.check : icons.pickups}
          />
          <Text as="span">
            {isCode ? m.auth_aside_codeChip() : m.site_nav_freePickup()}
          </Text>
        </HStack>

        <Box
          position="absolute"
          insetInline={0}
          bottom={0}
          p={{ lg: 7, xl: 9 }}
        >
          <Text
            as="p"
            maxW="18ch"
            fontSize="clamp(28px, 2.6vw, 38px)"
            fontWeight="semibold"
            lineHeight="1.1"
            letterSpacing="-0.02em"
            textWrap="balance"
            color="white"
          >
            {isCode ? m.auth_aside_codeTitle() : m.auth_aside_loginTitle()}
          </Text>
          <Text
            mt={3}
            maxW="44ch"
            fontSize="15px"
            lineHeight="1.6"
            textWrap="pretty"
            color="rgba(255, 255, 255, 0.82)"
          >
            {isCode ? m.auth_aside_codeLead() : m.auth_aside_loginLead()}
          </Text>

          <HStack mt={5} gap={2.5} wrap="wrap">
            {isCode ? (
              <>
                <Pill icon={icons.clock} label={m.auth_aside_pillExpire()} />
                <Pill icon={icons.secure} label={m.auth_aside_pillPrivate()} />
              </>
            ) : (
              <>
                <Pill icon={icons.pickups} label={m.auth_aside_pillFree()} />
                <Pill
                  icon={icons.clock}
                  label={m.auth_aside_pillTurnaround()}
                />
                <Pill icon={icons.sparkles} label={m.auth_aside_pillCancel()} />
              </>
            )}
          </HStack>
        </Box>
      </Box>
    </Box>
  )
}

export default LoginAside
