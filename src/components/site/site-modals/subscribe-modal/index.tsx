import {
  Box,
  Dialog,
  Flex,
  HStack,
  Icon,
  Input,
  SimpleGrid,
  Stack,
  Text,
} from '@chakra-ui/react'
import icons from '#/config/icons'
import SiteButton from '#/components/site/site-button'
import { homePlans } from '#/data/home.data'
import type { SubscribeFlow } from '#/hooks/use-subscribe-flow'
import { monthlyPlanPrice } from '#/libs/booking'
import utils from '#/libs/utils'
import { focusField } from '#/libs/focus-field'
import { m } from '#/paraglide/messages'
import ModalField, { inputProps } from '../modal-field'
import ModalForm from '../modal-form'
import ModalFrame from '../modal-frame'
import PhoneInput from '../phone-input'
import ModalHeader, { modalPadX } from '../modal-header'
import { PlanPicker, PlanToggles } from './plan-options'
import SubscribeSuccess from './subscribe-success'

interface SubscribeModalProps {
  flow: SubscribeFlow
  /** Whether the address says this form is open. */
  open: boolean
  onClose: () => void
  returnFocusTo: () => HTMLElement | null
}

/**
 * The plan form: pick a plan, see exactly what it gives, leave a name and a
 * number. One instance serves every plan button on the site.
 *
 * Plans are set up with a person, so sending the form does not create the
 * subscription — it finishes the details and hands them to WhatsApp (see
 * `SubscribeSuccess`).
 */
