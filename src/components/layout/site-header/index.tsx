import {
  Box,
  HStack,
  Icon,
  IconButton,
  Link as ChakraLink,
} from '@chakra-ui/react'
import icons from '#/config/icons'
import SiteButton from '#/components/site/site-button'
import SiteContainer from '#/components/site/site-container'
import { siteContact, siteNavLinks } from '#/data/site.data'
import { useScrolled } from '#/hooks/use-scrolled'
import { useSiteModals } from '#/hooks/use-site-modals'
import { m } from '#/paraglide/messages'
import InfoBar from './info-bar'
import LocaleSwitch from './locale-switch'
import MobileNav from './mobile-nav'
import NavLink from './nav-link'
import ServicesMenu from './services-menu'
import SiteBrand from './site-brand'

/**
 * The sticky header shared by every page on the public site.
 *
 * Frosted rather than opaque: the hero's turquoise bloom passes under it as
 * the page scrolls, which is what ties the bar to the page behind it.
 *
 * No `active` prop: each entry reads the router with `useMatchRoute`, so a new
 * page lights up its own nav item without the shell having to be told.
 */
function SiteHeader() {
  const scrolled = useScrolled()
  const { openBooking } = useSiteModals()

  return (
    <Box
      as="header"
      position="sticky"
      top={0}
      zIndex="sticky"
      bg="rgba(255, 255, 255, 0.72)"
      backdropFilter="blur(16px) saturate(1.5)"
      borderBottomWidth="1px"
      borderColor="rgba(0, 23, 31, 0.06)"
    >
      <InfoBar collapsed={scrolled} />

      <SiteContainer>
        <HStack h="78px" gap={6} justify="space-between">
          <SiteBrand />

          <HStack
            as="nav"
            gap={1}
            aria-label={m.site_a11y_primaryNav()}
            display={{ base: 'none', lg: 'flex' }}
          >
            <ServicesMenu />

            {siteNavLinks
              .filter((link) => link.key !== 'services')
              .map((link) => (
                <NavLink key={link.key} to={link.to}>
                  {link.label()}
                </NavLink>
              ))}
          </HStack>

          <HStack gap={3} flex="none">
            <Box display={{ base: 'none', md: 'block' }}>
              <LocaleSwitch />
            </Box>

            <IconButton
              asChild
              variant="plain"
              rounded="full"
              boxSize={10}
              color="dark-bluish-gray.500"
              bg="rgba(0, 23, 31, 0.045)"
              transitionProperty="background, transform"
              transitionDuration="fast"
              _hover={{
                bg: 'rgba(37, 211, 102, 0.14)',
                transform: 'scale(1.05)',
              }}
              display={{ base: 'none', sm: 'inline-flex' }}
            >
              <ChakraLink
                target="_blank"
                rel="noopener"
                href={siteContact.whatsappHref}
                aria-label={m.site_a11y_whatsapp()}
              >
                <Icon as={icons.whatsappBrand} boxSize={5} />
              </ChakraLink>
            </IconButton>

            <SiteButton
              px={6}
              py={3}
              fontSize="14.5px"
              aria-haspopup="dialog"
              display={{ base: 'none', sm: 'inline-flex' }}
              boxShadow="0 8px 20px rgba(46, 207, 220, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.35)"
              onClick={() => openBooking()}
            >
              {m.site_nav_bookPickup()}
              <Icon aria-hidden boxSize={3.5} as={icons.forward} />
            </SiteButton>

            <MobileNav />
          </HStack>
        </HStack>
      </SiteContainer>
    </Box>
  )
}

export default SiteHeader
