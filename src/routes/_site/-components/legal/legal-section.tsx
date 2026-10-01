import {
  Box,
  Center,
  Flex,
  Heading,
  HStack,
  Icon,
  Link as ChakraLink,
  List,
  Stack,
  Text,
} from '@chakra-ui/react'
import { Link } from '@tanstack/react-router'
import icons from '#/config/icons'
import { siteContact } from '#/data/site.data'
import type {
  LegalBlockDto,
  LegalContactKindDto,
  LegalSectionDto,
} from '#/interfaces/legal.dto'
import { m } from '#/paraglide/messages'

/**
 * Turns `**word**` in a message into bold text.
 *
 * The translators keep the whole sentence in one message, so the bold part can
 * sit wherever the language needs it. Odd-numbered pieces of the split are the
 * ones that were between the markers.
 */
function withBold(text: string) {
  return text.split('**').map((part, index) =>
    index % 2 === 1 ? (
      <Text as="strong" key={index} fontWeight="semibold" color="site.ink">
        {part}
      </Text>
    ) : (
      part
    ),
  )
}

const bodyText = {
  fontSize: '16px',
  lineHeight: '1.65',
  color: 'site.ink-muted',
} as const

/** Links inside the policy: readable on white, and obviously links. */
const inlineLink = {
  fontWeight: 'semibold',
  color: 'turquoise-blue.700',
  textDecorationLine: 'underline',
  textUnderlineOffset: '3px',
  _hover: { color: 'turquoise-blue.800' },
} as const

const callouts = {
  promise: {
    icon: icons.secure,
    bg: 'turquoise-blue.50',
    border: 'turquoise-blue.100',
    mark: 'turquoise-blue.700',
    title: 'turquoise-blue.800',
    text: 'turquoise-blue.900',
  },
  warning: {
    icon: icons.info,
    bg: 'amber-orange.50',
    border: 'amber-orange.100',
    mark: 'amber-orange.700',
    title: 'amber-orange.800',
    text: 'amber-orange.900',
  },
} as const

/** The contact lines a `contact` block can list. */
const contactLines: Record<
  LegalContactKindDto,
  { term: () => string; value: () => React.ReactNode }
> = {
  email: {
    term: m.legal_contact_emailTerm,
    value: () => (
      <ChakraLink {...inlineLink} href={siteContact.emailHref}>
        {siteContact.email}
      </ChakraLink>
    ),
  },
  whatsapp: {
    term: m.legal_contact_whatsappTerm,
    value: () => (
      <ChakraLink
        {...inlineLink}
        whiteSpace="nowrap"
        href={siteContact.whatsappHref}
        target="_blank"
        rel="noopener noreferrer"
      >
        {siteContact.phoneDisplay}
      </ChakraLink>
    ),
  },
  address: {
    term: m.legal_contact_addressTerm,
    value: m.legal_contact_addressValue,
  },
}

/** A list row: a small turquoise dot, then the text. */
function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <List.Item
      {...bodyText}
      display="block"
      position="relative"
      ps="26px"
      fontSize="15.5px"
      lineHeight="1.6"
    >
      <Box
        aria-hidden
        position="absolute"
        insetStart="8px"
        top="10px"
        boxSize="6px"
        rounded="full"
        bg="turquoise-blue.500"
      />
      {children}
    </List.Item>
  )
}

