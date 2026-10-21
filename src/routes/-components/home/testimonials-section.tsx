import { Center, Grid, HStack, Stack, Text } from '@chakra-ui/react'
import CheckItem from '#/components/site/check-item'
import Reveal from '#/components/site/reveal'
import SectionHeading from '#/components/site/section-heading'
import SiteContainer from '#/components/site/site-container'
import StarRating from '#/components/site/star-rating'
import { homeTestimonials } from '#/data/home.data'
import type { HomeTestimonialDto } from '#/interfaces/site.dto'
import { m } from '#/paraglide/messages'
import { getLocale } from '#/paraglide/runtime'

const avatars = {
  turquoise: { gradientFrom: '#2ECFDC', gradientTo: '#24B9C6' },
  amber: { gradientFrom: '#FF9D68', gradientTo: '#FF894A' },
  charcoal: { gradientFrom: '#3A4A63', gradientTo: '#202938' },
} as const

function TestimonialCard({ item }: { item: HomeTestimonialDto }) {
  // Reviews are shown in the language they were written in (English). On the
  // French page they are marked as such, for screen readers and for readers.
  const translated = getLocale() !== 'en'

  return (
    <Reveal
      as="figure"
      delay={item.delay}
      m={0}
      ml={{ lg: item.indented ? 10 : 0 }}
      px={8}
      py={7}
      rounded="22px"
      bg="white"
      borderWidth="1px"
      borderColor="rgba(0, 23, 31, 0.06)"
      boxShadow="0 1px 2px rgba(0, 23, 31, 0.03), 0 16px 40px rgba(0, 23, 31, 0.05)"
      transitionProperty="transform"
      transitionDuration="moderate"
      _hover={{ transform: 'translateX(4px)' }}
    >
      <Text
        as="blockquote"
        lang="en"
        fontSize="17px"
        lineHeight="1.65"
        fontWeight="medium"
        textWrap="pretty"
        color="site.ink"
      >
        “{item.excerpt && '… '}
        {item.quote}
        {item.excerpt && ' …'}”
      </Text>

      <HStack as="figcaption" gap={3} mt={4} rowGap={2} wrap="wrap">
        <Center
          flex="none"
          boxSize={10}
          rounded="full"
          color="white"
          fontFamily="display"
          fontSize="15px"
          fontWeight="extrabold"
          bgGradient="to-br"
          aria-hidden
          {...avatars[item.accent]}
        >
          {item.initial}
        </Center>

        <Text fontSize="13.5px" color="site.ink-muted">
          <Text as="span" fontWeight="semibold" color="site.ink" translate="no">
            {item.author}
          </Text>{' '}
          · {m.home_testimonials_source()}
          {item.excerpt && ` (${m.home_testimonials_excerpt()})`}
          {translated && ` · ${m.home_testimonials_quoteLanguage()}`}
        </Text>

        <StarRating
          size={3.5}
          ml="auto"
          label={m.home_testimonials_a11y_rating()}
        />
      </HStack>
    </Reveal>
  )
}

/** Genuine Google reviews, beside the three promises that earned them. */
function TestimonialsSection() {
  return (
    <SiteContainer as="section" pt={{ base: 16, md: '120px' }}>
      <Grid
        gap={{ base: 10, lg: 14 }}
        alignItems="start"
        templateColumns={{ base: '1fr', lg: '0.9fr 1.4fr' }}
      >
        <Reveal>
          <SectionHeading
            eyebrow={m.home_testimonials_eyebrow()}
            title={m.home_testimonials_title()}
            lead={m.home_testimonials_lead()}
            maxW="38ch"
          />

          <Stack gap={3} mt="26px">
            <CheckItem label={m.home_testimonials_promiseReclean()} />
            <CheckItem label={m.home_testimonials_promiseRepair()} />
            <CheckItem label={m.home_testimonials_promiseUpdates()} />
          </Stack>
        </Reveal>

        <Stack gap={4.5}>
          {homeTestimonials.map((item) => (
            <TestimonialCard key={item.id} item={item} />
          ))}
        </Stack>
      </Grid>
    </SiteContainer>
  )
}

export default TestimonialsSection
