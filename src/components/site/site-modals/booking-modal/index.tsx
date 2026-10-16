import { Box, Button, Dialog, Flex, Icon, Text } from '@chakra-ui/react'
import icons from '#/config/icons'
import SiteButton from '#/components/site/site-button'
import type { BookingFlow } from '#/hooks/use-booking-flow'
import type { BookingStepIdDto } from '#/interfaces/booking.dto'
import { focusField } from '#/libs/focus-field'
import { m } from '#/paraglide/messages'
import ModalForm from '../modal-form'
import ModalFrame from '../modal-frame'
import ModalHeader, { modalPadX } from '../modal-header'
import SignupError from '../signup-error'
import AccountNote from './account-note'
import AddressStep from './address-step'
import BookingAside from './booking-aside'
import BookingSuccess from './booking-success'
import ContactStep from './contact-step'
import ServiceStep from './service-step'
import TimeStep from './time-step'
import VerifyStep from './verify-step'

/** The question and the line of help for each step. */
function stepText(step: BookingStepIdDto, flow: BookingFlow) {
  switch (step) {
    case 'service':
      return {
        title: m.booking_step_service_title(),
        sub: m.booking_step_service_sub(),
      }
    case 'time':
      return {
        title: m.booking_step_time_title(),
        sub: m.booking_step_time_sub(),
      }
    case 'address':
      return {
        title: m.booking_step_address_title(),
        sub: m.booking_step_address_sub(),
      }
    case 'contact':
      return {
        title: m.booking_step_contact_title(),
        sub: m.booking_step_contact_sub(),
      }
    case 'verify':
      return {
        // The code goes where the visitor chose: say which, in the title.
        title:
          flow.verification.target?.channel === 'email'
            ? m.booking_step_verify_titleEmail()
            : m.booking_step_verify_titleWhatsapp(),
        sub: m.booking_step_verify_sub(),
      }
  }
}

/** One bar for each step, filled up to the step the visitor is on. */
function Progress({ total, step }: { total: number; step: number }) {
  return (
    <Flex
      gap={1.5}
      role="progressbar"
      aria-label={m.booking_a11y_dialog()}
      aria-valuemin={1}
      aria-valuemax={total}
      aria-valuenow={step + 1}
      aria-valuetext={m.booking_a11y_progress({
        step: step + 1,
        total,
      })}
    >
      {Array.from({ length: total }, (_, index) => (
        <Box
          key={index}
          flex="1"
          h="5px"
          rounded="full"
          transitionProperty="background"
          transitionDuration="slow"
          bg={
            index < step
              ? 'turquoise-blue.500'
              : index === step
                ? undefined
                : 'rgba(0, 23, 31, 0.08)'
          }
          bgImage={
            index === step
              ? 'linear-gradient(90deg, #2ECFDC, #9EE9F0)'
              : undefined
          }
        />
      ))}
    </Flex>
  )
}

/** What the button says: ask for the code, send the request, or go on. */
function nextLabel({ step, isLast, canRetry }: BookingFlow) {
  if (canRetry) return m.common_action_tryAgain()
  if (step === 'contact') return m.booking_action_sendCode()
  return isLast ? m.booking_action_submit() : m.booking_action_next()
}

interface BookingModalProps {
  flow: BookingFlow
  /** Whether the address says this form is open. */
  open: boolean
  onClose: () => void
  returnFocusTo: () => HTMLElement | null
}

/**
 * The pickup form: a few short steps in a card, with a summary beside it on a
 * wide screen. One instance serves every "Book a pickup" button on the site.
 *
 * A visitor who is not signed in gets five steps; the last proves their WhatsApp
 * or email with a code, and the request goes the moment it is accepted. A
 * customer who is signed in gets three, and the request goes from the address.
 *
 * It is one `<form>`, so Enter in a box means "next" and the phone keyboard's
 * Go key works. Each step is checked before the next opens; the last sends the
 * request.
 */
