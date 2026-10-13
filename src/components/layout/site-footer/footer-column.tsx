import { Button, Link as ChakraLink, Stack, Text } from '@chakra-ui/react'
import { Link } from '@tanstack/react-router'
import { useSiteModals } from '#/hooks/use-site-modals'
import type { SiteLinkDto } from '#/interfaces/site.dto'

/** The footer's links are quiet grey text that turns turquoise on hover. */
const linkLook = {
  fontSize: 'sm',
  color: 'whiteAlpha.700',
  textDecoration: 'none',
  transitionProperty: 'color',
  transitionDuration: 'fast',
  _hover: { color: 'turquoise-blue.500' },
} as const

interface FooterColumnProps {
  title: string
  links: SiteLinkDto[]
}

/** One titled column of the footer's link grid. */
function FooterColumn({ title, links }: FooterColumnProps) {
  const { openBooking } = useSiteModals()

  return (
    <Stack gap={0}>
      <Text
        as="h2"
        mb={4.5}
        fontSize="xs"
        fontWeight="bold"
        letterSpacing="0.12em"
        fontFamily="label"
        textTransform="uppercase"
        color="whiteAlpha.400"
      >
        {title}
      </Text>

      <Stack as="ul" gap={2.5} listStyleType="none">
        {links.map((link) => (
          <li key={link.id}>
            {link.opens === 'booking' ? (
              <Button
                variant="plain"
                h="auto"
                minW={0}
                p={0}
                fontWeight="normal"
                aria-haspopup="dialog"
                {...linkLook}
                onClick={() => openBooking()}
              >
                {link.label()}
              </Button>
            ) : (
              <ChakraLink asChild {...linkLook}>
                <Link to={link.to}>{link.label()}</Link>
              </ChakraLink>
            )}
          </li>
        ))}
      </Stack>
    </Stack>
  )
}

export default FooterColumn
