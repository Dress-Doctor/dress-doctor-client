import { Box, Center, SimpleGrid, Stack, Text } from '@chakra-ui/react'
import Reveal from '#/components/site/reveal'
import SectionHeading from '#/components/site/section-heading'
import SiteContainer from '#/components/site/site-container'
import { homeSteps } from '#/data/home.data'
import type { HomeStepDto } from '#/interfaces/site.dto'
import { m } from '#/paraglide/messages'

const accents = {
  turquoise: {
    color: '#24B9C6',
    borderColor: 'rgba(46, 207, 220, 0.3)',
    boxShadow: '0 16px 36px rgba(46, 207, 220, 0.16)',
  },
  amber: {
    color: 'amber-orange.500',
    borderColor: 'rgba(255, 137, 74, 0.35)',
    boxShadow: '0 16px 36px rgba(255, 137, 74, 0.16)',
  },
} as const

function Step({ step, delay }: { step: HomeStepDto; delay: number }) {
  return (
    <Reveal delay={delay} position="relative" px={2.5} textAlign="center">
      <Center
        boxSize="76px"
        mx="auto"
        rounded="full"
        fontFamily="display"
        fontSize="2xl"
        fontWeight="extrabold"
        fontStyle="italic"
        bg="rgba(255, 255, 255, 0.9)"
        backdropFilter="blur(8px)"
        borderWidth="1px"
        {...accents[step.accent]}
      >
        {step.index}
      </Center>

      <Stack gap={2} mt={5}>
        <Text as="h3" fontSize="lg" fontWeight="semibold" color="site.ink">
          {step.title()}
        </Text>
        <Text
          fontSize="14.5px"
          lineHeight="1.6"
          textWrap="pretty"
          color="site.ink-muted"
        >
          {step.body()}
        </Text>
      </Stack>
    </Reveal>
  )
}

/**
 * The four steps between a basket and a wardrobe, strung along a single line
 * that fades from turquoise into the amber of the final delivery.
 */
function StepsSection() {
  return (
    <SiteContainer as="section" pt={{ base: 16, md: '120px' }}>
      <Reveal maxW="620px" mx="auto" mb={16} textAlign="center">
        <SectionHeading
          eyebrow={m.home_steps_eyebrow()}
          title={m.home_steps_title()}
          lead={m.home_steps_lead()}
        />
      </Reveal>

      <Box position="relative">
        <Box
          aria-hidden
          position="absolute"
          top="38px"
          left="12%"
          right="12%"
          h="2px"
          rounded="2px"
          display={{ base: 'none', lg: 'block' }}
          bgImage="linear-gradient(90deg, rgba(46, 207, 220, 0.5), rgba(46, 207, 220, 0.15) 50%, rgba(255, 137, 74, 0.35))"
        />

        <SimpleGrid
          position="relative"
          columns={{ base: 1, sm: 2, lg: 4 }}
          gap="22px"
          rowGap={12}
        >
          {homeSteps.map((step, index) => (
            <Step key={step.id} step={step} delay={index * 90} />
          ))}
        </SimpleGrid>
      </Box>
    </SiteContainer>
  )
}

export default StepsSection
