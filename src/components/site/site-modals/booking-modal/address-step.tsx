import { Input, Stack, Textarea } from '@chakra-ui/react'
import type { BookingFlow } from '#/hooks/use-booking-flow'
import { m } from '#/paraglide/messages'
import ModalField, { inputProps } from '../modal-field'
import AddressCombobox from './address-combobox'

/** Step 3: where we collect from. */
function AddressStep({ flow }: { flow: BookingFlow }) {
  const { draft, errors, update } = flow

  return (
    <Stack gap={4}>
      <ModalField
        label={m.booking_field_area_label()}
        hint={m.booking_field_area_hint()}
        error={errors.area ? m.booking_error_area() : undefined}
      >
        <AddressCombobox
          value={draft.area}
          onChange={(area) => update({ area })}
        />
      </ModalField>

      <ModalField label={m.booking_field_street_label()} optional>
        <Input
          {...inputProps}
          name="street"
          autoComplete="street-address"
          value={draft.street}
          placeholder={m.booking_field_street_placeholder()}
          onChange={(event) => update({ street: event.target.value })}
        />
      </ModalField>

      <ModalField label={m.booking_field_notes_label()} optional>
        <Textarea
          {...inputProps}
          name="notes"
          autoComplete="off"
          rows={3}
          minH="76px"
          resize="vertical"
          value={draft.notes}
          placeholder={m.booking_field_notes_placeholder()}
          onChange={(event) => update({ notes: event.target.value })}
        />
      </ModalField>
    </Stack>
  )
}

export default AddressStep
