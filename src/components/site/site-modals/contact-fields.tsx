import {
  HStack,
  Link as ChakraLink,
  Input,
  RadioCard,
  SimpleGrid,
  Stack,
  Text,
} from '@chakra-ui/react'
import { Link } from '@tanstack/react-router'
import { useId } from 'react'
import { Checkbox } from '#/components/ui/checkbox'
import { sitePaths } from '#/data/site.data'
import type {
  ContactDraftDto,
  ContactErrorsDto,
  GenderDto,
} from '#/interfaces/contact.dto'
import { m } from '#/paraglide/messages'
import ChoiceItem, { ChoiceCheck } from './choice-item'
import FieldMessage from './field-message'
import ModalField, { inputProps } from './modal-field'
import PhoneInput from './phone-input'

const legalLink = {
  fontSize: '12.5px',
  fontWeight: 'semibold',
  color: 'turquoise-blue.700',
} as const

/** The values the API accepts for gender, in the order they are shown. */
const genders: { id: GenderDto; label: () => string }[] = [
  { id: 'Male', label: m.common_contact_gender_male },
  { id: 'Female', label: m.common_contact_gender_female },
]

interface ContactFieldsProps {
  contact: ContactDraftDto
  errors: ContactErrorsDto
  onChange: (patch: Partial<ContactDraftDto>) => void
}

/**
 * Who the visitor is: how we reach them, and their yes to the terms.
 *
 * The pickup form and the plan form both show exactly this, so a visitor is
 * asked for the same details whichever button they pressed, and the two can
 * never drift apart. Each form owns the values and the errors; this only draws
 * them.
 *
 * The name and the phone number are what the API needs. The WhatsApp number
 * and the email are things it will also keep, so they are asked for here, but
 * the visitor can go on without them.
 *
 * Either number may be from any country. The WhatsApp one starts on the
 * phone's country, since it is usually the same number.
 */
