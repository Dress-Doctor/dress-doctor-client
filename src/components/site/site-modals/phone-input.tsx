import {
  Box,
  Combobox,
  Icon,
  Input,
  Portal,
  Text,
  useFilter,
  useListCollection,
} from '@chakra-ui/react'
import type { InputProps } from '@chakra-ui/react'
import { useEffect, useRef, useState } from 'react'
import icons from '#/config/icons'
import { DEFAULT_COUNTRY_ISO } from '#/data/countries.data'
import {
  cleanNational,
  countryOptions,
  getCountry,
  groupNational,
  readInternational,
} from '#/libs/phone'
import { m } from '#/paraglide/messages'
import { inputProps } from './modal-field'

/** What a phone box hands back: the country, and the number in it. */
export interface PhoneValueDto {
  /** ISO code, such as `CM`. */
  country: string
  /** The national number, digits grouped: `689 688 248`. */
  number: string
}

interface PhoneInputProps extends Omit<
  InputProps,
  'value' | 'defaultValue' | 'onChange'
> {
  /** ISO code of the country the number is in. */
  country: string
  /** The national number, as it is shown. */
  value: string
  onValueChange: (next: PhoneValueDto) => void
}

/** Room taken by the country part, before the number starts. */
const PICKER_WIDTH = '106px'

/** The ring every box in the forms shows when it has focus. */
const focusRing = {
  bg: 'white',
  borderColor: 'turquoise-blue.500',
  boxShadow: '0 0 0 3px rgba(46, 207, 220, 0.15)',
} as const

/**
 * A phone box with the country in front of it.
 *
 * The country part is a list that narrows as the visitor types, like the area
 * box: `fra` finds France and French Polynesia, `+33` finds France, and the
 * name works in English or French. Closed, it shows only the flag and the
 * calling code so the number has the room; while it is open it grows over the
 * number to leave space for what is typed. Each row reads "flag name (+code)".
 *
 * The number is kept as the national number. A whole number pasted with its
 * country (`+1 202 555 0123`) moves the country to match, and a code or a
 * leading `0` typed in front of the number is dropped, so the visitor does not
 * have to know how it should be written.
 *
 * The list is drawn inside the dialog's own card, over the form and its
 * buttons. Inside the form's scrolling area it would be cut off at the bottom
 * of that area, and outside the dialog it would sit behind it.
 */
