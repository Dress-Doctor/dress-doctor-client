import {
  Icon,
  Link as ChakraLink,
  SimpleGrid,
  Stack,
  Text,
} from '@chakra-ui/react'
import { Link } from '@tanstack/react-router'
import icons from '#/config/icons'
import Reveal from '#/components/site/reveal'
import SectionHeading from '#/components/site/section-heading'
import SiteContainer from '#/components/site/site-container'
import { homePlans } from '#/data/home.data'
import { sitePaths } from '#/data/site.data'
import type { PlanBillingDto, PlanModeDto } from '#/interfaces/site.dto'
import { m } from '#/paraglide/messages'
import PlanCard from './plan-card'
import PlansToolbar, { PlansModeNote } from './plans-toolbar'

interface PlansSectionProps {
  mode: PlanModeDto
  billing: PlanBillingDto
  onModeChange: (mode: PlanModeDto) => void
  onBillingChange: (billing: PlanBillingDto) => void
}

/**
 * The three subscriptions. Which mode and billing period they are read in is
 * owned by the route, so the choice survives a reload and can be linked to.
 */
function PlansSection({
  mode,
  billing,
  onModeChange,
  onBillingChange,
}: PlansSectionProps) {
  return (
    <SiteContainer as="section" pt={{ base: 16, md: '120px' }}>
      <Reveal maxW="640px" mx="auto" mb="60px" textAlign="center">
        <SectionHeading
          eyebrow={m.home_plans_eyebrow()}
          title={m.home_plans_title()}
          lead={m.home_plans_lead()}
        />
      </Reveal>

      <Reveal>
        <PlansToolbar
          mode={mode}
          billing={billing}
          onModeChange={onModeChange}
          onBillingChange={onBillingChange}
        />
      </Reveal>

      <Reveal>
        <PlansModeNote mode={mode} onModeChange={onModeChange} />
      </Reveal>

      <SimpleGrid
        mt={11}
        gap={6}
        alignItems="stretch"
        columns={{ base: 1, md: 2, lg: 3 }}
      >
        {homePlans.map((plan) => (
          <Reveal
            key={plan.id}
            delay={plan.delay}
            display="flex"
            flexDirection="column"
          >
            <PlanCard plan={plan} mode={mode} billing={billing} />
          </Reveal>
        ))}
      </SimpleGrid>

      <Stack gap={6} mt="26px" textAlign="center">
        <Reveal>
          <Text fontSize="sm" color="site.ink-muted">
            {m.home_plans_note()}
          </Text>
        </Reveal>

        <Reveal>
          <ChakraLink
            asChild
            gap={2}
            display="inline-flex"
            alignItems="center"
            fontSize="15.5px"
            fontWeight="semibold"
            textDecoration="none"
            color="turquoise-blue.700"
          >
            <Link to={sitePaths.pricing}>
              {m.home_plans_compare()}
              <Icon aria-hidden boxSize={3.5} as={icons.forward} />
            </Link>
          </ChakraLink>
        </Reveal>
      </Stack>
    </SiteContainer>
  )
}

export default PlansSection