function ContactFields({ contact, errors, onChange }: ContactFieldsProps) {
  const genderLabelId = useId()
  const whatsappHintId = useId()

  return (
    <Stack gap={4}>
      <SimpleGrid columns={{ base: 1, sm: 2 }} gap={3}>
        <ModalField
          label={m.common_contact_firstName_label()}
          error={
            errors.firstName ? m.common_contact_error_firstName() : undefined
          }
        >
          <Input
            {...inputProps}
            name="firstName"
            autoComplete="given-name"
            spellCheck={false}
            value={contact.firstName}
            placeholder={m.common_contact_firstName_placeholder()}
            onChange={(event) => onChange({ firstName: event.target.value })}
          />
        </ModalField>

        <ModalField
          label={m.common_contact_lastName_label()}
          error={
            errors.lastName ? m.common_contact_error_lastName() : undefined
          }
        >
          <Input
            {...inputProps}
            name="lastName"
            autoComplete="family-name"
            spellCheck={false}
            value={contact.lastName}
            placeholder={m.common_contact_lastName_placeholder()}
            onChange={(event) => onChange({ lastName: event.target.value })}
          />
        </ModalField>
      </SimpleGrid>

      <Stack gap={1.5}>
        <Text
          id={genderLabelId}
          fontSize="13px"
          fontWeight="semibold"
          color="site.ink"
        >
          {m.common_contact_gender_label()}{' '}
          <Text as="span" fontWeight="normal" color="site.ink-muted">
            ({m.common_label_optional().toLowerCase()})
          </Text>
        </Text>

        <RadioCard.Root
          display="grid"
          gridTemplateColumns="repeat(2, 1fr)"
          gap={3}
          name="gender"
          value={contact.gender}
          aria-labelledby={genderLabelId}
          onValueChange={(event) => {
            if (event.value) onChange({ gender: event.value as GenderDto })
          }}
          // The question is optional, so an answer can be taken back: by
          // tapping it again, or with Backspace once it has focus.
          onKeyDown={(event) => {
            if (event.key === 'Backspace' || event.key === 'Delete') {
              onChange({ gender: '' })
            }
          }}
        >
          {genders.map((option) => {
            const selected = contact.gender === option.id

            return (
              <ChoiceItem
                key={option.id}
                value={option.id}
                selected={selected}
                justifyContent="space-between"
                px="14px"
                py="12px"
                onClick={(event) => {
                  if (!selected) return
                  // Stops the label passing the tap on to the radio, which
                  // would pick the same answer again.
                  event.preventDefault()
                  onChange({ gender: '' })
                }}
              >
                <Text fontSize="14.5px" fontWeight="semibold" color="site.ink">
                  {option.label()}
                </Text>
                <ChoiceCheck selected={selected} />
              </ChoiceItem>
            )
          })}
        </RadioCard.Root>
      </Stack>

      {/* One line for the pair, so it sits across both boxes. */}
      <Stack gap={1.5} role="group" aria-describedby={whatsappHintId}>
        <SimpleGrid columns={{ base: 1, sm: 2 }} gap={3}>
          <ModalField
            label={m.common_contact_phone_label()}
            error={errors.phone ? m.common_contact_error_phone() : undefined}
          >
            <PhoneInput
              name="phone"
              country={contact.phoneCountry}
              value={contact.phone}
              placeholder={m.common_contact_phone_placeholder()}
              onValueChange={({ country, number }) =>
                onChange({ phoneCountry: country, phone: number })
              }
            />
          </ModalField>

          <ModalField
            optional
            label={m.common_contact_whatsapp_label()}
            error={
              errors.whatsapp ? m.common_contact_error_whatsapp() : undefined
            }
          >
            <PhoneInput
              name="whatsapp"
              // Not the phone number again: the browser would fill both.
              autoComplete="off"
              // Follows the phone's country until the visitor picks another.
              country={contact.whatsappCountry ?? contact.phoneCountry}
              value={contact.whatsapp}
              placeholder={m.common_contact_phone_placeholder()}
              onValueChange={({ country, number }) =>
                onChange({
                  whatsappCountry:
                    country === contact.phoneCountry ? null : country,
                  whatsapp: number,
                })
              }
            />
          </ModalField>
        </SimpleGrid>

        <Text id={whatsappHintId} fontSize="12.5px" color="site.ink-muted">
          {m.common_contact_whatsapp_hint()}
        </Text>
      </Stack>

      <ModalField
        optional
        label={m.common_contact_email_label()}
        error={errors.email ? m.common_contact_error_email() : undefined}
      >
        <Input
          {...inputProps}
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          autoCapitalize="none"
          spellCheck={false}
          value={contact.email}
          placeholder={m.common_contact_email_placeholder()}
          onChange={(event) => onChange({ email: event.target.value })}
        />
      </ModalField>

      <Stack gap={2}>
        <Checkbox
          alignItems="flex-start"
          gap={2.5}
          w="full"
          px="14px"
          py="12px"
          rounded="14px"
          borderWidth="1.5px"
          cursor="pointer"
          colorPalette="turquoise-blue"
          invalid={Boolean(errors.consent)}
          inputProps={{ name: 'consent' }}
          checked={contact.consent}
          borderColor={
            contact.consent ? 'turquoise-blue.500' : 'rgba(0, 23, 31, 0.12)'
          }
          bg={contact.consent ? 'turquoise-blue.50' : 'white'}
          onCheckedChange={(event) =>
            onChange({ consent: event.checked === true })
          }
        >
          <Stack gap={0.5}>
            <Text fontSize="14px" fontWeight="medium" color="site.ink">
              {m.common_contact_consent_label()}
            </Text>
            <Text fontSize="12.5px" color="site.ink-muted">
              {m.common_contact_consent_note()}
            </Text>
            <HStack gap={3} mt={0.5}>
              {/* New tab, so reading them does not lose what has been typed. */}
              <ChakraLink asChild {...legalLink}>
                <Link to={sitePaths.terms} target="_blank" rel="noopener">
                  {m.common_link_terms()}
                </Link>
              </ChakraLink>
              <ChakraLink asChild {...legalLink}>
                <Link to={sitePaths.privacy} target="_blank" rel="noopener">
                  {m.common_link_privacy()}
                </Link>
              </ChakraLink>
            </HStack>
          </Stack>
        </Checkbox>

        <FieldMessage>
          {errors.consent ? m.common_contact_error_consent() : undefined}
        </FieldMessage>
      </Stack>
    </Stack>
  )
}

export default ContactFields
