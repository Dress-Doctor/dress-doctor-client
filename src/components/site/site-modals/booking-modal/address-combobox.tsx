import { Combobox, Text, useFilter, useListCollection } from '@chakra-ui/react'
import { useRef } from 'react'
import { pickupAddresses } from '#/data/booking.data'
import { m } from '#/paraglide/messages'
import { inputProps } from '../modal-field'

interface AddressComboboxProps {
  value: string
  onChange: (value: string) => void
}

/**
 * The area box: a list of the places we know in Douala that narrows as the
 * visitor types, and that also takes any place that is not in it.
 *
 * The text in the box is the answer, whether it was picked or typed —
 * `allowCustomValue` is what stops the box from emptying itself when what was
 * typed matches nothing. `sensitivity: 'base'` makes "cite" find "Cité".
 *
 * The list narrows only while the visitor types. Picking a place puts its name
 * in the box, but that must not narrow the list to that one place — the full
 * list stays, with the picked place coloured, so changing the answer is easy.
 *
 * The list opens inside the form's own scrolling area rather than in a layer
 * of its own, so it cannot end up behind the dialog or outside it.
 */
function AddressCombobox({ value, onChange }: AddressComboboxProps) {
  const { contains } = useFilter({ sensitivity: 'base' })
  const { collection, filter } = useListCollection({
    initialItems: pickupAddresses,
    filter: contains,
    itemToString: (address) => address.label,
    itemToValue: (address) => address.value,
  })

  // The picked place is whichever one the text in the box names, so the colour
  // is right for a picked place and gone as soon as the text is changed.
  const typed = value.trim().toLowerCase()
  const picked = pickupAddresses.find(
    (address) => address.value.trim().toLowerCase() === typed,
  )

  const list = useRef<HTMLDivElement>(null)

  // The list is long, so when it opens the picked place is brought to the
  // middle of it. The list does this itself for the keyboard, but not for a
  // mouse or a finger. Two frames wait for the list to be shown and measured.
  const showPicked = () => {
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        const content = list.current
        const item = content?.querySelector<HTMLElement>('[data-picked]')
        if (!content || !item) return

        const top =
          item.offsetParent === content
            ? item.offsetTop
            : item.offsetTop - content.offsetTop
        content.scrollTop = top - (content.clientHeight - item.offsetHeight) / 2
      }),
    )
  }

  return (
    <Combobox.Root
      openOnClick
      allowCustomValue
      width="full"
      collection={collection}
      inputValue={value}
      positioning={{ placement: 'bottom-start', sameWidth: true }}
      onOpenChange={(event) => {
        if (event.open) showPicked()
      }}
      onInputValueChange={(event) => {
        onChange(event.inputValue)
        filter(event.reason === 'input-change' ? event.inputValue : '')
      }}
    >
      <Combobox.Control>
        <Combobox.Input
          {...inputProps}
          name="area"
          autoComplete="off"
          spellCheck={false}
          placeholder={m.booking_field_area_placeholder()}
        />
      </Combobox.Control>

      <Combobox.Positioner>
        <Combobox.Content
          ref={list}
          aria-label={m.booking_a11y_areaList()}
          p={1.5}
          rounded="14px"
          maxH="min(240px, 40dvh)"
          overscrollBehavior="contain"
          bg="white"
          borderWidth="1px"
          borderColor="rgba(0, 23, 31, 0.1)"
          boxShadow="0 8px 20px -8px rgba(20, 26, 36, 0.14), 0 2px 6px rgba(20, 26, 36, 0.05)"
        >
          <Combobox.Empty>
            <Text px={3} py={4} fontSize="13.5px" color="site.ink-muted">
              {m.booking_field_area_empty()}
            </Text>
          </Combobox.Empty>

          {collection.items.map((address) => {
            const isPicked = address.value === picked?.value

            return (
              <Combobox.Item
                key={address.value}
                item={address}
                data-picked={isPicked ? '' : undefined}
                px={3}
                py={2.5}
                rounded="10px"
                fontSize="14px"
                cursor="pointer"
                fontWeight={isPicked ? 'semibold' : 'normal'}
                color={isPicked ? 'turquoise-blue.800' : 'site.ink'}
                bg={isPicked ? 'turquoise-blue.100' : 'transparent'}
                _highlighted={{
                  bg: isPicked ? 'turquoise-blue.200' : 'rgba(0, 23, 31, 0.05)',
                }}
              >
                <Combobox.ItemText>{address.label}</Combobox.ItemText>
              </Combobox.Item>
            )
          })}
        </Combobox.Content>
      </Combobox.Positioner>
    </Combobox.Root>
  )
}

export default AddressCombobox
