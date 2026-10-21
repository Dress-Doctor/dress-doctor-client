import {
  Center,
  Flex,
  Icon,
  Image,
  Link as ChakraLink,
  Stack,
  Text,
} from '@chakra-ui/react'
import type { SystemStyleObject } from '@chakra-ui/react'
import { Link } from '@tanstack/react-router'
import icons from '#/config/icons'
import type { SiteServiceDto } from '#/interfaces/site.dto'

/**
 * Fades the illustration out towards its left and bottom edges, so a photo
 * with its own background has no hard rectangle edge on the card — it melts
 * into the white instead. Two gradients, kept only where both are opaque.
 */
const edgeFade =
  'linear-gradient(to left, black 45%, transparent 100%), linear-gradient(to bottom, black 55%, transparent 100%)'

/**
 * The illustration sits behind the card's content in the top-right corner.
 * It is taken out of the flow, so the title and description keep the full
 * width of the card instead of being pushed aside by it.
 */
const visualLayout: SystemStyleObject = {
  position: 'absolute',
  top: 0,
  right: 0,
  w: '80%',
  h: { base: '150px', md: '170px' },
  pointerEvents: 'none',
  maskImage: edgeFade,
  WebkitMaskImage: edgeFade,
  maskComposite: 'intersect',
  WebkitMaskComposite: 'source-in',
  transitionProperty: 'transform',
  transitionDuration: 'moderate',
  transformOrigin: 'top right',
  _groupHover: { transform: 'scale(1.05)' },
  _motionReduce: { transition: 'none' },
}

/**
 * The picture that shows the service at a glance. Decorative — the title
 * says the same thing — so it is hidden from screen readers.
 *
 * `multiply` makes a white photo background disappear into the white card.
 * Until an illustration is supplied (`service.image`), a soft tinted panel
 * with the service's icon holds its place, faded the same way.
 */
function ServiceVisual({ service }: { service: SiteServiceDto }) {
  if (service.image) {
    return (
      <Image
        src={service.image}
        alt=""
        loading="lazy"
        htmlWidth={264}
        htmlHeight={240}
        objectFit="cover"
        mixBlendMode="multiply"
        css={visualLayout}
      />
    )
  }

  return (
    <Center
      aria-hidden
      color="turquoise-blue.700"
      bgGradient="to-bl"
      gradientFrom="rgba(46, 207, 220, 0.16)"
      gradientTo="rgba(255, 137, 74, 0.06)"
      css={visualLayout}
    >
      <Icon as={service.icon} boxSize={14} opacity={0.3} />
    </Center>
  )
}

/**
 * One service in the home grid — mark and name, what it covers, and the price
 * it starts at, over an illustration in the corner. The whole card is the
 * link, so the target is the card, not the arrow in its corner.
 */
function ServiceCard({ service }: { service: SiteServiceDto }) {
  return (
    <ChakraLink
      asChild
      className="group"
      position="relative"
      overflow="hidden"
      display="block"
      h="full"
      p={{ base: 6, md: 7 }}
      rounded="22px"
      bg="white"
      textDecoration="none"
      borderWidth="1px"
      borderColor="rgba(0, 23, 31, 0.06)"
      boxShadow="0 1px 2px rgba(0, 23, 31, 0.03), 0 12px 32px rgba(0, 23, 31, 0.04)"
      transitionProperty="box-shadow, transform, border-color"
      transitionDuration="moderate"
      _motionReduce={{ transition: 'none', _hover: { transform: 'none' } }}
      _hover={{
        transform: 'translateY(-4px)',
        borderColor: 'rgba(46, 207, 220, 0.35)',
        boxShadow:
          '0 2px 4px rgba(0, 23, 31, 0.04), 0 28px 60px rgba(46, 207, 220, 0.16)',
      }}
    >
      <Link to={service.to}>
        <ServiceVisual service={service} />

        {/* Above the illustration, so text always reads on top of it. */}
        <Stack gap={0} h="full" position="relative" zIndex={1}>
          <Center
            boxSize="46px"
            rounded="14px"
            color="turquoise-blue.700"
            bg="rgba(255, 255, 255, 0.85)"
            backdropFilter="blur(6px)"
            borderWidth="1px"
            borderColor="rgba(46, 207, 220, 0.3)"
            boxShadow="0 4px 12px rgba(0, 23, 31, 0.06)"
          >
            <Icon aria-hidden as={service.icon} boxSize={5} />
          </Center>

          {/*
            The title starts where the illustration has faded out, so it never
            sits on top of the picture.
          */}
          <Text
            as="h3"
            mt={{ base: '72px', md: '86px' }}
            fontSize="xl"
            fontWeight="semibold"
            lineHeight="1.25"
            color="site.ink"
          >
            {service.name()}
          </Text>

          <Text
            mt={2}
            fontSize="14.5px"
            lineHeight="1.6"
            color="site.ink-muted"
            textWrap="pretty"
          >
            {service.summary()}
          </Text>

          <Flex mt="auto" pt={4} gap={3} align="center" justify="space-between">
            <Text
              fontFamily="display"
              fontSize="13.5px"
              fontWeight="bold"
              color="amber-orange.500"
            >
              {service.price()}
            </Text>

            <Center
              flex="none"
              boxSize="30px"
              rounded="full"
              color="turquoise-blue.700"
              bg="rgba(46, 207, 220, 0.12)"
              transitionProperty="background, color"
              transitionDuration="moderate"
              _groupHover={{ bg: 'turquoise-blue.500', color: 'white' }}
            >
              <Icon aria-hidden boxSize={3.5} as={icons.forward} />
            </Center>
          </Flex>
        </Stack>
      </Link>
    </ChakraLink>
  )
}

export default ServiceCard