function SubscribeModal({
  flow,
  open,
  onClose,
  returnFocusTo,
}: SubscribeModalProps) {
  const { submitted, planId, mode, billing, errors } = flow

  const plan = homePlans.find((candidate) => candidate.id === planId)!
  const name = plan.name()
  const monthly = monthlyPlanPrice(plan.price, billing)
  const features = mode === 'kg' ? plan.featuresKg : plan.featuresPieces
  const allowance = mode === 'kg' ? plan.allowKg() : plan.allowPieces()

  return (
    <ModalFrame
      open={open}
      onClose={onClose}
      returnFocusTo={returnFocusTo}
      onExitComplete={flow.finish}
      label={m.subscribe_a11y_dialog()}
      display="flex"
      flexDirection="column"
      maxW={submitted ? '620px' : '680px'}
    >
      {submitted ? (
        <SubscribeSuccess flow={flow} onClose={onClose} />
      ) : (
        <ModalForm
          noValidate
          onSubmit={(event) => {
            event.preventDefault()
            const wrong = flow.submit()
            if (wrong) focusField(event.currentTarget, wrong)
          }}
        >
          <ModalHeader
            eyebrow={m.subscribe_eyebrow()}
            title={m.subscribe_title({ plan: name })}
            sub={m.subscribe_sub()}
            closeLabel={m.subscribe_a11y_close()}
          />

          <Dialog.Body
            flex="1"
            minH={0}
            overflowY="auto"
            overscrollBehavior="contain"
            px={modalPadX}
            pt={5}
            pb={4}
          >
            <Stack gap={4}>
              <Stack gap={2}>
                <Text fontSize="13px" fontWeight="semibold" color="site.ink">
                  {m.subscribe_choosePlan()}
                </Text>
                <PlanPicker flow={flow} />
              </Stack>

              <PlanToggles flow={flow} />

              <Box p={{ base: 4, md: 5 }} rounded="16px" bg="site.sunken">
                <Flex
                  gap={3}
                  align="baseline"
                  justify="space-between"
                  wrap="wrap"
                >
                  <Text fontSize="16px" fontWeight="bold" color="site.ink">
                    {m.subscribe_summary_title({ plan: name })}
                  </Text>

                  <Text
                    fontFamily="display"
                    fontVariantNumeric="tabular-nums"
                    fontSize="26px"
                    fontWeight="black"
                    lineHeight="1"
                    color="site.ink"
                  >
                    {utils.toGrouped(monthly)}{' '}
                    <Text as="span" fontSize="14px" fontWeight="semibold">
                      XAF {m.home_plans_perMonth()}
                    </Text>
                  </Text>
                </Flex>

                {billing === 'quarterly' && (
                  <Text
                    mt={1}
                    textAlign={{ sm: 'end' }}
                    fontSize="12.5px"
                    fontWeight="semibold"
                    color="turquoise-blue.700"
                  >
                    {m.home_plans_billedQuarterly({
                      total: utils.toXaf(monthly * 3),
                    })}
                  </Text>
                )}

                <Stack as="ul" mt={3} gap={1.5} listStyleType="none">
                  <HStack as="li" gap={2} align="flex-start">
                    <Icon
                      aria-hidden
                      flex="none"
                      boxSize={3.5}
                      mt={0.5}
                      as={mode === 'kg' ? icons.weight : icons.garment}
                      color="turquoise-blue.600"
                    />
                    <Text fontSize="13.5px" fontWeight="bold" color="site.ink">
                      {allowance}
                    </Text>
                  </HStack>

                  {features.map((feature) => (
                    <HStack as="li" key={feature.id} gap={2} align="flex-start">
                      <Icon
                        aria-hidden
                        flex="none"
                        boxSize={3.5}
                        mt={0.5}
                        as={icons.check}
                        strokeWidth="2.8"
                        color="turquoise-blue.600"
                      />
                      <Text fontSize="13.5px" lineHeight="1.5" color="site.ink">
                        <Text as="span" fontWeight="semibold">
                          {feature.title()}
                        </Text>
                        <Text as="span" color="site.ink-subtle">
                          {' — '}
                          {feature.note()}
                        </Text>
                      </Text>
                    </HStack>
                  ))}
                </Stack>
              </Box>

              <SimpleGrid columns={{ base: 1, sm: 2 }} gap={3}>
                <ModalField
                  label={m.subscribe_field_firstName_label()}
                  error={
                    errors.firstName ? m.subscribe_error_firstName() : undefined
                  }
                >
                  <Input
                    {...inputProps}
                    name="firstName"
                    autoComplete="given-name"
                    spellCheck={false}
                    value={flow.firstName}
                    placeholder={m.subscribe_field_firstName_placeholder()}
                    onChange={(event) =>
                      flow.changeFirstName(event.target.value)
                    }
                  />
                </ModalField>

                <ModalField
                  label={m.subscribe_field_phone_label()}
                  error={errors.phone ? m.subscribe_error_phone() : undefined}
                >
                  <PhoneInput
                    name="phone"
                    country={flow.phoneCountry}
                    value={flow.phone}
                    placeholder={m.subscribe_field_phone_placeholder()}
                    onValueChange={flow.changePhone}
                  />
                </ModalField>
              </SimpleGrid>
            </Stack>
          </Dialog.Body>

          <Dialog.Footer
            flex="none"
            gap={3}
            justifyContent="space-between"
            px={modalPadX}
            pt={4}
            pb={{ base: 5, md: 6 }}
            borderTopWidth="1px"
            borderColor="rgba(0, 23, 31, 0.06)"
            bg="white"
          >
            <Text
              display={{ base: 'none', sm: 'block' }}
              fontSize="12.5px"
              color="site.ink-muted"
            >
              {m.subscribe_hint()}
            </Text>

            <SiteButton
              type="submit"
              px={6}
              py="13px"
              fontSize="15px"
              w={{ base: 'full', sm: 'auto' }}
              boxShadow="0 10px 24px rgba(46, 207, 220, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.35)"
            >
              {m.subscribe_action_submit({ plan: name })}
              <Icon aria-hidden boxSize={3.5} as={icons.forward} />
            </SiteButton>
          </Dialog.Footer>
        </ModalForm>
      )}
    </ModalFrame>
  )
}

export default SubscribeModal
