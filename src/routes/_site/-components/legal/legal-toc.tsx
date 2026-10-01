import { Box, HStack, Link as ChakraLink, Stack, Text } from '@chakra-ui/react'
import { Link } from '@tanstack/react-router'
import type { LegalSectionDto } from '#/interfaces/legal.dto'
import type { FileRoutesByTo } from '#/routeTree.gen'
import { m } from '#/paraglide/messages'

interface Props {
  /** The page's own route, so each entry can jump within it. */
  path: keyof FileRoutesByTo
  sections: LegalSectionDto[]
  /** Id of the section the reader is in. */
  active: string
}

/**
 * The "on this page" list.
 *
 * A sticky rail on wide screens; on a phone it sits above the text as a plain
 * card, since a sticky list there would cover the policy it is meant to help
 * with. Every entry is a router `Link` with a `hash`, so the jump and the
 * address bar stay in step and a section can be shared by its URL.
 */
function LegalToc({ path, sections, active }: Props) {
  return (
    <Box
      as="nav"
      aria-label={m.legal_a11y_toc()}
      alignSelf="start"
      position={{ lg: 'sticky' }}
      top={{ lg: '112px' }}
      p={{ base: 5, lg: 0 }}
      rounded={{ base: '20px', lg: 'none' }}
      bg={{ base: 'white', lg: 'transparent' }}
      borderWidth={{ base: '1px', lg: 0 }}
      borderColor="rgba(0, 23, 31, 0.06)"
    >
      <Text
        mb={3.5}
        ps={{ lg: 3 }}
        fontFamily="label"
        fontSize="11px"
        fontWeight="bold"
        letterSpacing="0.16em"
        textTransform="uppercase"
        color="site.ink-muted"
      >
        {m.legal_toc_title()}
      </Text>

      <Stack
        as="ol"
        gap={0}
        listStyleType="none"
        borderStartWidth="1.5px"
        borderColor="rgba(0, 23, 31, 0.08)"
      >
        {sections.map((section, index) => {
          const current = section.id === active

          return (
            <li key={section.id}>
              <ChakraLink
                asChild
                alignItems="flex-start"
                gap={2.5}
                py={2}
                ps={3.5}
                ms="-1.5px"
                borderStartWidth="1.5px"
                borderColor={current ? 'turquoise-blue.500' : 'transparent'}
                fontSize="13.5px"
                fontWeight={current ? 'semibold' : 'medium'}
                lineHeight="1.4"
                color={current ? 'turquoise-blue.700' : 'site.ink-muted'}
                textDecoration="none"
                transitionProperty="color, border-color"
                transitionDuration="moderate"
                _hover={{ color: 'site.ink', textDecoration: 'none' }}
              >
                <Link
                  to={path}
                  hash={section.id}
                  replace
                  aria-current={current ? 'location' : undefined}
                  activeOptions={{ includeHash: true }}
                >
                  <HStack gap={2.5} align="flex-start">
                    <Text
                      as="span"
                      mt="2px"
                      flex="none"
                      fontFamily="label"
                      fontSize="11px"
                      fontWeight="bold"
                      letterSpacing="0.04em"
                      color={current ? 'turquoise-blue.700' : 'site.ink-subtle'}
                    >
                      {String(index + 1).padStart(2, '0')}
                    </Text>
                    {section.title()}
                  </HStack>
                </Link>
              </ChakraLink>
            </li>
          )
        })}
      </Stack>
    </Box>
  )
}

export default LegalToc
