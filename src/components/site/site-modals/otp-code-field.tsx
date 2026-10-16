import { PinInput } from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { CODE_LENGTH } from '#/libs/otp'
import ModalField from './modal-field'
import { m } from '#/paraglide/messages'

interface OtpCodeFieldProps {
  error?: string
  disabled?: boolean
  /**
   * Starts the boxes again, empty and with focus in the first. The boxes keep
   * their own digits while the visitor types; handing them a controlled value
   * made them drop digits, so a new key is how the page clears them.
   */
  resetKey: number
  onChange: (digits: string[]) => void
  onComplete: (digits: string[]) => void
}

/**
 * Six boxes for the code, one digit each.
 *
 * Typing moves on by itself, a pasted code fills them all, and the last digit
 * sends it — so a customer with the code on their phone has nothing else to
 * press. The boxes are marked as a one-time code, so a phone can offer the
 * code it just received.
 */
function OtpCodeField({
  error,
  disabled,
  resetKey,
  onChange,
  onComplete,
}: OtpCodeFieldProps) {
  // Only for the colour of a filled box; the boxes keep the digits themselves.
  const [digits, setDigits] = useState<string[]>([])

  useEffect(() => setDigits([]), [resetKey])

  return (
    <ModalField label={m.auth_code_label()} error={error}>
      <PinInput.Root
        key={resetKey}
        otp
        autoFocus
        type="numeric"
        w="full"
        count={CODE_LENGTH}
        size="lg"
        disabled={disabled}
        invalid={Boolean(error)}
        colorPalette="turquoise-blue"
        onValueChange={(event) => {
          setDigits(event.value)
          onChange(event.value)
        }}
        onValueComplete={(event) => onComplete(event.value)}
      >
        <PinInput.HiddenInput name="code" />
        <PinInput.Control gap={{ base: 2, md: 3 }} w="full">
          {Array.from({ length: CODE_LENGTH }, (_, index) => (
            <PinInput.Input
              key={index}
              index={index}
              // Square: the width follows the row, the height follows the
              // width, up to a size that still looks like a code box.
              flex="1 1 0"
              minW={0}
              maxW="64px"
              h="auto"
              aspectRatio="1 / 1"
              p={0}
              rounded="14px"
              borderWidth="1.5px"
              borderColor={
                digits[index] ? 'turquoise-blue.200' : 'rgba(0, 23, 31, 0.12)'
              }
              bg={digits[index] ? 'turquoise-blue.50' : 'white'}
              color={digits[index] ? 'turquoise-blue.700' : 'site.ink'}
              fontSize="22px"
              fontWeight="semibold"
              textAlign="center"
              aria-label={m.auth_a11y_codeDigit({
                number: index + 1,
                total: CODE_LENGTH,
              })}
              _focus={{
                outline: 'none',
                borderColor: 'turquoise-blue.500',
                boxShadow: '0 0 0 3px rgba(46, 207, 220, 0.15)',
              }}
              _invalid={{ borderColor: 'red.500' }}
            />
          ))}
        </PinInput.Control>
      </PinInput.Root>
    </ModalField>
  )
}

export default OtpCodeField