function Block({ block }: { block: LegalBlockDto }) {
  switch (block.type) {
    case 'paragraph':
      return (
        <Text {...bodyText} textWrap="pretty">
          {withBold(block.text())}
        </Text>
      )

    case 'heading':
      return (
        <Heading
          as="h3"
          mt={3}
          fontSize="md"
          fontWeight="semibold"
          letterSpacing="-0.01em"
          color="site.ink"
        >
          {block.text()}
        </Heading>
      )

    case 'list':
      return (
        <List.Root variant="plain" gap={2.5}>
          {block.items.map((item, index) => (
            <Bullet key={index}>
              {item.term && (
                <>
                  <Text as="strong" fontWeight="semibold" color="site.ink">
                    {item.term()}
                  </Text>
                  {' — '}
                </>
              )}
              {item.text()}
            </Bullet>
          ))}
        </List.Root>
      )

    case 'definitions':
      return (
        <Box
          as="dl"
          overflow="hidden"
          rounded="16px"
          bg="white"
          borderWidth="1px"
          borderColor="rgba(0, 23, 31, 0.08)"
        >
          {block.rows.map((row, index) => (
            <Flex
              key={index}
              direction={{ base: 'column', md: 'row' }}
              gap={{ base: 1, md: 4 }}
              px={4}
              py={3.5}
              borderTopWidth={index === 0 ? 0 : '1px'}
              borderColor="rgba(0, 23, 31, 0.06)"
            >
              <Box
                as="dt"
                flex="none"
                w={{ md: '32%' }}
                fontFamily="label"
                fontSize="12px"
                fontWeight="bold"
                letterSpacing="0.06em"
                textTransform="uppercase"
                color="site.ink"
              >
                {row.label()}
              </Box>
              <Box
                as="dd"
                fontSize="15px"
                lineHeight="1.55"
                color="site.ink-muted"
              >
                {row.text()}
              </Box>
            </Flex>
          ))}
        </Box>
      )

    case 'callout': {
      const tone = callouts[block.tone]

      return (
        <HStack
          align="flex-start"
          gap={3.5}
          px={4.5}
          py={4}
          rounded="16px"
          bg={tone.bg}
          borderWidth="1px"
          borderColor={tone.border}
        >
          <Center
            flex="none"
            boxSize={8}
            rounded="10px"
            bg={tone.mark}
            color="white"
          >
            <Icon aria-hidden boxSize={4} as={tone.icon} />
          </Center>

          <Stack gap={0.5}>
            <Text
              fontFamily="label"
              fontSize="13px"
              fontWeight="bold"
              letterSpacing="0.1em"
              textTransform="uppercase"
              color={tone.title}
            >
              {block.title()}
            </Text>
            <Text fontSize="14.5px" lineHeight="1.55" color={tone.text}>
              {block.text()}
            </Text>
          </Stack>
        </HStack>
      )
    }

    case 'link':
      return (
        <ChakraLink
          asChild
          alignSelf="flex-start"
          gap={1.5}
          fontWeight="semibold"
          color="turquoise-blue.700"
          _hover={{ color: 'turquoise-blue.800' }}
        >
          <Link to={block.to}>
            {block.label()}
            <Icon aria-hidden boxSize={3.5} as={icons.forward} />
          </Link>
        </ChakraLink>
      )

    case 'contact':
      return (
        <List.Root variant="plain" gap={2.5}>
          {block.kinds.map((kind) => {
            const line = contactLines[kind]

            return (
              <Bullet key={kind}>
                <Text as="strong" fontWeight="semibold" color="site.ink">
                  {line.term()}
                </Text>
                {': '}
                {line.value()}
              </Bullet>
            )
          })}
        </List.Root>
      )
  }
}

interface Props {
  section: LegalSectionDto
  /** Zero-based; shown as "01", "02"… above the title. */
  index: number
}

/**
 * One numbered section of a legal document.
 *
 * `scrollMarginTop` clears the sticky header, so a jump from the contents list
 * lands with the title in view rather than under the bar.
 */
function LegalSection({ section, index }: Props) {
  return (
    <Box
      as="section"
      id={section.id}
      aria-labelledby={`${section.id}-title`}
      scrollMarginTop="110px"
      pt={index === 0 ? 2 : 10}
      pb={10}
      borderTopWidth={index === 0 ? 0 : '1px'}
      borderColor="rgba(0, 23, 31, 0.07)"
    >
      <HStack
        gap={2}
        mb={2.5}
        fontFamily="label"
        fontSize="12px"
        fontWeight="bold"
        letterSpacing="0.14em"
        textTransform="uppercase"
        color="turquoise-blue.700"
      >
        <Center
          boxSize={5.5}
          rounded="6px"
          bg="turquoise-blue.50"
          borderWidth="1px"
          borderColor="turquoise-blue.100"
          fontSize="11px"
          letterSpacing="0"
        >
          {String(index + 1).padStart(2, '0')}
        </Center>
        <Text as="span">{m.legal_section_label()}</Text>
      </HStack>

      <Heading
        as="h2"
        id={`${section.id}-title`}
        fontSize="clamp(24px, 2.6vw, 30px)"
        fontWeight="semibold"
        lineHeight="1.15"
        letterSpacing="-0.02em"
        textWrap="balance"
        color="site.ink"
      >
        {section.title()}
      </Heading>

      <Stack mt={4} gap={3.5}>
        {section.blocks.map((block, blockIndex) => (
          <Block key={blockIndex} block={block} />
        ))}
      </Stack>
    </Box>
  )
}

export default LegalSection
