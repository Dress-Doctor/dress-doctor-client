import {
  Box,
  Button,
  Heading,
  Highlight,
  HStack,
  Icon,
  Stack,
  Text,
} from '@chakra-ui/react'
import type { FormEvent } from 'react'
import icons from '#/config/icons'
import SiteButton from '#/components/site/site-button'
import ModalForm from '#/components/site/site-modals/modal-form'
import { siteContact } from '#/data/site.data'
import type { useLoginFlow } from '#/hooks/use-login-flow'
import { formatClock } from '#/libs/countdown'
import { m } from '#/paraglide/messages'
import Eyebrow from './eyebrow'
import InfoNote from './info-note'
import LoginError from './login-error'
import OtpCodeField from './otp-code-field'

interface CodeStepProps {
  flow: ReturnType<typeof useLoginFlow>
}

/** Step two: the code that was sent, with a way to ask again or go back. */
function CodeStep({ flow }: CodeStepProps) {
  // Kept on one line: a number split across two lines is hard to read.
  const shopNumber = siteContact.phoneDisplay.replaceAll(' ', '\u00A0')
  const isEmail = flow.channel === 'email'

  const submit = (event: FormEvent) => {
    event.preventDefault()
    flow.submitCode()
  }

  const lead = isEmail
    ? m.auth_code_leadEmail({ contact: flow.maskedContact })
    : m.auth_code_leadWhatsapp({ contact: flow.maskedContact })

  return (
    <ModalForm noValidate gap={6} onSubmit={submit}>
      <HStack justify="space-between" gap={3}>
        <HStack gap={2} fontSize="13px" color="site.ink-muted">
          <Box aria-hidden boxSize={2} rounded="full" bg="turquoise-blue.500" />
          <Text as="span">{m.auth_step_label()}</Text>
        </HStack>

        <Button
          type="button"
          size="sm"
          variant="outline"
          rounded="full"
          fontWeight="semibold"
          color="site.ink"
          borderColor="rgba(0, 23, 31, 0.12)"
          _hover={{ bg: 'rgba(0, 23, 31, 0.045)' }}
          disabled={flow.verifying}
          onClick={flow.changeContact}
        >
          <Icon aria-hidden boxSize={3.5} as={icons.back} />
          {isEmail ? m.auth_action_wrongEmail() : m.auth_action_wrongPhone()}
        </Button>
      </HStack>

      <div>
        <Eyebrow
          icon={isEmail ? icons.email : icons.whatsappBrand}
          tone={isEmail ? 'brand' : 'whatsapp'}
        >
          {isEmail ? m.auth_code_eyebrowEmail() : m.auth_code_eyebrowWhatsapp()}
        </Eyebrow>

        <Heading
          as="h1"
          mt={4}
          fontSize="clamp(34px, 4vw, 46px)"
          fontWeight="semibold"
          lineHeight="1.05"
          letterSpacing="-0.028em"
          textWrap="balance"
          color="site.ink"
        >
          {isEmail ? m.auth_code_titleEmail() : m.auth_code_titleWhatsapp()}
        </Heading>
        <Text
          mt={3}
          fontSize={{ base: 'md', md: 'lg' }}
          lineHeight="1.6"
          textWrap="pretty"
          color="site.ink-muted"
        >
          <Highlight
            query={flow.maskedContact}
            styles={{ fontWeight: 'semibold', color: 'site.ink' }}
          >
            {lead}
          </Highlight>
        </Text>
      </div>

      <OtpCodeField
        resetKey={flow.codeResetKey}
        disabled={flow.verifying}
        error={flow.codeTooShort ? m.auth_code_tooShort() : undefined}
        onChange={flow.changeCode}
        onComplete={flow.submitCode}
      />

      <Stack gap={2}>
        <HStack justify="space-between" gap={4} wrap="wrap">
          <HStack gap={2} fontSize="13.5px" color="site.ink-muted">
            <Text as="span">{m.auth_resend_prompt()}</Text>
            {flow.resendSeconds > 0 ? (
              <HStack
                gap={1.5}
                color="site.ink-subtle"
                fontVariantNumeric="tabular-nums"
              >
                <Icon aria-hidden boxSize={3.5} as={icons.clock} />
                <Text as="span">
                  {m.auth_resend_wait({
                    time: formatClock(flow.resendSeconds),
                  })}
                </Text>
              </HStack>
            ) : (
              <Button
                type="button"
                variant="plain"
                h="auto"
                p={0}
                fontSize="13.5px"
                fontWeight="semibold"
                color="turquoise-blue.700"
                _hover={{ color: 'turquoise-blue.800' }}
                loading={flow.resending}
                loadingText={m.auth_action_resending()}
                disabled={flow.verifying}
                onClick={flow.askAgain}
              >
                {m.auth_action_resend()}
              </Button>
            )}
          </HStack>

          <Button
            type="button"
            variant="plain"
            h="auto"
            p={0}
            fontSize="13.5px"
            fontWeight="semibold"
            color="turquoise-blue.700"
            _hover={{ color: 'turquoise-blue.800' }}
            disabled={flow.verifying}
            onClick={flow.tryOtherChannel}
          >
            {isEmail ? m.auth_action_useWhatsapp() : m.auth_action_useEmail()}
            <Icon aria-hidden boxSize={3.5} as={icons.forward} />
          </Button>
        </HStack>

        {/* Always in the page, so the words are read out when they arrive. */}
        <Text role="status" fontSize="13px" color="site.ink-muted">
          {flow.resent ? m.auth_resend_sent() : null}
        </Text>

        {flow.expired ? (
          <Text fontSize="13px" color="red.600">
            {m.auth_code_expired()}
          </Text>
        ) : null}
      </Stack>

      <LoginError error={flow.error} channel={flow.channel} />

      <SiteButton
        type="submit"
        w="full"
        py="15px"
        fontSize="15px"
        loading={flow.verifying}
        loadingText={
          flow.finishing ? m.auth_action_finishing() : m.auth_action_verifying()
        }
      >
        <Icon aria-hidden boxSize={4} as={icons.check} />
        {m.auth_action_verify()}
        <Icon aria-hidden boxSize={3.5} as={icons.forward} />
      </SiteButton>

      <InfoNote
        icon={isEmail ? icons.email : icons.whatsappBrand}
        tone={isEmail ? 'brand' : 'whatsapp'}
      >
        {isEmail
          ? m.auth_note_codeEmail()
          : m.auth_note_codeWhatsapp({ phone: shopNumber })}
      </InfoNote>
    </ModalForm>
  )
}

export default CodeStep