function PhoneInput({
  country: iso,
  value,
  onValueChange,
  name,
  placeholder,
  ...props
}: PhoneInputProps) {
  const country = getCountry(iso)

  const options = countryOptions()
  const { contains } = useFilter({ sensitivity: 'base' })
  const { collection, filter, set } = useListCollection({
    initialItems: options,
    filter: contains,
    itemToString: (option) => option.search,
    itemToValue: (option) => option.iso,
  })

  // The names are in the visitor's language, so a change of language is a
  // change of list.
  useEffect(() => {
    set(options)
  }, [options, set])

  const [open, setOpen] = useState(false)
  /** What is being typed in the country part; `null` shows the chosen one. */
  const [query, setQuery] = useState<string | null>(null)
  const list = useRef<HTMLDivElement>(null)
  const control = useRef<HTMLDivElement>(null)
  /** The dialog card the list is drawn in; there is none outside a dialog. */
  const card = useRef<HTMLElement | null>(null)
  const [hasCard, setHasCard] = useState(false)

  useEffect(() => {
    card.current =
      control.current?.closest<HTMLElement>('[role="dialog"]') ?? null
    setHasCard(card.current !== null)
  }, [])

  const label = `${country.flag} +${country.dialCode}`

  /**
   * The list is long, so when it opens the chosen country is brought to the
   * middle of it. Two frames wait for the list to be shown and measured.
   */
  const showChosen = () => {
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

  const changeCountry = (next: string) => {
    onValueChange({
      country: next,
      number: groupNational(cleanNational(value, getCountry(next))),
    })
  }

  const changeNumber = (raw: string, change: InputEvent) => {
    const written = readInternational(raw)
    if (written) {
      onValueChange({
        country: written.country.iso,
        number: groupNational(written.national),
      })
      return
    }

    // A key press is someone typing, and the box stops at the country's
    // longest number. Anything else — a paste, a drop, an autofill — arrives
    // whole and is kept whole, so a wrong number shows as wrong and is not
    // quietly cut short into a different one. A box already over the limit is
    // not cut either: the visitor is correcting it, not typing a new number.
    const keyed =
      change.inputType === 'insertText' && (change.data?.length ?? 0) <= 1
    const had = value.replace(/\D/g, '').length
    const typing = keyed && had <= country.maxLength
    onValueChange({
      country: country.iso,
      number: groupNational(cleanNational(raw, country, typing)),
    })
  }

  return (
    <Combobox.Root
      openOnClick
      width="full"
      collection={collection}
      inputBehavior="autohighlight"
      // Open and nothing typed yet, the box is empty and `label` shows as its
      // placeholder — so the first key typed starts a search, with no text to
      // select over first.
      inputValue={query ?? (open ? '' : label)}
      positioning={{ placement: 'bottom-start', sameWidth: false }}
      onInputValueChange={(event) => {
        // Only what the visitor types is a search. Choosing a row also sets
        // the text, to the row's words, and that must not narrow the list.
        if (event.reason !== 'input-change') return
        setQuery(event.inputValue)
        filter(event.inputValue)
      }}
      onOpenChange={(event) => {
        setOpen(event.open)
        if (event.open) {
          showChosen()
        } else {
          setQuery(null)
          filter('')
        }
      }}
      onSelect={(event) => changeCountry(event.itemValue)}
    >
      <Combobox.Control ref={control} position="relative" w="full">
        <Combobox.Input
          aria-label={m.common_phone_country_label()}
          autoComplete="off"
          spellCheck={false}
          position="absolute"
          zIndex={2}
          top={0}
          bottom={0}
          insetStart={0}
          h="auto"
          w={open ? 'min(100%, 300px)' : PICKER_WIDTH}
          ps="12px"
          pe="24px"
          rounded="14px"
          borderWidth="1.5px"
          borderColor="transparent"
          bg="transparent"
          color="site.ink"
          cursor="pointer"
          fontWeight="semibold"
          // 16px on a phone, so an iPhone does not zoom the page in on focus.
          fontSize={{ base: '16px', md: '14px' }}
          textOverflow="clip"
          _hover={{ borderColor: 'rgba(0, 23, 31, 0.25)', bg: 'white' }}
          _focus={{ ...focusRing, outline: 'none', cursor: 'text' }}
          _focusVisible={{ ...focusRing, outline: 'none', cursor: 'text' }}
          placeholder={label}
          _placeholder={{ color: 'site.ink', opacity: 1 }}
        />

        {!open && (
          <>
            <Icon
              aria-hidden
              as={icons.chevronDown}
              boxSize={3.5}
              position="absolute"
              zIndex={3}
              top="50%"
              transform="translateY(-50%)"
              insetStart={`calc(${PICKER_WIDTH} - 22px)`}
              color="site.ink-muted"
              pointerEvents="none"
            />
            <Box
              aria-hidden
              position="absolute"
              zIndex={3}
              top="10px"
              bottom="10px"
              insetStart={PICKER_WIDTH}
              w="1px"
              bg="rgba(0, 23, 31, 0.12)"
              pointerEvents="none"
            />
          </>
        )}

        <Input
          {...inputProps}
          ps={`calc(${PICKER_WIDTH} + 14px)`}
          name={name}
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          spellCheck={false}
          value={value}
          placeholder={
            country.iso === DEFAULT_COUNTRY_ISO
              ? placeholder
              : m.common_phone_placeholderOther()
          }
          onChange={(event) =>
            changeNumber(event.target.value, event.nativeEvent as InputEvent)
          }
          {...props}
        />
      </Combobox.Control>

      <Portal container={card} disabled={!hasCard}>
        <Combobox.Positioner>
          <Combobox.Content
            ref={list}
            aria-label={m.common_phone_country_label()}
            p={1.5}
            rounded="14px"
            w="min(320px, calc(100vw - 48px))"
            maxH="min(260px, 40dvh)"
            overscrollBehavior="contain"
            bg="white"
            borderWidth="1px"
            borderColor="rgba(0, 23, 31, 0.1)"
            boxShadow="0 8px 20px -8px rgba(20, 26, 36, 0.14), 0 2px 6px rgba(20, 26, 36, 0.05)"
          >
            <Combobox.Empty>
              <Text px={3} py={4} fontSize="13.5px" color="site.ink-muted">
                {m.common_phone_country_empty()}
              </Text>
            </Combobox.Empty>

            {collection.items.map((option) => {
              const chosen = option.iso === country.iso

              return (
                <Combobox.Item
                  key={option.iso}
                  item={option}
                  data-picked={chosen ? '' : undefined}
                  px={3}
                  py={2.5}
                  rounded="10px"
                  fontSize="14px"
                  cursor="pointer"
                  fontWeight={chosen ? 'semibold' : 'normal'}
                  color={chosen ? 'turquoise-blue.800' : 'site.ink'}
                  bg={chosen ? 'turquoise-blue.100' : 'transparent'}
                  _highlighted={{
                    bg: chosen ? 'turquoise-blue.200' : 'rgba(0, 23, 31, 0.05)',
                  }}
                >
                  <Combobox.ItemText>
                    <span aria-hidden>{option.flag}</span> {option.name} (+
                    {option.dialCode})
                  </Combobox.ItemText>
                </Combobox.Item>
              )
            })}
          </Combobox.Content>
        </Combobox.Positioner>
      </Portal>
    </Combobox.Root>
  )
}

export default PhoneInput
