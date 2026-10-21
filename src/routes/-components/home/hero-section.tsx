import {
  Box,
  Center,
  Grid,
  Heading,
  HStack,
  Icon,
  Image,
  Link as ChakraLink,
  Stack,
  Text,
} from '@chakra-ui/react'
import type { BoxProps } from '@chakra-ui/react'
import heroImage from '#/assets/imagery/hero.webp'
import heroImage640 from '#/assets/imagery/hero-640.webp'
import { Link } from '@tanstack/react-router'
import icons from '#/config/icons'
import SiteButton from '#/components/site/site-button'
import SiteContainer from '#/components/site/site-container'
import StarRating from '#/components/site/star-rating'
import { homeAnchors, siteContact } from '#/data/site.data'
import { useSiteModals } from '#/hooks/use-site-modals'
import { m } from '#/paraglide/messages'
import FloatingCard from './floating-card'

/** Entrance motion shared by the hero's left column, staggered per element. */
const entrance = (delay: string) => ({
  animationName: 'slide-from-bottom, fade-in',
  animationDuration: '0.7s',
  animationDelay: delay,
  animationTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
  animationFillMode: 'both' as const,
  _motionReduce: { animation: 'none' },
})

/** A soft coloured cloud behind the hero. Decorative, and never interactive. */
function Glow(props: BoxProps) {
  return (
    <Box
      aria-hidden
      position="absolute"
      rounded="full"
      pointerEvents="none"
      display={{ base: 'none', md: 'block' }}
      _motionReduce={{ animation: 'none' }}
      {...props}
    />
  )
}

