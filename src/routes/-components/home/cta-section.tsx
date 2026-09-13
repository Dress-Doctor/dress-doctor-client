import {
  Box,
  Heading,
  HStack,
  Icon,
  Link as ChakraLink,
  Text,
} from '@chakra-ui/react'
import { Link } from '@tanstack/react-router'
import icons from '#/config/icons'
import Reveal from '#/components/site/reveal'
import SiteButton from '#/components/site/site-button'
import SiteContainer from '#/components/site/site-container'
import { siteContact, sitePaths } from '#/data/site.data'
import { m } from '#/paraglide/messages'

/** The closing ask, on the same navy panel the estimator uses. */
function CtaSection() {
  return (
    <SiteContainer
      as="section"
      pt={{ base: 16, md: '120px' }}
      pb={{ base: 16, md: '110px' }}
    >
      <Reveal
        position="relative"
        overflow="hidden"
        rounded="32px"
        textAlign="center"
        bg="dark-bluish-gray.500"
        px={{ base: 6, md: 12 }}
        py={{ base: 14, md: '88px' }}
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
        <Box
          aria-hidden
          position="absolute"
          bottom="-160px"
          right="-80px"
          boxSize="420px"
          rounded="full"
          pointerEvents="none"
          bgImage="radial-gradient(circle, rgba(255, 137, 74, 0.14) 0%, transparent 65%)"
        />

        <Heading
          as="h2"
          position="relative"
          fontSize={{ base: '34px', md: '44px', xl: '52px' }}
          fontWeight="semibold"
          lineHeight="1.08"
          letterSpacing="-0.028em"
          textWrap="balance"
          color="white"
        >
          {m.home_cta_title()}
        </Heading>

        <Text
          position="relative"
          mx="auto"
          mt={4}
          maxW="44ch"
          fontSize={{ base: 'md', md: '17.5px' }}
          color="whiteAlpha.700"
        >
          {m.home_cta_lead()}
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
            asChild
            px="34px"
            boxShadow="0 16px 40px rgba(46, 207, 220, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.4)"
          >
            <Link to={sitePaths.booking}>
              {m.home_cta_primary()}
              <Icon aria-hidden boxSize={4} as={icons.forward} />
            </Link>
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
      </Reveal>
    </SiteContainer>
  )
}

export default CtaSection
