import {
  Box,
  Heading,
  HStack,
  Icon,
  Link as ChakraLink,
  Stack,
  Text,
} from '@chakra-ui/react'
import icons from '#/config/icons'
import Reveal from '#/components/site/reveal'
import SiteButton from '#/components/site/site-button'
import SiteContainer from '#/components/site/site-container'
import { aboutPhones } from '#/data/about.data'
import { siteContact } from '#/data/site.data'
import { useSiteModals } from '#/hooks/use-site-modals'
import { m } from '#/paraglide/messages'

const contactLink = {
  color: 'white',
  fontWeight: 'semibold',
  _hover: { color: 'turquoise-blue.300' },
} as const

/** The closing ask, with every way to reach us beneath it. */
function AboutCta() {
  const { openBooking } = useSiteModals()

  return (
    <SiteContainer
      as="section"
      pt={{ base: 10, md: 16 }}
      pb={{ base: 16, md: '110px' }}
    >
      <Reveal
        position="relative"
        overflow="hidden"
        rounded="32px"
        textAlign="center"
        bg="dark-bluish-gray.500"
        px={{ base: 6, md: 12 }}
        py={{ base: 14, md: '80px' }}
      >
        <Box
          aria-hidden
          position="absolute"
          top="-200px"
          left="50%"
          w="900px"
          h="500px"
          transform="translateX(-50%)"
          pointerEvents="none"
          bgImage="radial-gradient(ellipse, rgba(46, 207, 220, 0.28) 0%, transparent 60%)"
        />

        <Heading
          as="h2"
          position="relative"
          fontSize={{ base: '34px', md: '44px' }}
          fontWeight="semibold"
          lineHeight="1.08"
          letterSpacing="-0.028em"
          textWrap="balance"
          color="white"
        >
          {m.about_cta_title()}
        </Heading>

        <Text
          position="relative"
          mx="auto"
          mt={4}
          maxW="52ch"
          fontSize={{ base: 'md', md: '17.5px' }}
          color="whiteAlpha.700"
        >
          {m.about_cta_lead()}
        </Text>

        <HStack
          position="relative"
          mt={9}
          gap={3.5}
          rowGap={3}
          wrap="wrap"
          justify="center"
        >
          <SiteButton
            px="34px"
            aria-haspopup="dialog"
            onClick={() => openBooking()}
          >
            {m.home_cta_primary()}
            <Icon aria-hidden boxSize={4} as={icons.forward} />
          </SiteButton>

          <SiteButton asChild variant="onDark" px="30px">
            <ChakraLink
              target="_blank"
              rel="noopener"
              href={siteContact.whatsappHref}
            >
              <Icon
                aria-hidden
                boxSize={4.5}
                as={icons.whatsappBrand}
                color="site.whatsapp"
              />
              {m.home_cta_whatsapp()}
            </ChakraLink>
          </SiteButton>
        </HStack>

        <Stack
          position="relative"
          as="dl"
          mt={12}
          gap={5}
          direction={{ base: 'column', md: 'row' }}
          justify="center"
          align={{ base: 'center', md: 'flex-start' }}
          textAlign="center"
          fontSize="15px"
          color="whiteAlpha.700"
        >
          <Box>
            <Text as="dt">{m.about_cta_website()}</Text>
            <Text as="dd">
              <ChakraLink {...contactLink} href="https://www.dressdoctor.io">
                www.dressdoctor.io
              </ChakraLink>
            </Text>
          </Box>
          <Box>
            <Text as="dt">{m.about_cta_phone()}</Text>
            {aboutPhones.map((phone) => (
              <Text as="dd" key={phone.href}>
                <ChakraLink {...contactLink} href={phone.href}>
                  {phone.display}
                </ChakraLink>
              </Text>
            ))}
          </Box>
          <Box>
            <Text as="dt">{m.about_cta_email()}</Text>
            <Text as="dd">
              <ChakraLink {...contactLink} href={siteContact.emailHref}>
                {siteContact.email}
              </ChakraLink>
            </Text>
          </Box>
        </Stack>
      </Reveal>
    </SiteContainer>
  )
}

export default AboutCta
