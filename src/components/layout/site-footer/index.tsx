import {
  Box,
  Flex,
  HStack,
  Icon,
  Image,
  Link as ChakraLink,
  SimpleGrid,
  Stack,
  Text,
} from '@chakra-ui/react'
import { Link } from '@tanstack/react-router'
import whiteMark from '#/assets/logos/dress-doctor-white.png'
import icons from '#/config/icons'
import SiteButton from '#/components/site/site-button'
import SiteContainer from '#/components/site/site-container'
import {
  footerCompanyLinks,
  footerExploreLinks,
  footerLegalLinks,
  siteContact,
  siteServices,
  siteSocials,
} from '#/data/site.data'
import { m } from '#/paraglide/messages'
import FooterColumn from './footer-column'

/** Services reuse the shared list, reshaped into the footer's link form. */
const serviceLinks = siteServices.map((service) => ({
  id: service.id,
  to: service.to,
  label: service.name,
}))

/**
 * The navy footer that closes every page on the public site.
 *
 * The oversized strapline behind the columns is set at 2.8% white — a texture
 * rather than a message, and marked `aria-hidden` because the same words are
 * already read out in the paragraph above it.
 */
function SiteFooter() {
  return (
    <Box
      as="footer"
      position="relative"
      overflow="hidden"
      bg="dark-bluish-gray.500"
      color="whiteAlpha.700"
    >
      <Box
        aria-hidden
        position="absolute"
        top="-180px"
        right="-120px"
        boxSize="560px"
        rounded="full"
        pointerEvents="none"
        bgImage="radial-gradient(circle, rgba(46, 207, 220, 0.13) 0%, transparent 65%)"
      />
      <Box
        aria-hidden
        position="absolute"
        bottom="-220px"
        left="-100px"
        boxSize="520px"
        rounded="full"
        pointerEvents="none"
        bgImage="radial-gradient(circle, rgba(255, 137, 74, 0.08) 0%, transparent 65%)"
      />
      <Text
        aria-hidden
        position="absolute"
        bottom="-30px"
        left={0}
        right={0}
        textAlign="center"
        fontFamily="display"
        fontSize={{ base: '64px', md: '110px', xl: '150px' }}
        fontWeight="extrabold"
        letterSpacing="-0.04em"
        whiteSpace="nowrap"
        userSelect="none"
        pointerEvents="none"
        color="rgba(255, 255, 255, 0.028)"
      >
        {m.site_footer_watermark()}
      </Text>

      <SiteContainer position="relative" pt={{ base: 12, md: '72px' }}>
        <SimpleGrid
          gap={{ base: 10, md: 11 }}
          columns={{ base: 1, sm: 2, lg: 4 }}
          templateColumns={{ lg: '1.7fr 1fr 1fr 1fr' }}
        >
          <Stack gap={0} gridColumn={{ sm: 'span 2', lg: 'auto' }}>
            {/* The white asset is the round mark alone, so the name is set
                beside it, as in the header. */}
            <HStack gap={3} alignSelf="flex-start">
              <Image
                src={whiteMark}
                alt=""
                h="48px"
                w="auto"
                htmlWidth={620}
                htmlHeight={656}
                loading="lazy"
              />
              <Text
                as="span"
                fontFamily="display"
                fontSize="24px"
                fontWeight="extrabold"
                letterSpacing="-0.01em"
                lineHeight="1"
                color="white"
                translate="no"
              >
                Dress Doctor
              </Text>
            </HStack>

            <Text
              mt={4.5}
              maxW="320px"
              fontSize="15px"
              lineHeight="1.65"
              color="whiteAlpha.700"
            >
              {m.site_footer_tagline()}
            </Text>

            <SiteButton
              asChild
              mt={6}
              px={6}
              py="13px"
              fontSize="14.5px"
              alignSelf="flex-start"
              bg="rgba(37, 211, 102, 0.14)"
              borderWidth="1px"
              borderColor="rgba(37, 211, 102, 0.35)"
              boxShadow="none"
              bgGradient="none"
              color="white"
              _hover={{
                bg: 'rgba(37, 211, 102, 0.26)',
                transform: 'translateY(-1px)',
              }}
            >
              <ChakraLink
                target="_blank"
                rel="noopener"
                href={siteContact.whatsappHref}
              >
                <Icon
                  aria-hidden
                  boxSize={4}
                  as={icons.whatsappBrand}
                  color="site.whatsapp"
                />
                {m.site_footer_whatsappCta()}
              </ChakraLink>
            </SiteButton>

            <Stack
              mt={6}
              gap={0}
              fontSize="13.5px"
              lineHeight="1.8"
              color="whiteAlpha.500"
            >
              <Text>{m.site_footer_hours()}</Text>
              <Text>
                <ChakraLink
                  href={siteContact.phoneHref}
                  color="whiteAlpha.700"
                  textDecoration="none"
                  _hover={{ color: 'white' }}
                >
                  {siteContact.phoneDisplay}
                </ChakraLink>
                {' · '}
                <ChakraLink
                  href={siteContact.emailHref}
                  color="whiteAlpha.700"
                  textDecoration="none"
                  _hover={{ color: 'white' }}
                >
                  {siteContact.email}
                </ChakraLink>
              </Text>
            </Stack>

            <HStack mt={5} gap={3} wrap="wrap">
              <Text fontSize="13.5px" color="whiteAlpha.500">
                {m.site_footer_followUs()}
              </Text>

              <HStack as="ul" gap={2} listStyleType="none">
                {siteSocials.map((social) => (
                  <li key={social.id}>
                    <ChakraLink
                      aria-label={social.label()}
                      title={social.label()}
                      target="_blank"
                      rel="noopener"
                      href={social.href}
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      boxSize="40px"
                      rounded="full"
                      color="whiteAlpha.800"
                      bg="whiteAlpha.100"
                      borderWidth="1px"
                      borderColor="whiteAlpha.200"
                      textDecoration="none"
                      transitionProperty="background, border-color, color, transform"
                      transitionDuration="fast"
                      _hover={{
                        color: 'white',
                        bg: 'whiteAlpha.200',
                        borderColor: 'whiteAlpha.400',
                        transform: 'translateY(-1px)',
                      }}
                      _focusVisible={{
                        outline: '2px solid',
                        outlineColor: 'turquoise-blue.500',
                        outlineOffset: '2px',
                      }}
                    >
                      <Icon aria-hidden boxSize={4} as={social.icon} />
                    </ChakraLink>
                  </li>
                ))}
              </HStack>
            </HStack>
          </Stack>

          <FooterColumn
            title={m.site_footer_colServices()}
            links={serviceLinks}
          />
          <FooterColumn
            title={m.site_footer_colCompany()}
            links={footerCompanyLinks}
          />
          <FooterColumn
            title={m.site_footer_colExplore()}
            links={footerExploreLinks}
          />
        </SimpleGrid>

        <Flex
          mt={14}
          py={6}
          gap={4}
          rowGap={3}
          wrap="wrap"
          align="center"
          justify="space-between"
          borderTopWidth="1px"
          borderColor="whiteAlpha.200"
          fontSize="13px"
          color="whiteAlpha.400"
        >
          <Text>
            {m.site_footer_copyright({ year: new Date().getFullYear() })}
          </Text>

          <HStack
            as="ul"
            gap="22px"
            rowGap={2}
            wrap="wrap"
            listStyleType="none"
          >
            {footerLegalLinks.map((link) => (
              <li key={link.id}>
                <ChakraLink
                  asChild
                  color="inherit"
                  textDecoration="none"
                  transitionProperty="color"
                  transitionDuration="fast"
                  _hover={{ color: 'white' }}
                >
                  <Link to={link.to}>{link.label()}</Link>
                </ChakraLink>
              </li>
            ))}
          </HStack>
        </Flex>
      </SiteContainer>
    </Box>
  )
}

export default SiteFooter
