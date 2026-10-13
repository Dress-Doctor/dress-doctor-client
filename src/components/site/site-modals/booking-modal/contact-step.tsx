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
import type { BookingFlow } from '#/hooks/use-booking-flow'
import type { BookingGenderDto } from '#/interfaces/booking.dto'
import { m } from '#/paraglide/messages'
import ChoiceItem, { ChoiceCheck } from '../choice-item'
import FieldMessage from '../field-message'
import ModalField, { inputProps } from '../modal-field'
import PhoneInput from '../phone-input'

const legalLink = {
  fontSize: '12.5px',
  fontWeight: 'semibold',
  color: 'turquoise-blue.700',
} as const

/** The values the API accepts for gender, in the order they are shown. */
const genders: { id: BookingGenderDto; label: () => string }[] = [
  { id: 'Male', label: m.booking_gender_male },
  { id: 'Female', label: m.booking_gender_female },
]

/**
 * Step 4: how the driver reaches the visitor, and the visitor's yes.
 *
 * The name and the phone number are what the API needs. The WhatsApp number
 * and the email are things it will also keep, so they are asked for here, but
 * the visitor can go on without them.
 *
 * Either number may be from any country. The WhatsApp one starts on the
 * phone's country, since it is usually the same number.
 */
function ContactStep({ flow }: { flow: BookingFlow }) {
  const { draft, errors, update } = flow
  const genderLabelId = useId()
  const whatsappHintId = useId()

  return (
    <Stack gap={4}>
      <SimpleGrid columns={{ base: 1, sm: 2 }} gap={3}>
        <ModalField
          label={m.booking_field_firstName_label()}
          error={errors.firstName ? m.booking_error_firstName() : undefined}
        >
          <Input
            {...inputProps}
            name="firstName"
            autoComplete="given-name"
            spellCheck={false}
            value={draft.firstName}
            placeholder={m.booking_field_firstName_placeholder()}
            onChange={(event) => update({ firstName: event.target.value })}
          />
        </ModalField>

        <ModalField
          label={m.booking_field_lastName_label()}
          error={errors.lastName ? m.booking_error_lastName() : undefined}
        >
          <Input
            {...inputProps}
            name="lastName"
            autoComplete="family-name"
            spellCheck={false}
            value={draft.lastName}
            placeholder={m.booking_field_lastName_placeholder()}
            onChange={(event) => update({ lastName: event.target.value })}
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
          {m.booking_field_gender_label()}{' '}
          <Text as="span" fontWeight="normal" color="site.ink-muted">
            ({m.common_label_optional().toLowerCase()})
          </Text>
        </Text>

        <RadioCard.Root
          display="grid"
          gridTemplateColumns="repeat(2, 1fr)"
          gap={3}
          name="gender"
          value={draft.gender}
          aria-labelledby={genderLabelId}
          onValueChange={(event) => {
            if (event.value) update({ gender: event.value as BookingGenderDto })
          }}
          // The question is optional, so an answer can be taken back: by
          // tapping it again, or with Backspace once it has focus.
          onKeyDown={(event) => {
            if (event.key === 'Backspace' || event.key === 'Delete') {
              update({ gender: '' })
            }
          }}
        >
          {genders.map((option) => {
            const selected = draft.gender === option.id

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
                  update({ gender: '' })
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
            label={m.booking_field_phone_label()}
            error={errors.phone ? m.booking_error_phone() : undefined}
          >
            <PhoneInput
              name="phone"
              country={draft.phoneCountry}
              value={draft.phone}
              placeholder={m.booking_field_phone_placeholder()}
              onValueChange={({ country, number }) =>
                update({ phoneCountry: country, phone: number })
              }
            />
          </ModalField>

          <ModalField
            optional
            label={m.booking_field_whatsapp_label()}
            error={errors.whatsapp ? m.booking_error_whatsapp() : undefined}
          >
            <PhoneInput
              name="whatsapp"
              // Not the phone number again: the browser would fill both.
              autoComplete="off"
              // Follows the phone's country until the visitor picks another.
              country={draft.whatsappCountry ?? draft.phoneCountry}
              value={draft.whatsapp}
              placeholder={m.booking_field_phone_placeholder()}
              onValueChange={({ country, number }) =>
                update({
                  whatsappCountry:
                    country === draft.phoneCountry ? null : country,
                  whatsapp: number,
                })
              }
            />
          </ModalField>
        </SimpleGrid>

        <Text id={whatsappHintId} fontSize="12.5px" color="site.ink-muted">
          {m.booking_field_whatsapp_hint()}
        </Text>
      </Stack>

      <ModalField
        optional
        label={m.booking_field_email_label()}
        error={errors.email ? m.booking_error_email() : undefined}
      >
        <Input
          {...inputProps}
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          autoCapitalize="none"
          spellCheck={false}
          value={draft.email}
          placeholder={m.booking_field_email_placeholder()}
          onChange={(event) => update({ email: event.target.value })}
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
          checked={draft.consent}
          borderColor={
            draft.consent ? 'turquoise-blue.500' : 'rgba(0, 23, 31, 0.12)'
          }
          bg={draft.consent ? 'turquoise-blue.50' : 'white'}
          onCheckedChange={(event) =>
            update({ consent: event.checked === true })
          }
        >
          <Stack gap={0.5}>
            <Text fontSize="14px" fontWeight="medium" color="site.ink">
              {m.booking_consent_label()}
            </Text>
            <Text fontSize="12.5px" color="site.ink-muted">
              {m.booking_consent_note()}
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
          {errors.consent ? m.booking_error_consent() : undefined}
        </FieldMessage>
      </Stack>
    </Stack>
  )
}

export default ContactStep
