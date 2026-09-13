import { Box, Grid, Icon, Link as ChakraLink, Stack } from '@chakra-ui/react'
import { Link } from '@tanstack/react-router'
import icons from '#/config/icons'
import CheckItem from '#/components/site/check-item'
import Reveal from '#/components/site/reveal'
import SectionHeading from '#/components/site/section-heading'
import SiteContainer from '#/components/site/site-container'
import { homeAnchors, sitePaths } from '#/data/site.data'
import type { EstimateModeDto } from '#/interfaces/site.dto'
import { m } from '#/paraglide/messages'
import EstimatorCard from './estimator-card'

interface EstimatorSectionProps {
  mode: EstimateModeDto
  onModeChange: (mode: EstimateModeDto) => void
}

function EstimatorSection({ mode, onModeChange }: EstimatorSectionProps) {
  return (
    <SiteContainer
      as="section"
      pt={{ base: 16, md: '120px' }}
      id={homeAnchors.estimate}
      scrollMarginTop="100px"
    >
      <Reveal
        position="relative"
        rounded="32px"
        overflow="hidden"
        bg="dark-bluish-gray.500"
      >
        <Box
          aria-hidden
          position="absolute"
          top="-160px"
          right="-120px"
          boxSize="560px"
          rounded="full"
          pointerEvents="none"
          animation="dd-drift 16s ease-in-out infinite"
          bgImage="radial-gradient(circle, rgba(46, 207, 220, 0.22) 0%, transparent 65%)"
          _motionReduce={{ animation: 'none' }}
        />
        <Box
          aria-hidden
          position="absolute"
          bottom="-200px"
          left="-140px"
          boxSize="520px"
          rounded="full"
          pointerEvents="none"
          bgImage="radial-gradient(circle, rgba(255, 137, 74, 0.13) 0%, transparent 65%)"
        />

        <Grid
          position="relative"
          px={{ base: 6, md: 16 }}
          py={{ base: 12, md: 20 }}
          gap={{ base: 10, lg: '60px' }}
          alignItems="center"
          templateColumns={{ base: '1fr', lg: '1fr 1.1fr' }}
        >
          <Stack gap={0}>
            <SectionHeading
              tone="light"
              size="md"
              eyebrow={m.home_estimator_eyebrow()}
              title={m.home_estimator_title()}
              lead={m.home_estimator_lead()}
            />

            <Stack gap={3.5} mt={7} maxW="46ch">
              <CheckItem tone="light" label={m.home_estimator_perkPickup()} />
              <CheckItem tone="light" label={m.home_estimator_perkApprove()} />
              <CheckItem tone="light" label={m.home_estimator_perkPay()} />
            </Stack>

            <ChakraLink
              asChild
              mt={5}
              py={2}
              gap={2}
              display="inline-flex"
              alignItems="center"
              alignSelf="flex-start"
              fontSize="15.5px"
              fontWeight="semibold"
              textDecoration="none"
              color="turquoise-blue.500"
            >
              <Link to={sitePaths.catalog}>
                {m.home_estimator_priceList()}
                <Icon aria-hidden boxSize={3.5} as={icons.forward} />
              </Link>
            </ChakraLink>
          </Stack>

          <EstimatorCard mode={mode} onModeChange={onModeChange} />
        </Grid>
      </Reveal>
    </SiteContainer>
  )
}

export default EstimatorSection
