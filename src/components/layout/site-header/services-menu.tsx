import {
  Box,
  Button,
  Center,
  Icon,
  Link as ChakraLink,
  Popover,
  SimpleGrid,
  Stack,
  Text,
} from '@chakra-ui/react'
import { Link, useMatchRoute } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'
import icons from '#/config/icons'
import { siteServices, sitePaths } from '#/data/site.data'
import type { SiteServiceDto } from '#/interfaces/site.dto'
import { m } from '#/paraglide/messages'
import { navLinkStyles } from './nav-link'

/** Space between the Services trigger and the panel, in pixels. */
const GAP = 16

/** How long the panel waits after the pointer leaves before it closes. */
const CLOSE_DELAY = 150

function ServiceItem({ service }: { service: SiteServiceDto }) {
  return (
    <ChakraLink
      asChild
      gap={3}
      p={3}
      rounded="13px"
      display="flex"
      alignItems="center"
      textDecoration="none"
      transitionProperty="background"
      transitionDuration="fast"
      _hover={{ bg: 'rgba(46, 207, 220, 0.09)' }}
    >
      <Link to={service.to}>
        <Center
          flex="none"
          boxSize={10}
          rounded="12px"
          color="turquoise-blue.700"
          bgGradient="to-br"
          gradientFrom="rgba(46, 207, 220, 0.16)"
          gradientTo="rgba(46, 207, 220, 0.05)"
        >
          <Icon aria-hidden boxSize={5} as={service.icon} />
        </Center>

        <Stack gap={0.5}>
          <Text as="span" fontSize="sm" fontWeight="semibold" color="site.ink">
            {service.name()}
          </Text>
          <Text
            as="span"
            fontSize="11.5px"
            fontWeight="semibold"
            fontFamily="display"
            color="amber-orange.500"
          >
            {service.price()}
          </Text>
        </Stack>
      </Link>
    </ChakraLink>
  )
}

/**
 * The Services entry in the header, and the two-column panel it opens.
 *
 * A disclosure button rather than a link: the panel is what the entry is for,
 * and "View all services" inside it is the link to the index page. Hover opens
 * it for a pointer, focus and Enter for a keyboard — and the content is not
 * portalled, so tabbing out of the trigger walks straight into the six
 * services rather than jumping to the end of the document.
 */
function ServicesMenu() {
  const [open, setOpen] = useState(false)
  const closeTimer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const matchRoute = useMatchRoute()
  const active = Boolean(matchRoute({ to: sitePaths.services, fuzzy: true }))

  const cancelClose = () => clearTimeout(closeTimer.current)

  useEffect(() => cancelClose, [])

  const handleMouseEnter = () => {
    cancelClose()
    setOpen(true)
  }

  // A short grace period, so a pointer that drifts off the edge or cuts a
  // corner on its way to a service does not snap the panel shut.
  const handleMouseLeave = () => {
    cancelClose()
    closeTimer.current = setTimeout(() => setOpen(false), CLOSE_DELAY)
  }

  return (
    <Box
      position="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Popover.Root
        open={open}
        autoFocus={false}
        onOpenChange={(event) => {
          cancelClose()
          setOpen(event.open)
        }}
        positioning={{ placement: 'bottom-start', offset: { mainAxis: GAP } }}
      >
        <Popover.Trigger asChild>
          <Button
            variant="plain"
            h="auto"
            minW="auto"
            gap={1.5}
            {...navLinkStyles(active)}
          >
            {m.site_nav_services()}
            <Icon
              aria-hidden
              boxSize={2.5}
              opacity={0.55}
              as={icons.chevronDown}
              strokeWidth="2.6"
            />
          </Button>
        </Popover.Trigger>

        <Popover.Positioner>
          <Popover.Content
            position="relative"
            // Invisible bridge over the gap below the trigger. The panel is a
            // child of the hover wrapper, so while the pointer is on this strip
            // it never counts as having left.
            _before={{
              content: '""',
              position: 'absolute',
              insetX: 0,
              bottom: '100%',
              h: `${GAP}px`,
            }}
            p={4}
            w="600px"
            maxW="90vw"
            rounded="20px"
            bg="rgba(255, 255, 255, 0.92)"
            backdropFilter="blur(24px)"
            boxShadow="0 2px 4px rgba(0, 23, 31, 0.04), 0 32px 72px rgba(0, 23, 31, 0.16), 0 0 0 1px rgba(0, 23, 31, 0.05)"
          >
            <Popover.Title srOnly>{m.site_a11y_servicesMenu()}</Popover.Title>

            <SimpleGrid columns={{ base: 1, sm: 2 }} gap={0.5}>
              {siteServices.map((service) => (
                <ServiceItem key={service.id} service={service} />
              ))}
            </SimpleGrid>

            <ChakraLink
              asChild
              mt={1.5}
              display="flex"
              p={3}
              gap={1.5}
              justifyContent="center"
              borderTopWidth="1px"
              borderColor="rgba(0, 23, 31, 0.06)"
              fontSize="13.5px"
              fontWeight="semibold"
              textDecoration="none"
              color="turquoise-blue.700"
            >
              <Link to={sitePaths.services}>
                {m.site_nav_viewAllServices()}
                <Icon aria-hidden boxSize={3} as={icons.forward} />
              </Link>
            </ChakraLink>
          </Popover.Content>
        </Popover.Positioner>
      </Popover.Root>
    </Box>
  )
}

export default ServicesMenu
