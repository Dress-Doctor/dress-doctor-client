import { Accordion, Center, Icon, Link, Stack, Text } from '@chakra-ui/react'
import { useState } from 'react'
import icons from '#/config/icons'
import Reveal from '#/components/site/reveal'
import SectionHeading from '#/components/site/section-heading'
import SiteContainer from '#/components/site/site-container'
import { homeFaqs } from '#/data/home.data'
import { siteContact } from '#/data/site.data'
import { m } from '#/paraglide/messages'

/**
 * The five questions a first-time customer asks, as a single-open accordion.
 *
 * Chakra's `Accordion` rather than hand-rolled toggles: each question is a
 * real button that reports its expanded state, and the answer is associated
 * with it — which is the whole value of an FAQ to a screen reader.
 */
function FaqSection() {
  const [open, setOpen] = useState<string[]>([homeFaqs[0].id])

  return (
    <SiteContainer
      as="section"
      id="faq"
      maxW="840px"
      scrollMarginTop="100px"
      pt={{ base: 16, md: '120px' }}
    >
      <Reveal mb={12} textAlign="center">
        <SectionHeading
          eyebrow={m.home_faq_eyebrow()}
          title={m.home_faq_title()}
        />
      </Reveal>

      <Reveal delay={80}>
        <Accordion.Root
          collapsible
          value={open}
          variant="plain"
          onValueChange={(event) => setOpen(event.value)}
        >
          <Stack gap={3}>
            {homeFaqs.map((faq) => {
              const expanded = open.includes(faq.id)

              return (
                <Accordion.Item
                  key={faq.id}
                  value={faq.id}
                  rounded="18px"
                  overflow="hidden"
                  bg="white"
                  borderWidth="1px"
                  borderColor={
                    expanded
                      ? 'rgba(46, 207, 220, 0.4)'
                      : 'rgba(0, 23, 31, 0.06)'
                  }
                  boxShadow={
                    expanded
                      ? '0 2px 4px rgba(0, 23, 31, 0.03), 0 20px 44px rgba(46, 207, 220, 0.12)'
                      : '0 1px 2px rgba(0, 23, 31, 0.03), 0 10px 28px rgba(0, 23, 31, 0.04)'
                  }
                  transitionProperty="border-color, box-shadow"
                  transitionDuration="moderate"
                >
                  <Accordion.ItemTrigger
                    gap={4}
                    px="26px"
                    py={5}
                    cursor="pointer"
                    fontSize="16.5px"
                    fontWeight="semibold"
                    textAlign="start"
                    color="site.ink"
                  >
                    <Text as="span" flex="1">
                      {faq.question()}
                    </Text>

                    <Center
                      flex="none"
                      boxSize="30px"
                      rounded="full"
                      bg={
                        expanded
                          ? 'rgba(46, 207, 220, 0.14)'
                          : 'rgba(0, 23, 31, 0.04)'
                      }
                      color={expanded ? 'turquoise-blue.700' : 'site.ink-muted'}
                      transform={expanded ? 'rotate(180deg)' : 'rotate(0deg)'}
                      transitionProperty="transform, background, color"
                      transitionDuration="moderate"
                    >
                      <Icon
                        aria-hidden
                        boxSize={3.5}
                        strokeWidth="2.4"
                        as={icons.chevronDown}
                      />
                    </Center>
                  </Accordion.ItemTrigger>

                  <Accordion.ItemContent>
                    <Accordion.ItemBody
                      px="26px"
                      pt={0}
                      pb="22px"
                      fontSize="15px"
                      lineHeight="1.7"
                      color="site.ink-muted"
                    >
                      {faq.answer()}
                    </Accordion.ItemBody>
                  </Accordion.ItemContent>
                </Accordion.Item>
              )
            })}
          </Stack>
        </Accordion.Root>
      </Reveal>

      <Reveal mt={7} textAlign="center">
        <Text fontSize="14.5px" color="site.ink-muted">
          {m.home_faq_moreBefore()}{' '}
          <Link
            target="_blank"
            rel="noopener"
            fontWeight="semibold"
            color="turquoise-blue.700"
            href={siteContact.whatsappHref}
          >
            {m.home_faq_moreLink()}
          </Link>{' '}
          {m.home_faq_moreAfter()}
        </Text>
      </Reveal>
    </SiteContainer>
  )
}

export default FaqSection
