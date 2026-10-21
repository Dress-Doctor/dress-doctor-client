import { Box, Center, Flex, HStack, Icon, Stack, Text } from '@chakra-ui/react'
import icons from '#/config/icons'
import SiteButton from '#/components/site/site-button'
import { QUARTERLY_MULTIPLIER } from '#/data/home.data'
import { siteGradients } from '#/data/site.data'
import { useSiteModals } from '#/hooks/use-site-modals'
import type {
  HomePlanDto,
  PlanBillingDto,
  PlanModeDto,
} from '#/interfaces/site.dto'
import utils from '#/libs/utils'
import { m } from '#/paraglide/messages'

interface PlanCardProps {
  plan: HomePlanDto
  mode: PlanModeDto
  billing: PlanBillingDto
}

/**
 * Tag colours. The featured plan's tag is the only filled one — the brand
 * gradient, lit and glowing like the primary CTA beneath it — so the
 * recommendation outranks the two audience labels rather than matching them.
 */
const tagPalette = (plan: HomePlanDto) => {
  if (plan.featured) {
    return {
      color: 'white',
      bgGradient: 'to-b',
      gradientFrom: siteGradients.ctaFrom,
      gradientTo: siteGradients.ctaTo,
      boxShadow:
        '0 6px 16px rgba(46, 207, 220, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.45)',
    }
  }
  if (plan.id === 'premium') {
    return { bg: 'rgba(255, 137, 74, 0.12)', color: 'amber-orange.700' }
  }
  return { bg: 'rgba(32, 41, 56, 0.06)', color: 'dark-bluish-gray.500' }
}

/**
 * One subscription.
 *
 * The featured plan is framed rather than merely tinted: it sits proud of the
 * row by 16px and carries a 2.5px navy border, so the recommendation reads
 * even in a screenshot with no colour.
 *
 * The lift is negative margin on a flex child that grows to fill its cell
 * (`flex="1"`), so the margins add to its height. A fixed `h="full"` would
 * keep the cell's height and just shift the frame up, leaving the content to
 * overflow the border at the bottom.
 */