function BookingModal({
  flow,
  open,
  onClose,
  returnFocusTo,
}: BookingModalProps) {
  const { step, steps, stepIndex, isLast, submitted, sending, next, back } =
    flow
  const current = stepText(step, flow)
  const total = steps.length
  const { verification } = flow

  return (
    <ModalFrame
      open={open}
      onClose={onClose}
      returnFocusTo={returnFocusTo}
      onExitComplete={flow.finish}
      label={m.booking_a11y_dialog()}
      display={{ base: 'flex', lg: submitted ? 'flex' : 'grid' }}
      flexDirection="column"
      gridTemplateColumns={{ lg: submitted ? undefined : '1.4fr 1fr' }}
      gridTemplateRows={{ lg: submitted ? undefined : 'minmax(0, 1fr)' }}
      maxW={submitted ? '720px' : { base: 'full', md: '560px', lg: '920px' }}
      // The steps differ in height; a fixed one keeps the card from jumping
      // about as the visitor moves between them or narrows the area list.
      h={submitted ? undefined : { md: 'min(660px, calc(100dvh - 48px))' }}
    >
      {submitted ? (
        <BookingSuccess flow={flow} onClose={onClose} />
      ) : (
        <>
          <ModalForm
            noValidate
            onSubmit={(event) => {
              event.preventDefault()
              const wrong = next()
              if (wrong) focusField(event.currentTarget, wrong)
            }}
          >
            <ModalHeader
              eyebrow={m.booking_stepLabel({
                step: stepIndex + 1,
                total,
              })}
              title={current.title}
              sub={current.sub}
              closeLabel={m.booking_a11y_close()}
            >
              <Progress total={total} step={stepIndex} />
              <AccountNote flow={flow} />
            </ModalHeader>

            {/* Tells a screen reader which step it is now on. */}
            <Text srOnly aria-live="polite">
              {m.booking_a11y_stepAnnounce({
                step: stepIndex + 1,
                total,
                title: current.title,
              })}
            </Text>

            <Dialog.Body
              key={step}
              flex="1"
              minH={0}
              overflowY="auto"
              overscrollBehavior="contain"
              px={modalPadX}
              pt={6}
              pb={4}
            >
              {step === 'service' && <ServiceStep flow={flow} />}
              {step === 'time' && <TimeStep flow={flow} />}
              {step === 'address' && <AddressStep flow={flow} />}
              {step === 'contact' && <ContactStep flow={flow} />}
              {step === 'verify' && <VerifyStep flow={flow} />}

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
                visibility={stepIndex === 0 ? 'hidden' : 'visible'}
                disabled={sending || verification.outcome !== null}
                _hover={{ bg: 'rgba(0, 23, 31, 0.04)' }}
                onClick={back}
              >
                <Icon aria-hidden boxSize={3.5} as={icons.back} />
                {m.booking_action_back()}
              </Button>

              <Flex align="center" gap={3}>
                <Text
                  display={{ base: 'none', sm: 'block' }}
                  fontSize="12.5px"
                  color="site.ink-muted"
                >
                  {isLast ? m.booking_hint_confirm() : m.booking_hint_free()}
                </Text>

                <SiteButton
                  type="submit"
                  px={6}
                  py="13px"
                  fontSize="15px"
                  loading={sending}
                  loadingText={
                    verification.sending
                      ? m.booking_action_sendingCode()
                      : verification.verifying && !verification.finishing
                        ? m.booking_action_checking()
                        : m.booking_action_sending()
                  }
                  boxShadow="0 10px 24px rgba(46, 207, 220, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.35)"
                >
                  {nextLabel(flow)}
                  <Icon aria-hidden boxSize={3.5} as={icons.forward} />
                </SiteButton>
              </Flex>
            </Dialog.Footer>
          </ModalForm>

          <BookingAside flow={flow} />
        </>
      )}
    </ModalFrame>
  )
}

export default BookingModal
