import { Box, Link as ChakraLink, Table, Text } from '@chakra-ui/react'
import Reveal from '#/components/site/reveal'
import SectionHeading from '#/components/site/section-heading'
import SiteContainer from '#/components/site/site-container'
import { siteContact, siteServices } from '#/data/site.data'
import { serviceBestFor } from '#/data/services.data'
import { m } from '#/paraglide/messages'

const headerCell = {
  py: 4,
  px: { base: 4, md: 6 },
  bg: 'dark-bluish-gray.500',
  color: 'whiteAlpha.800',
  fontFamily: 'label',
  fontSize: '13px',
  fontWeight: 'semibold',
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
} as const

const bodyCell = {
  py: 4,
  px: { base: 4, md: 6 },
  fontSize: '15px',
  borderColor: 'rgba(0, 23, 31, 0.07)',
} as const

/** A table to match your clothes to a service, with a WhatsApp way out. */
function ServicesCompare() {
  return (
    <Box
      as="section"
      mt={{ base: 16, md: '96px' }}
      py={{ base: 14, md: '80px' }}
      bgGradient="to-b"
      gradientFrom="#F6FAFB"
      gradientTo="#EEF4F6"
    >
      <SiteContainer>
        <Reveal
          mx="auto"
          mb={{ base: 8, md: 11 }}
          maxW="640px"
          textAlign="center"
        >
          <SectionHeading
            alignItems="center"
            size="md"
            eyebrow={m.services_compare_eyebrow()}
            title={m.services_compare_title()}
            lead={m.services_compare_lead()}
          />
        </Reveal>

        {/* Focusable, so a keyboard can scroll the table on a narrow screen. */}
        <Reveal
          role="region"
          tabIndex={0}
          aria-label={m.services_compare_caption()}
          overflowX="auto"
          rounded="16px"
          bg="white"
          boxShadow="0 1px 2px rgba(0, 23, 31, 0.03), 0 12px 32px rgba(0, 23, 31, 0.05)"
        >
          <Table.Root minW="560px" showColumnBorder={false}>
            <Table.Caption srOnly>{m.services_compare_caption()}</Table.Caption>
            <Table.Header>
              <Table.Row bg="transparent">
                <Table.ColumnHeader {...headerCell}>
                  {m.services_compare_colService()}
                </Table.ColumnHeader>
                <Table.ColumnHeader {...headerCell}>
                  {m.services_compare_colBestFor()}
                </Table.ColumnHeader>
                <Table.ColumnHeader {...headerCell} textAlign="end">
                  {m.services_compare_colPrice()}
                </Table.ColumnHeader>
              </Table.Row>
            </Table.Header>

            <Table.Body>
              {siteServices.map((service) => (
                <Table.Row key={service.id} bg="transparent">
                  <Table.Cell
                    {...bodyCell}
                    as="th"
                    scope="row"
                    textAlign="start"
                    fontWeight="semibold"
                    color="site.ink"
                  >
                    {service.name()}
                  </Table.Cell>
                  <Table.Cell {...bodyCell} color="site.ink-muted">
                    {serviceBestFor[service.id]()}
                  </Table.Cell>
                  <Table.Cell
                    {...bodyCell}
                    textAlign="end"
                    whiteSpace="nowrap"
                    fontFamily="display"
                    fontVariantNumeric="tabular-nums"
                    fontWeight="bold"
                    color="amber-orange.500"
                  >
                    {service.price()}
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        </Reveal>

        <Text
          mt={6}
          textAlign="center"
          fontSize="14.5px"
          color="site.ink-muted"
          textWrap="pretty"
        >
          {m.services_compare_help()}{' '}
          <ChakraLink
            target="_blank"
            rel="noopener"
            href={siteContact.whatsappHref}
            fontWeight="semibold"
            color="turquoise-blue.700"
          >
            {m.services_compare_helpLink()}
          </ChakraLink>{' '}
          {m.services_compare_helpAfter()}
        </Text>
      </SiteContainer>
    </Box>
  )
}

export default ServicesCompare