function HeroSection() {
  const { openBooking } = useSiteModals()

  return (
    <Box as="section" position="relative">
      <Glow
        top="-140px"
        right="-160px"
        boxSize="720px"
        animation="dd-drift 14s ease-in-out infinite"
        bgImage="radial-gradient(circle, rgba(46, 207, 220, 0.16) 0%, rgba(46, 207, 220, 0.05) 40%, transparent 68%)"
      />
      <Glow
        bottom="-120px"
        left="-180px"
        boxSize="560px"
        animation="dd-drift 18s ease-in-out infinite reverse"
        bgImage="radial-gradient(circle, rgba(255, 137, 74, 0.09) 0%, transparent 65%)"
      />
      <Glow
        top="120px"
        left="44%"
        boxSize="380px"
        borderWidth="1px"
        borderColor="rgba(46, 207, 220, 0.14)"
      />

      <SiteContainer position="relative" pt={{ base: 12, lg: '84px' }} pb={24}>
        <Grid
          gap={{ base: 12, lg: 16 }}
          alignItems="center"
          templateColumns={{ base: '1fr', lg: '1.05fr 1fr' }}
        >
          <Stack gap={0}>
            <HStack
              gap={2.5}
              px={4}
              py={2}
              rounded="full"
              alignSelf="flex-start"
              fontSize="12.5px"
              fontWeight="semibold"
              letterSpacing="0.1em"
              fontFamily="label"
              textTransform="uppercase"
              color="turquoise-blue.700"
              bg="rgba(255, 255, 255, 0.7)"
              borderWidth="1px"
              borderColor="rgba(46, 207, 220, 0.3)"
              boxShadow="0 4px 16px rgba(46, 207, 220, 0.12)"
              backdropFilter="blur(8px)"
              {...entrance('0s')}
            >
              <Box
                boxSize="7px"
                rounded="full"
                bg="turquoise-blue.500"
                boxShadow="0 0 0 4px rgba(46, 207, 220, 0.18)"
              />
              {m.home_hero_badge()}
            </HStack>

            <Heading
              as="h1"
              mt="26px"
              fontSize={{ base: '40px', md: '52px', xl: '64px' }}
              fontWeight="semibold"
              lineHeight="1.03"
              letterSpacing="-0.028em"
              textWrap="balance"
              // No entrance animation: the heading is the first thing a
              // visitor reads and usually the largest element on screen, so
              // it paints at once rather than fading in.
            >
              {m.home_hero_titleBefore()}{' '}
              <Text
                as="span"
                bgGradient="to-r"
                gradientFrom="#24B9C6"
                gradientTo="#FF894A"
                bgClip="text"
                color="transparent"
              >
                {m.home_hero_titleHighlight()}
              </Text>
              {m.home_hero_titleAfter()}
            </Heading>

            <Text
              mt="22px"
              maxW="48ch"
              fontSize={{ base: 'md', md: '18.5px' }}
              lineHeight="1.65"
              textWrap="pretty"
              color="site.ink-muted"
              {...entrance('0.16s')}
            >
              {m.home_hero_subtitle()}
            </Text>

            <HStack
              gap={3.5}
              mt="34px"
              wrap="wrap"
              alignSelf="flex-start"
              {...entrance('0.24s')}
            >
              <SiteButton aria-haspopup="dialog" onClick={() => openBooking()}>
                {m.home_hero_ctaPrimary()}
                <Icon aria-hidden boxSize={4} as={icons.forward} />
              </SiteButton>

              <SiteButton asChild variant="glass" px="30px">
                <Link to="/" hash={homeAnchors.estimate}>
                  {m.home_hero_ctaSecondary()}
                </Link>
              </SiteButton>
            </HStack>

            <ChakraLink
              mt="22px"
              gap={2.5}
              alignSelf="flex-start"
              fontSize="14.5px"
              fontWeight="medium"
              textDecoration="none"
              color="site.ink-muted"
              target="_blank"
              rel="noopener"
              href={siteContact.whatsappHref}
              _hover={{ color: 'site.ink' }}
              {...entrance('0.32s')}
            >
              <Center
                flex="none"
                boxSize="27px"
                rounded="full"
                bg="site.whatsapp"
                boxShadow="0 4px 12px rgba(37, 211, 102, 0.35)"
              >
                <Icon
                  aria-hidden
                  boxSize={3.5}
                  color="white"
                  as={icons.whatsappBrand}
                />
              </Center>
              {m.home_hero_whatsapp()}
            </ChakraLink>

            <HStack gap={3} mt={9} wrap="wrap" {...entrance('0.4s')}>
              <StarRating label={m.home_testimonials_a11y_rating()} />
              <Text fontSize="sm" color="site.ink-muted">
                <Text
                  as="span"
                  fontFamily="display"
                  fontWeight="bold"
                  color="site.ink"
                >
                  {m.home_hero_ratingScore()}
                </Text>{' '}
                {m.home_hero_rating()}
              </Text>
            </HStack>
          </Stack>

          <Box
            position="relative"
            animationName="slide-from-bottom, fade-in"
            animationDuration="0.9s"
            animationDelay="0.2s"
            animationTimingFunction="cubic-bezier(0.16, 1, 0.3, 1)"
            animationFillMode="both"
            _motionReduce={{ animation: 'none' }}
          >
            <Box
              aria-hidden
              position="absolute"
              inset="24px -20px -28px 20px"
              rounded="32px"
              filter="blur(2px)"
              transform="rotate(2.5deg)"
              bgGradient="to-br"
              gradientFrom="rgba(46, 207, 220, 0.22)"
              gradientTo="rgba(255, 137, 74, 0.12)"
              display={{ base: 'none', md: 'block' }}
            />

            <Image
              src={heroImage}
              // Phones get the 640px file; the full 1008px one is only
              // fetched for wide or high-density screens.
              srcSet={`${heroImage640} 640w, ${heroImage} 1008w`}
              sizes="(min-width: 80rem) 580px, (min-width: 64rem) 46vw, 100vw"
              alt={m.home_hero_imageAlt()}
              htmlWidth={1008}
              htmlHeight={1066}
              fetchPriority="high"
              position="relative"
              w="full"
              h={{ base: '340px', md: '460px', xl: '520px' }}
              objectFit="cover"
              rounded="28px"
              boxShadow="0 40px 80px rgba(0, 23, 31, 0.22), 0 2px 4px rgba(0, 23, 31, 0.08)"
            />

            <FloatingCard
              accent="turquoise"
              icon={icons.pickups}
              top={{ base: 4, md: '26px' }}
              right={{ base: 4, md: '-22px' }}
              title={m.home_hero_cardPickupTitle()}
              subtitle={m.home_hero_cardPickupSub()}
              animation="dd-float 5s ease-in-out infinite"
            />

            <FloatingCard
              accent="amber"
              icon={icons.clock}
              bottom={{ base: 4, md: '34px' }}
              left={{ base: 4, md: '-26px' }}
              title={m.home_hero_cardEtaTitle()}
              subtitle={m.home_hero_cardEtaSub()}
              animation="dd-float-far 6.5s ease-in-out 0.8s infinite"
            />

            <HStack
              gap={2.5}
              px={4}
              py={3}
              rounded="16px"
              position="absolute"
              top="46%"
              left="-34px"
              bg="rgba(32, 41, 56, 0.86)"
              backdropFilter="blur(12px)"
              boxShadow="0 18px 40px rgba(0, 23, 31, 0.3)"
              animation="dd-float 7.5s ease-in-out 1.6s infinite"
              display={{ base: 'none', xl: 'flex' }}
              _motionReduce={{ animation: 'none' }}
            >
              <Icon
                aria-hidden
                boxSize={4}
                as={icons.check}
                strokeWidth="2.4"
                color="turquoise-blue.500"
              />
              <Text fontSize="13px" fontWeight="semibold" color="white">
                {m.home_hero_cardOrder()}
              </Text>
            </HStack>
          </Box>
        </Grid>
      </SiteContainer>

      <Center pb="26px" position="relative">
        <Icon
          aria-hidden
          boxSize={5}
          as={icons.chevronDown}
          color="site.ink-muted"
          animation="dd-bounce 1.8s ease-in-out infinite"
          _motionReduce={{ animation: 'none' }}
        />
      </Center>
    </Box>
  )
}

export default HeroSection
