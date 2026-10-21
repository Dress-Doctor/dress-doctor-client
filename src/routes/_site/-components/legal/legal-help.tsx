import {
  Box,
  Center,
  Flex,
  Heading,
  HStack,
  Icon,
  Link as ChakraLink,
  Stack,
  Text,
} from '@chakra-ui/react'
import { Link } from '@tanstack/react-router'
import icons from '#/config/icons'
import Reveal from '#/components/site/reveal'
import SiteButton from '#/components/site/site-button'
import { siteContact } from '#/data/site.data'
import type { LegalDocumentDto } from '#/interfaces/legal.dto'
import { m } from '#/paraglide/messages'

interface Props {
  related: LegalDocumentDto['related']
}

/**
 * What closes a legal page: a navy card for a visitor who still has a
 * question, then a quiet link to the sibling document, which is the one most
 * often read next.
 */
function LegalHelp({ related }: Props) {
  return (
    <>
      <Reveal
        position="relative"
        overflow="hidden"
        mt={4}
        rounded="28px"
        bg="dark-bluish-gray.500"
        px={{ base: 6, md: 10 }}
        py={{ base: 7, md: 9 }}
      >
        <Box
          aria-hidden
          position="absolute"
          inset={0}
          pointerEvents="none"
          bgImage="radial-gradient(420px 240px at 100% 0%, rgba(46, 207, 220, 0.2), transparent 60%), radial-gradient(360px 220px at 0% 100%, rgba(255, 137, 74, 0.16), transparent 60%)"
        />

        <Flex
          position="relative"
          direction={{ base: 'column', md: 'row' }}
          align={{ md: 'center' }}
          justify="space-between"
          gap={6}
        >
          <Stack gap={1.5}>
            <Heading
              as="h2"
              fontSize="22px"
              fontWeight="semibold"
              letterSpacing="-0.01em"
              textWrap="balance"
              color="white"
            >
              {m.legal_help_title()}
            </Heading>
            <Text
              maxW="50ch"
              fontSize="15px"
              lineHeight="1.6"
              color="whiteAlpha.700"
            >
              {m.legal_help_body()}
            </Text>
          </Stack>

          <HStack flex="none" wrap="wrap" gap={2.5}>
            <SiteButton asChild px={6} py="13px" fontSize="15px">
              <ChakraLink
                href={siteContact.whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Icon aria-hidden boxSize={4.5} as={icons.whatsappBrand} />
                {m.legal_help_whatsapp()}
              </ChakraLink>
            </SiteButton>

            <SiteButton
              asChild
              variant="onDark"
              px={6}
              py="13px"
              fontSize="15px"
            >
              <ChakraLink href={siteContact.emailHref}>
                <Icon aria-hidden boxSize={4} as={icons.email} />
                {m.legal_help_email()}
              </ChakraLink>
            </SiteButton>
          </HStack>
        </Flex>
      </Reveal>

      <Flex
        mt={6}
        px={{ base: 5, md: 6 }}
        py={5}
        align="center"
        justify="space-between"
        wrap="wrap"
        gap={4}
        rounded="20px"
        bg="site.sunken"
        borderWidth="1px"
        borderColor="rgba(0, 23, 31, 0.06)"
      >
        <HStack gap={3.5}>
          <Center
            flex="none"
            boxSize={10}
            rounded="12px"
            bg="white"
            borderWidth="1px"
            borderColor="rgba(0, 23, 31, 0.08)"
            color="site.ink"
          >
            <Icon aria-hidden boxSize={5} as={related.icon} />
          </Center>

          <Stack gap={0.5}>
            <Text
              fontFamily="label"
              fontSize="12px"
              fontWeight="semibold"
              letterSpacing="0.08em"
              textTransform="uppercase"
              color="site.ink-muted"
            >
              {m.legal_related_label()}
            </Text>
            <Text fontSize="md" fontWeight="semibold" color="site.ink">
              {related.title()}
            </Text>
          </Stack>
        </HStack>

        <ChakraLink
          asChild
          gap={1.5}
          py={2}
          fontSize="14px"
          fontWeight="semibold"
          color="turquoise-blue.700"
          _hover={{ color: 'turquoise-blue.800' }}
        >
          <Link to={related.to}>
            {m.legal_related_action()}
            <Icon aria-hidden boxSize={3.5} as={icons.forward} />
          </Link>
        </ChakraLink>
      </Flex>
    </>
  )
}

export default LegalHelp
