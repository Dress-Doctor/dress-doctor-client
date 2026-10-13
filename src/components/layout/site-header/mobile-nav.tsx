import {
  CloseButton,
  Drawer,
  HStack,
  Icon,
  IconButton,
  Link as ChakraLink,
  Portal,
  Stack,
  Text,
} from '@chakra-ui/react'
import { Link } from '@tanstack/react-router'
import { useState } from 'react'
import icons from '#/config/icons'
import SiteButton from '#/components/site/site-button'
import {
  siteContact,
  siteNavLinks,
  sitePaths,
  siteServices,
} from '#/data/site.data'
import { useSiteModals } from '#/hooks/use-site-modals'
import { m } from '#/paraglide/messages'
import LocaleSwitch from './locale-switch'
import NavLink from './nav-link'

/**
 * The header's small-screen counterpart.
 *
 * The design is specified for the desktop width only; on a phone the same
 * entries are stacked in a sheet, with the six services listed flat rather
 * than behind a second disclosure — there are only six, and a nested menu on a
 * touch target this size costs more than it saves.
 */
function MobileNav() {
  const [open, setOpen] = useState(false)
  const { openBooking } = useSiteModals()

  return (
    <Drawer.Root
      open={open}
      size="xs"
      placement="end"
      onOpenChange={(event) => setOpen(event.open)}
    >
      <Drawer.Trigger asChild>
        <IconButton
          variant="ghost"
          colorPalette="gray"
          color="site.ink"
          aria-label={m.site_a11y_primaryNav()}
          display={{ base: 'inline-flex', lg: 'none' }}
        >
          <Icon as={icons.openPanel} />
        </IconButton>
      </Drawer.Trigger>

      <Portal>
        <Drawer.Backdrop />
        <Drawer.Positioner>
          <Drawer.Content bg="white" overscrollBehavior="contain">
            <Drawer.Header>
              <Drawer.Title fontFamily="display">Dress Doctor</Drawer.Title>
              <Drawer.CloseTrigger asChild>
                <CloseButton
                  size="sm"
                  colorPalette="gray"
                  aria-label={m.common_a11y_closeDrawer()}
                />
              </Drawer.CloseTrigger>
            </Drawer.Header>

            <Drawer.Body>
              <Stack
                as="nav"
                gap={1}
                aria-label={m.site_a11y_primaryNav()}
                onClick={() => setOpen(false)}
              >
                <NavLink to={sitePaths.services}>
                  {m.site_nav_services()}
                </NavLink>

                <Stack gap={0} pl={3} py={1}>
                  {siteServices.map((service) => (
                    <ChakraLink
                      asChild
                      key={service.id}
                      py={2}
                      gap={2.5}
                      display="flex"
                      alignItems="center"
                      fontSize="sm"
                      color="site.ink-muted"
                      textDecoration="none"
                      _hover={{ color: 'site.ink' }}
                    >
                      <Link to={service.to}>
                        <Icon aria-hidden boxSize={4} as={service.icon} />
                        {service.name()}
                      </Link>
                    </ChakraLink>
                  ))}
                </Stack>

                {siteNavLinks
                  .filter((link) => link.key !== 'services')
                  .map((link) => (
                    <NavLink key={link.key} to={link.to}>
                      {link.label()}
                    </NavLink>
                  ))}
              </Stack>
            </Drawer.Body>

            <Drawer.Footer justifyContent="stretch">
              <Stack gap={4} w="full">
                {/* The menu closes first, so the form is the only thing open. */}
                <SiteButton
                  w="full"
                  aria-haspopup="dialog"
                  onClick={() => {
                    setOpen(false)
                    openBooking()
                  }}
                >
                  {m.site_nav_bookPickup()}
                  <Icon aria-hidden boxSize={3.5} as={icons.forward} />
                </SiteButton>

                <HStack justify="space-between">
                  <LocaleSwitch />
                  <ChakraLink
                    gap={2}
                    fontSize="sm"
                    fontWeight="medium"
                    color="site.ink-muted"
                    textDecoration="none"
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
                    <Text as="span">{siteContact.phoneDisplay}</Text>
                  </ChakraLink>
                </HStack>
              </Stack>
            </Drawer.Footer>
          </Drawer.Content>
        </Drawer.Positioner>
      </Portal>
    </Drawer.Root>
  )
}

export default MobileNav
