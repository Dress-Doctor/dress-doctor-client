import {
  Box,
  Button,
  Dialog,
  Flex,
  HStack,
  Icon,
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
import ContactAccountNote from '../contact-account-note'
import ContactFields from '../contact-fields'
import ModalForm from '../modal-form'
import ModalFrame from '../modal-frame'
import ModalHeader, { modalPadX } from '../modal-header'
import SignedInNote from '../signed-in-note'
import SignupError from '../signup-error'
import VerifyContact from '../verify-contact'
import { PlanPicker, PlanToggles } from './plan-options'
import SubscribeSuccess from './subscribe-success'

interface SubscribeModalProps {
  flow: SubscribeFlow
  /** Whether the address says this form is open. */
  open: boolean
  onClose: () => void
  returnFocusTo: () => HTMLElement | null
}

/** What the button says: ask for the code, or ask for the plan. */
function submitLabel(flow: SubscribeFlow, plan: string) {
  if (flow.canRetry) return m.common_action_tryAgain()
  // A visitor who is not signed in has a code to ask for before the plan.
  if (flow.step === 'details' && !flow.customer) {
    return m.subscribe_action_sendCode()
  }
  return m.subscribe_action_submit({ plan })
}

/**
 * The plan form: pick a plan, see exactly what it gives, say who you are. One
 * instance serves every plan button on the site.
 *
 * A plan is set up by a person, so sending the form only asks for it: staff
 * ring to confirm it and say how to pay. A visitor who is not signed in proves
 * their WhatsApp or email with a code first, which also makes their account
 * (see `SubscribeFlow`); a customer who is signed in just asks.
 */
function SubscribeModal({
  flow,
  open,
  onClose,
  returnFocusTo,
}: SubscribeModalProps) {
  const { submitted, planId, mode, billing, errors, step, verification } = flow

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
            title={
              step === 'verify'
                ? verification.target?.channel === 'email'
                  ? m.subscribe_step_verify_titleEmail()
                  : m.subscribe_step_verify_titleWhatsapp()
                : m.subscribe_title({ plan: name })
            }
            sub={
              step === 'verify'
                ? m.subscribe_step_verify_sub()
                : m.subscribe_sub()
            }
            closeLabel={m.subscribe_a11y_close()}
          >
            {flow.customer && (
              <SignedInNote
                label={m.subscribe_account_title({
                  name: utils.fullName(flow.customer),
                })}
                loggingOut={flow.loggingOut}
                disabled={flow.sending}
                onLogout={flow.logoutHere}
              />
            )}
          </ModalHeader>

          <Dialog.Body
            flex="1"
            minH={0}
            overflowY="auto"
            overscrollBehavior="contain"
            px={modalPadX}
            pt={5}
            pb={4}
          >
            {step === 'verify' ? (
              <VerifyContact
                verification={verification}
                targets={flow.targets}
                phoneTarget={flow.phoneTarget}
                sendError={flow.sendError}
              />
            ) : (
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
                      <Text
                        fontSize="13.5px"
                        fontWeight="bold"
                        color="site.ink"
                      >
                        {allowance}
                      </Text>
                    </HStack>

                    {features.map((feature) => (
                      <HStack
                        as="li"
                        key={feature.id}
                        gap={2}
                        align="flex-start"
                      >
                        <Icon
                          aria-hidden
                          flex="none"
                          boxSize={3.5}
                          mt={0.5}
                          as={icons.check}
                          strokeWidth="2.8"
                          color="turquoise-blue.600"
                        />
                        <Text
                          fontSize="13.5px"
                          lineHeight="1.5"
                          color="site.ink"
                        >
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

                {/* Signed in: the account already holds who they are. */}
                {!flow.customer && (
                  <>
                    <ContactFields
                      contact={flow.draft}
                      errors={errors}
                      onChange={flow.update}
                    />
                    <ContactAccountNote />
                  </>
                )}
              </Stack>
            )}

            {/* The code step says its own failures, in its own place. */}
            {step !== 'verify' && flow.sendError && (
              <Box mt={4}>
                <SignupError error={flow.sendError} />
              </Box>
            )}
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
            {step === 'verify' ? (
              <Button
                variant="plain"
                h="auto"
                gap={1.5}
                px={4.5}
                py="11px"
                rounded="full"
                fontSize="14px"
                fontWeight="semibold"
                color="site.ink-muted"
                disabled={flow.sending || verification.outcome !== null}
                _hover={{ bg: 'rgba(0, 23, 31, 0.04)' }}
                onClick={flow.back}
              >
                <Icon aria-hidden boxSize={3.5} as={icons.back} />
                {m.common_action_goBack()}
              </Button>
            ) : (
              <Text
                display={{ base: 'none', sm: 'block' }}
                fontSize="12.5px"
                color="site.ink-muted"
              >
                {m.subscribe_hint()}
              </Text>
            )}

            <SiteButton
              type="submit"
              px={6}
              py="13px"
              fontSize="15px"
              w={{ base: 'full', sm: 'auto' }}
              loading={flow.sending}
              loadingText={
                verification.sending
                  ? m.auth_action_sending()
                  : verification.verifying && !verification.finishing
                    ? m.auth_action_verifying()
                    : m.auth_action_sending()
              }
              boxShadow="0 10px 24px rgba(46, 207, 220, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.35)"
            >
              {submitLabel(flow, name)}
              <Icon aria-hidden boxSize={3.5} as={icons.forward} />
            </SiteButton>
          </Dialog.Footer>
        </ModalForm>
      )}
    </ModalFrame>
  )
}

export default SubscribeModal
