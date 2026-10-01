import {
  Box,
  Center,
  Heading,
  HStack,
  Icon,
  Link as ChakraLink,
  SimpleGrid,
  Stack,
  Text,
} from '@chakra-ui/react'
import { Link } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import type { IconType } from 'react-icons/lib'
import icons from '#/config/icons'
import CheckItem from '#/components/site/check-item'
import Reveal from '#/components/site/reveal'
import SiteContainer from '#/components/site/site-container'
import {
  PRIVACY_EFFECTIVE_DATE,
  PRIVACY_VERSION,
  privacyHighlights,
} from '#/data/privacy.data'
import { sitePaths } from '#/data/site.data'
import { m } from '#/paraglide/messages'
import { getLocale } from '#/paraglide/runtime'
import type { Locale } from '#/paraglide/runtime'

/** British English reads "26 May 2026", not the default "May 26, 2026". */
const dateLocales: Record<Locale, string> = { en: 'en-GB', fr: 'fr-FR' }

/** UTC, so the day printed is the day in the file wherever the reader is. */
const formatDate = (isoDate: string) =>
  new Intl.DateTimeFormat(dateLocales[getLocale()], {
    dateStyle: 'long',
    timeZone: 'UTC',
  }).format(new Date(isoDate))

const bloom = [
  'radial-gradient(700px 360px at 88% 8%, rgba(255, 137, 74, 0.1), transparent 65%)',
  'radial-gradient(900px 480px at 8% 90%, rgba(46, 207, 220, 0.14), transparent 60%)',
].join(', ')

/** One fact about the document, as a small pill under the title. */
function MetaChip({
  icon,
  label,
  value,
}: {
  icon: IconType
  label: string
  value: ReactNode
}) {
  return (
    <HStack
      as="li"
      gap={2}
      py={1.5}
      pl={3}
      pr={3.5}
      rounded="full"
      bg="white"
      borderWidth="1px"
      borderColor="rgba(0, 23, 31, 0.08)"
      fontSize="13px"
    >
      <Icon aria-hidden boxSize={3.5} as={icon} color="turquoise-blue.700" />
      <Text as="span" color="site.ink-muted">
        {label}
      </Text>
      <Text as="span" fontWeight="semibold" color="site.ink">
        {value}
      </Text>
    </HStack>
  )
}

/**
 * The top of the policy: where you are, what it is called, when it took
 * effect, and the four promises in a card so a visitor who reads nothing
 * else still knows the important part.
 */
function PrivacyHero() {
  return (
    <Box as="section" position="relative" overflow="hidden" bgImage={bloom}>
      <SiteContainer py={{ base: 10, md: 16 }}>
        <Box as="nav" aria-label={m.privacy_a11y_breadcrumb()}>
          <HStack
            as="ol"
            listStyleType="none"
            wrap="wrap"
            gap={2}
            fontSize="13px"
            color="site.ink-muted"
          >
            <HStack as="li" gap={2}>
              <ChakraLink
                asChild
                gap={1.5}
                color="site.ink-muted"
                _hover={{ color: 'site.ink' }}
              >
                <Link to={sitePaths.home}>
                  <Icon aria-hidden boxSize={3.5} as={icons.home} />
                  {m.privacy_breadcrumb_home()}
                </Link>
              </ChakraLink>
            </HStack>
            <Text as="li" aria-hidden color="site.ink-subtle">
              /
            </Text>
            <Text as="li">{m.privacy_breadcrumb_legal()}</Text>
            <Text as="li" aria-hidden color="site.ink-subtle">
              /
            </Text>
            <Text
              as="li"
              aria-current="page"
              fontWeight="semibold"
              color="site.ink"
            >
              {m.privacy_breadcrumb_current()}
            </Text>
          </HStack>
        </Box>

        <SimpleGrid
          mt={{ base: 5, md: 6 }}
          gap={{ base: 8, lg: 12 }}
          columns={{ base: 1, lg: 2 }}
          templateColumns={{ lg: '1.4fr 1fr' }}
          alignItems={{ lg: 'end' }}
        >
          <Reveal>
            <Center
              boxSize="56px"
              rounded="18px"
              bg="white"
              borderWidth="1px"
              borderColor="rgba(0, 23, 31, 0.08)"
              color="turquoise-blue.700"
              boxShadow="0 4px 14px rgba(0, 23, 31, 0.05)"
            >
              <Icon aria-hidden boxSize={6} as={icons.secure} />
            </Center>

            <Heading
              as="h1"
              mt={5}
              maxW="18ch"
              fontSize="clamp(36px, 5.4vw, 60px)"
              fontWeight="semibold"
              lineHeight="1.04"
              letterSpacing="-0.028em"
              textWrap="balance"
              color="site.ink"
            >
              {m.privacy_hero_title()}
            </Heading>

            <Text
              mt={4}
              maxW="54ch"
              fontSize={{ base: 'md', md: 'lg' }}
              lineHeight="1.6"
              textWrap="pretty"
              color="site.ink-muted"
            >
              {m.privacy_hero_lead()}
            </Text>

            <HStack as="ul" listStyleType="none" mt={6} wrap="wrap" gap={2.5}>
              <MetaChip
                icon={icons.calendar}
                label={m.privacy_hero_effectiveLabel()}
                value={
                  <time dateTime={PRIVACY_EFFECTIVE_DATE}>
                    {formatDate(PRIVACY_EFFECTIVE_DATE)}
                  </time>
                }
              />
              <MetaChip
                icon={icons.sync}
                label={m.privacy_hero_versionLabel()}
                value={PRIVACY_VERSION}
              />
              <MetaChip
                icon={icons.location}
                label={m.privacy_hero_countryLabel()}
                value={
                  <>
                    {m.privacy_hero_countryValue()}
                    <span aria-hidden>🇨🇲</span>
                  </>
                }
              />
            </HStack>
          </Reveal>

          <Reveal delay={100}>
            <Stack
              gap={0}
              p={{ base: 6, md: 7 }}
              rounded="24px"
              bg="white"
              borderWidth="1px"
              borderColor="rgba(0, 23, 31, 0.06)"
              boxShadow="0 2px 4px rgba(0, 23, 31, 0.03), 0 20px 44px rgba(0, 23, 31, 0.07)"
            >
              <HStack
                gap={1.5}
                alignSelf="flex-start"
                px={2.5}
                py={1}
                rounded="full"
                bg="turquoise-blue.50"
                borderWidth="1px"
                borderColor="turquoise-blue.100"
                fontFamily="label"
                fontSize="11px"
                fontWeight="bold"
                letterSpacing="0.12em"
                textTransform="uppercase"
                color="turquoise-blue.700"
              >
                <Icon aria-hidden boxSize={3} as={icons.sparkles} />
                {m.privacy_tldr_tag()}
              </HStack>

              <Heading
                as="h2"
                mt={3.5}
                fontSize="lg"
                fontWeight="semibold"
                lineHeight="1.3"
                color="site.ink"
              >
                {m.privacy_tldr_title()}
              </Heading>

              <Stack as="ul" listStyleType="none" mt={4} gap={3}>
                {privacyHighlights.map((highlight, index) => (
                  <CheckItem key={index} as="li" label={highlight()} />
                ))}
              </Stack>
            </Stack>
          </Reveal>
        </SimpleGrid>
      </SiteContainer>
    </Box>
  )
}

export default PrivacyHero
