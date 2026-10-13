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
import type { SubscribeFlow } from '#/hooks/use-subscribe-flow'
import { monthlyPlanPrice } from '#/libs/booking'
import { formatInternational, getCountry } from '#/libs/phone'
import utils from '#/libs/utils'
import { whatsappUrl } from '#/libs/whatsapp'
import { m } from '#/paraglide/messages'
import { modalPadX } from '../modal-header'
import SuccessHero from '../success-hero'

/**
 * The step after the details are in. A plan is set up by a person, so the
 * button here opens WhatsApp with the plan, the billing and the visitor's name
 * and number already typed — one tap to send.
 */
function SubscribeSuccess({
  flow,
  onClose,
}: {
  flow: SubscribeFlow
  onClose: () => void
}) {
  const { planId, mode, billing, firstName, phone, phoneCountry } = flow

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
    name: firstName.trim(),
    phone: formatInternational(getCountry(phoneCountry), phone),
  })

  return (
    <>
      <SuccessHero
        title={m.subscribe_success_title()}
        body={m.subscribe_success_body()}
      />

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

        <HStack gap={2.5}>
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
