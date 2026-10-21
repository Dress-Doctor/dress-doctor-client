import {
  Button,
  Dialog,
  HStack,
  Icon,
  Link as ChakraLink,
  Text,
} from '@chakra-ui/react'
import icons from '#/config/icons'
import SiteButton from '#/components/site/site-button'
import { homePlans } from '#/data/home.data'
import type {
  PlacedPlanKindDto,
  SubscribeFlow,
} from '#/hooks/use-subscribe-flow'
import { monthlyPlanPrice } from '#/libs/booking'
import { formatInternational, getCountry } from '#/libs/phone'
import utils from '#/libs/utils'
import { whatsappUrl } from '#/libs/whatsapp'
import { m } from '#/paraglide/messages'
import AccountCard from '../account-card'
import { modalPadX } from '../modal-header'
import SuccessHero from '../success-hero'

/** The words at the top, for what happened to the plan. */
function heroText(kind: PlacedPlanKindDto) {
  switch (kind) {
    case 'requested':
      return {
        title: m.subscribe_success_requestTitle(),
        body: m.subscribe_success_requestBody(),
      }
    case 'open':
      return {
        title: m.subscribe_success_openTitle(),
        body: m.subscribe_success_openBody(),
      }
    case 'whatsapp':
      return {
        title: m.subscribe_success_title(),
        body: m.subscribe_success_body(),
      }
  }
}

/**
 * The step after the plan has been dealt with. A plan is set up by a person,
 * so this says it is a request — and the button opens WhatsApp with the plan,
 * the billing and the visitor's name and number already typed, for anyone who
 * would rather talk. When the website did not know the plan, that button is the
 * way to ask for it.
 */
function SubscribeSuccess({
  flow,
  onClose,
}: {
  flow: SubscribeFlow
  onClose: () => void
}) {
  const { planId, mode, billing, draft, customer, placed } = flow
  const hero = heroText(placed?.kind ?? 'requested')

  const plan = homePlans.find((candidate) => candidate.id === planId)!
  const price = utils.toXaf(monthlyPlanPrice(plan.price, billing))

  const message = m.subscribe_whatsapp_message({
    plan: plan.name(),
    allowance: mode === 'kg' ? plan.allowKg() : plan.allowPieces(),
    billing:
      billing === 'quarterly'
        ? m.subscribe_whatsapp_billingQuarterly()
        : m.subscribe_whatsapp_billingMonthly(),
    price,
    // A customer who was signed in is who the account says, not what the form
    // holds.
    name: customer ? utils.fullName(customer) : draft.firstName.trim(),
    phone: customer?.phone
      ? `+${customer.phone}`
      : formatInternational(getCountry(draft.phoneCountry), draft.phone),
  })

  return (
    <>
      <SuccessHero title={hero.title} body={hero.body} />

      {placed?.outcome && (
        <Dialog.Body px={modalPadX} pt={1} pb={2}>
          <AccountCard outcome={placed.outcome} />
        </Dialog.Body>
      )}

      <Dialog.Footer
        flex="none"
        gap={3}
        rowGap={3}
        flexWrap="wrap"
        justifyContent="space-between"
        px={modalPadX}
        pt={4}
        pb={{ base: 5, md: 6 }}
      >
        {/* Not for a request already open: the plan chosen here was not made. */}
        {placed?.kind !== 'open' && (
          <HStack
            gap={1.5}
            fontSize="13px"
            fontWeight="semibold"
            color="turquoise-blue.700"
          >
            <Icon aria-hidden boxSize={3.5} as={icons.secure} />
            <Text as="span">
              {m.subscribe_success_plan({ plan: plan.name(), price })}
            </Text>
          </HStack>
        )}

        <HStack gap={2.5} ml="auto">
          <Button
            variant="outline"
            h="auto"
            px={5}
            py="11px"
            rounded="full"
            fontSize="14px"
            fontWeight="semibold"
            color="site.ink"
            borderWidth="1.5px"
            borderColor="rgba(0, 23, 31, 0.13)"
            _hover={{ bg: 'rgba(0, 23, 31, 0.04)' }}
            onClick={onClose}
          >
            {m.subscribe_success_close()}
          </Button>

          <SiteButton
            asChild
            px={5}
            py="11px"
            fontSize="14px"
            boxShadow="0 10px 24px rgba(46, 207, 220, 0.35)"
          >
            <ChakraLink
              target="_blank"
              rel="noopener"
              href={whatsappUrl(message)}
            >
              <Icon aria-hidden boxSize={4} as={icons.whatsappBrand} />
              {m.subscribe_success_whatsapp()}
            </ChakraLink>
          </SiteButton>
        </HStack>
      </Dialog.Footer>
    </>
  )
}

export default SubscribeSuccess