function PlanCard({ plan, mode, billing }: PlanCardProps) {
  const { openSubscribe } = useSiteModals()
  const isKg = mode === 'kg'
  const isQuarterly = billing === 'quarterly'
  const monthly = Math.round(
    plan.price * (isQuarterly ? QUARTERLY_MULTIPLIER : 1),
  )

  const name = plan.name()
  const features = isKg ? plan.featuresKg : plan.featuresPieces
  const tag = tagPalette(plan)

  const frame = plan.featured
    ? {
        my: { lg: '-16px' },
        mx: { lg: '-4px' },
        p: '7px',
        rounded: '34px',
        borderWidth: '2.5px',
        borderColor: 'dark-bluish-gray.500',
        boxShadow: '0 36px 74px rgba(32, 41, 56, 0.2)',
      }
    : {
        rounded: '26px',
        borderWidth: '1px',
        borderColor: 'rgba(0, 23, 31, 0.06)',
        boxShadow:
          '0 1px 2px rgba(0, 23, 31, 0.03), 0 18px 44px rgba(0, 23, 31, 0.05)',
      }

  return (
    <Flex direction="column" flex="1" bg="white" {...frame}>
      <Stack gap={0} flex="1" p="30px" rounded="26px" bg="white">
        <Flex gap={2.5} align="center" justify="space-between">
          <Text
            as="h3"
            fontSize="2xl"
            fontWeight="bold"
            letterSpacing="-0.01em"
            color="site.ink"
          >
            {name}
          </Text>

          <HStack
            as="span"
            gap={1.5}
            px={3}
            py={1.5}
            rounded="full"
            fontSize="10.5px"
            fontWeight="bold"
            letterSpacing="0.09em"
            fontFamily="label"
            textTransform="uppercase"
            whiteSpace="nowrap"
            {...tag}
          >
            {plan.featured && (
              <Icon
                aria-hidden
                boxSize={3}
                as={icons.star}
                fill="currentColor"
              />
            )}
            {plan.tag()}
          </HStack>
        </Flex>

        <Text
          mt={2.5}
          fontSize="14.5px"
          lineHeight="1.55"
          color="site.ink-muted"
        >
          {plan.best()}
        </Text>

        <Flex mt={4.5} gap={2} rowGap={0} wrap="wrap" align="baseline">
          <Text
            fontFamily="display"
            fontVariantNumeric="tabular-nums"
            fontSize="48px"
            fontWeight="black"
            lineHeight="1"
            letterSpacing="-0.025em"
            color="site.ink"
          >
            {utils.toGrouped(monthly)}
          </Text>
          <Text
            as="span"
            fontFamily="display"
            fontSize="17px"
            fontWeight="extrabold"
            color="site.ink"
          >
            XAF
          </Text>
          <Text as="span" fontSize="sm" color="site.ink-subtle">
            {m.home_plans_perMonth()}
          </Text>
        </Flex>

        {isQuarterly && (
          <Text
            mt={2}
            fontSize="12.5px"
            fontWeight="semibold"
            color="turquoise-blue.700"
          >
            {m.home_plans_billedQuarterly({
              total: utils.toXaf(monthly * 3),
            })}
          </Text>
        )}

        <HStack
          gap={3}
          mt={5}
          p={4}
          rounded="16px"
          bg={plan.featured ? 'rgba(46, 207, 220, 0.09)' : 'site.sunken'}
          borderWidth="1px"
          borderColor={
            plan.featured ? 'rgba(46, 207, 220, 0.35)' : 'rgba(0, 23, 31, 0.05)'
          }
        >
          <Center
            flex="none"
            boxSize={10}
            rounded="12px"
            color={plan.featured ? 'white' : 'turquoise-blue.700'}
            bg={plan.featured ? undefined : 'white'}
            bgGradient={plan.featured ? 'to-b' : undefined}
            gradientFrom="#3AD5E1"
            gradientTo="#24B9C6"
            boxShadow={
              plan.featured
                ? '0 8px 18px rgba(46, 207, 220, 0.35)'
                : '0 6px 16px rgba(0, 23, 31, 0.07)'
            }
          >
            <Icon
              aria-hidden
              boxSize={4.5}
              as={isKg ? icons.weight : icons.garment}
            />
          </Center>

          <Stack gap={0.5}>
            <Text
              as="span"
              fontSize="11px"
              fontWeight="bold"
              letterSpacing="0.1em"
              fontFamily="label"
              textTransform="uppercase"
              color="turquoise-blue.700"
            >
              {isKg
                ? m.home_plans_allowanceKg()
                : m.home_plans_allowancePieces()}
            </Text>
            <Text as="span" fontSize="md" fontWeight="bold" color="site.ink">
              {isKg ? plan.allowKg() : plan.allowPieces()}
            </Text>
          </Stack>
        </HStack>

        <Box my={5} h="1px" bg="rgba(0, 23, 31, 0.08)" />

        <Stack as="ul" gap={3} flex="1" listStyleType="none">
          {features.map((feature) => (
            <HStack as="li" key={feature.id} gap={2.5} align="flex-start">
              <Icon
                aria-hidden
                boxSize={3.5}
                mt={0.5}
                flex="none"
                as={icons.check}
                strokeWidth="2.8"
                color="#24B9C6"
              />
              <Text fontSize="sm" lineHeight="1.5">
                <Text as="span" fontWeight="semibold" color="site.ink">
                  {feature.title()}
                </Text>
                <Text as="span" fontSize="13.5px" color="site.ink-subtle">
                  {' — '}
                  {feature.note()}
                </Text>
              </Text>
            </HStack>
          ))}
        </Stack>

        <SiteButton
          w="full"
          mt={6}
          px="15px"
          py="15px"
          fontSize="15px"
          variant={plan.featured ? 'primary' : 'solidDark'}
          aria-haspopup="dialog"
          onClick={() => openSubscribe({ plan: plan.id })}
          // Spread rather than a conditional prop: `boxShadow={undefined}`
          // still lands in the props object and wipes the variant's own.
          {...(plan.featured && {
            boxShadow:
              '0 12px 28px rgba(46, 207, 220, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.35)',
          })}
        >
          {plan.cta()}
          <Icon aria-hidden boxSize={3.5} as={icons.forward} />
        </SiteButton>
      </Stack>
    </Flex>
  )
}

export default PlanCard
