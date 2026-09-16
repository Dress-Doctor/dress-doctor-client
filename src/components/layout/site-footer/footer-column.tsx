import { Link as ChakraLink, Stack, Text } from '@chakra-ui/react'
import { Link } from '@tanstack/react-router'
import type { SiteLinkDto } from '#/interfaces/site.dto'

interface FooterColumnProps {
  title: string
  links: SiteLinkDto[]
}

/** One titled column of the footer's link grid. */
function FooterColumn({ title, links }: FooterColumnProps) {
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
            <ChakraLink
              asChild
              fontSize="sm"
              color="whiteAlpha.700"
              textDecoration="none"
              transitionProperty="color"
              transitionDuration="fast"
              _hover={{ color: 'turquoise-blue.500' }}
            >
              <Link to={link.to}>{link.label()}</Link>
            </ChakraLink>
          </li>
        ))}
      </Stack>
    </Stack>
  )
}

export default FooterColumn
