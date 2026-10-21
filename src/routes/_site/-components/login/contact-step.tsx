import { Button, Heading, HStack, Icon, Input, Text } from '@chakra-ui/react'
import { useRef } from 'react'
import type { FormEvent } from 'react'
import icons from '#/config/icons'
import SiteButton from '#/components/site/site-button'
import ModalField, {
  inputProps,
} from '#/components/site/site-modals/modal-field'
import ModalForm from '#/components/site/site-modals/modal-form'
import PhoneInput from '#/components/site/site-modals/phone-input'
import { siteContact } from '#/data/site.data'
import type { useLoginFlow } from '#/hooks/use-login-flow'
import { useSiteModals } from '#/hooks/use-site-modals'
import { focusField } from '#/libs/focus-field'
import { m } from '#/paraglide/messages'
import ChannelSwitch from '#/components/site/site-modals/channel-switch'
import Eyebrow from './eyebrow'
import InfoNote from './info-note'
import LoginError from './login-error'

interface ContactStepProps {
  flow: ReturnType<typeof useLoginFlow>
}

/** Step one: how to send the code, and where to. */
function ContactStep({ flow }: ContactStepProps) {
  const form = useRef<HTMLFormElement>(null)
  const { openBooking } = useSiteModals()
  const isEmail = flow.channel === 'email'
  // Kept on one line: a number split across two lines is hard to read.
  const shopNumber = siteContact.phoneDisplay.replaceAll(' ', '\u00A0')

  const submit = (event: FormEvent) => {
    event.preventDefault()
    flow.send()
    // A wrong box takes focus, so a keyboard visitor lands on it.
    if (!flow.contactValid && form.current) {
      focusField(form.current, isEmail ? 'email' : 'phone')
    }
  }

  return (
    <ModalForm ref={form} noValidate gap={6} onSubmit={submit}>
      <div>
        <Eyebrow icon={icons.sparkles}>{m.auth_login_eyebrow()}</Eyebrow>

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
          {m.auth_login_title()}
        </Heading>
        <Text
          mt={3}
          fontSize={{ base: 'md', md: 'lg' }}
          lineHeight="1.6"
          textWrap="pretty"
          color="site.ink-muted"
        >
          {m.auth_login_lead()}
        </Text>
      </div>

      <ChannelSwitch
        value={flow.channel}
        disabled={flow.sending}
        onChange={flow.changeChannel}
      />

      {isEmail ? (
        <ModalField
          label={m.auth_field_email_label()}
          hint={m.auth_field_email_hint()}
          error={
            flow.contactError === 'email' ? m.auth_error_email() : undefined
          }
        >
          <Input
            {...inputProps}
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            autoCapitalize="none"
            spellCheck={false}
            value={flow.email}
            placeholder={m.auth_field_email_placeholder()}
            onChange={(event) => flow.changeEmail(event.target.value)}
          />
        </ModalField>
      ) : (
        <ModalField
          label={m.auth_field_phone_label()}
          hint={m.auth_field_phone_hint()}
          error={
            flow.contactError === 'phone' ? m.auth_error_phone() : undefined
          }
        >
          <PhoneInput
            name="phone"
            country={flow.phoneCountry}
            value={flow.phone}
            placeholder={m.auth_field_phone_placeholder()}
            onValueChange={flow.changePhone}
          />
        </ModalField>
      )}

      <LoginError error={flow.error} channel={flow.channel} />

      <SiteButton
        type="submit"
        w="full"
        py="15px"
        fontSize="15px"
        loading={flow.sending}
        loadingText={m.auth_action_sending()}
      >
        <Icon
          aria-hidden
          boxSize={4.5}
          as={isEmail ? icons.email : icons.whatsappBrand}
        />
        {isEmail
          ? m.auth_action_sendCodeEmail()
          : m.auth_action_sendCodeWhatsapp()}
        <Icon aria-hidden boxSize={3.5} as={icons.forward} />
      </SiteButton>

      <InfoNote
        icon={isEmail ? icons.email : icons.whatsappBrand}
        tone={isEmail ? 'brand' : 'whatsapp'}
      >
        {isEmail
          ? m.auth_note_loginEmail()
          : m.auth_note_loginWhatsapp({ phone: shopNumber })}
      </InfoNote>

      <HStack gap={1} wrap="wrap" fontSize="14px" color="site.ink-muted">
        <Text as="span">{m.auth_newCustomer_text()}</Text>
        <Button
          type="button"
          variant="plain"
          h="auto"
          p={0}
          fontSize="14px"
          fontWeight="semibold"
          color="turquoise-blue.700"
          _hover={{ color: 'turquoise-blue.800' }}
          aria-haspopup="dialog"
          onClick={() => openBooking()}
        >
          {m.site_nav_bookPickup()}
          <Icon aria-hidden boxSize={3.5} as={icons.forward} />
        </Button>
      </HStack>
    </ModalForm>
  )
}

export default ContactStep
