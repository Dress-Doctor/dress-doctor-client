import {
  Button,
  Highlight,
  HStack,
  Icon,
  Link as ChakraLink,
  Spinner,
  Stack,
  Text,
} from '@chakra-ui/react'
import icons from '#/config/icons'
import { siteContact } from '#/data/site.data'
import type { ContactVerification } from '#/hooks/use-contact-verification'
import type { VerifyTargetDto } from '#/interfaces/signup.dto'
import { formatClock } from '#/libs/countdown'
import type { SignupErrorDto } from '#/libs/signup-errors'
import { whatsappUrl } from '#/libs/whatsapp'
import { m } from '#/paraglide/messages'
import ChannelSwitch from './channel-switch'
import OtpCodeField from './otp-code-field'
import SignupError from './signup-error'

const textButton = {
  type: 'button',
  variant: 'plain',
  h: 'auto',
  p: 0,
  fontSize: '13.5px',
  fontWeight: 'semibold',
  color: 'turquoise-blue.700',
  _hover: { color: 'turquoise-blue.800' },
} as const

interface VerifyContactProps {
  verification: ContactVerification
  /** Where a code can be sent for this visitor, best first. */
  targets: VerifyTargetDto[]
  /** WhatsApp on the phone itself, for a phone that already has an account. */
  phoneTarget: VerifyTargetDto
  /**
   * Why the request that follows the code did not go, if it did not. The code
   * is used up by then, so the screen says the details are confirmed instead
   * of showing the boxes again.
   */
  sendError: SignupErrorDto | null
}

/**
 * Proving a contact, inside a form: the code that was sent, the boxes to type
 * it in, a way to ask again or to use the other contact, and what went wrong
 * in words.
 *
 * The pickup form and the plan form both end with it. It sits in the body of
 * the form, which holds the button that sends — Enter in a box, or the sixth
 * digit, does the same.
 */
function VerifyContact({
  verification,
  targets,
  phoneTarget,
  sendError,
}: VerifyContactProps) {
  const { target, error } = verification
  const confirmed = verification.outcome !== null
  const locked = verification.verifying || confirmed
  // Kept on one line: a number split across two lines is hard to read.
  const shopNumber = siteContact.phoneDisplay.replaceAll(' ', ' ')

  if (confirmed) {
    return (
      <Stack gap={4}>
        <HStack
          role="status"
          gap={2.5}
          fontSize="14px"
          fontWeight="medium"
          color="site.ink"
        >
          <Icon aria-hidden boxSize={4.5} as={icons.check} color="green.600" />
          {sendError
            ? m.auth_verify_confirmed()
            : m.auth_verify_confirmedSending()}
        </HStack>
        <SignupError error={sendError} />
      </Stack>
    )
  }

  /** What the visitor can do about a failure, beyond reading it. */
  const remedy =
    error?.kind === 'numberHasAccount' ? (
      <Button
        {...textButton}
        loading={verification.sending}
        loadingText={m.auth_action_resending()}
        onClick={() => verification.send(phoneTarget)}
      >
        {m.auth_signup_action_codeToPhone({ phone: phoneTarget.masked })}
        <Icon aria-hidden boxSize={3.5} as={icons.forward} />
      </Button>
    ) : error?.kind === 'contactInUse' ? (
      <ChakraLink
        fontSize="13.5px"
        fontWeight="semibold"
        color="turquoise-blue.700"
        target="_blank"
        rel="noopener"
        href={whatsappUrl(m.auth_signup_chatMessage())}
      >
        <Icon aria-hidden boxSize={4} as={icons.whatsappBrand} />
        {m.auth_signup_action_chat()}
      </ChakraLink>
    ) : null

  if (!target) {
    return (
      <Stack gap={4}>
        {verification.sending ? (
          <HStack
            role="status"
            gap={2.5}
            fontSize="14px"
            color="site.ink-muted"
          >
            <Spinner size="sm" color="turquoise-blue.600" />
            {m.auth_verify_sending()}
          </HStack>
        ) : (
          <Button
            {...textButton}
            alignSelf="flex-start"
            onClick={() => verification.send(targets[0])}
          >
            {m.auth_action_resend()}
          </Button>
        )}
        <SignupError error={error}>{remedy}</SignupError>
      </Stack>
    )
  }

  const isEmail = target.channel === 'email'
  const lead = isEmail
    ? m.auth_verify_leadEmail({ contact: target.masked })
    : m.auth_verify_leadWhatsapp({ contact: target.masked })

  return (
    <Stack gap={5}>
      {targets.length > 1 && (
        <ChannelSwitch
          value={target.channel}
          disabled={locked || verification.sending}
          onChange={(channel) => {
            const next = targets.find((option) => option.channel === channel)
            if (next && next.identifier !== target.identifier) {
              verification.send(next)
            }
          }}
        />
      )}

      <Text
        fontSize="14.5px"
        lineHeight="1.6"
        textWrap="pretty"
        color="site.ink-muted"
      >
        <Highlight
          query={target.masked}
          styles={{ fontWeight: 'semibold', color: 'site.ink' }}
        >
          {lead}
        </Highlight>
      </Text>

      <OtpCodeField
        resetKey={verification.codeResetKey}
        disabled={locked}
        error={verification.codeTooShort ? m.auth_code_tooShort() : undefined}
        onChange={verification.changeCode}
        onComplete={verification.submitCode}
      />

      <Stack gap={2}>
        <HStack gap={2} fontSize="13.5px" color="site.ink-muted" wrap="wrap">
          <Text as="span">{m.auth_resend_prompt()}</Text>
          {verification.resendSeconds > 0 ? (
            <HStack
              gap={1.5}
              color="site.ink-subtle"
              fontVariantNumeric="tabular-nums"
            >
              <Icon aria-hidden boxSize={3.5} as={icons.clock} />
              <Text as="span">
                {m.auth_resend_wait({
                  time: formatClock(verification.resendSeconds),
                })}
              </Text>
            </HStack>
          ) : (
            <Button
              {...textButton}
              loading={verification.resending}
              loadingText={m.auth_action_resending()}
              disabled={locked}
              onClick={verification.askAgain}
            >
              {m.auth_action_resend()}
            </Button>
          )}
        </HStack>

        {/* Always in the page, so the words are read out when they arrive. */}
        <Text role="status" fontSize="13px" color="site.ink-muted">
          {verification.resent ? m.auth_resend_sent() : null}
        </Text>

        {verification.expired ? (
          <Text role="alert" fontSize="13px" color="red.600">
            {m.auth_code_expired()}
          </Text>
        ) : null}
      </Stack>

      <SignupError error={error}>{remedy}</SignupError>

      <Text fontSize="12.5px" lineHeight="1.55" color="site.ink-muted">
        {isEmail
          ? m.auth_note_codeEmail()
          : m.auth_note_codeWhatsapp({ phone: shopNumber })}
      </Text>
    </Stack>
  )
}

export default VerifyContact
