import { Field, Text } from '@chakra-ui/react'
import type { InputProps } from '@chakra-ui/react'
import type { PropsWithChildren } from 'react'
import { m } from '#/paraglide/messages'

/**
 * How every text box in the forms looks: a 14px-round box with a 1.5px edge
 * that turns turquoise, with a soft halo, when it has focus.
 *
 * The text is 16px on a phone. Below that, iPhones zoom the page in when a box
 * gets focus and do not zoom back out.
 */
export const inputProps = {
  h: 'auto',
  px: '14px',
  py: '12px',
  rounded: '14px',
  borderWidth: '1.5px',
  borderColor: 'rgba(0, 23, 31, 0.12)',
  bg: 'white',
  color: 'site.ink',
  fontSize: { base: '16px', md: '15px' },
  _placeholder: { color: 'site.ink-subtle' },
  _hover: { borderColor: 'rgba(0, 23, 31, 0.25)' },
  _focus: {
    outline: 'none',
    borderColor: 'turquoise-blue.500',
    boxShadow: '0 0 0 3px rgba(46, 207, 220, 0.15)',
  },
  _focusVisible: {
    outline: 'none',
    borderColor: 'turquoise-blue.500',
    boxShadow: '0 0 0 3px rgba(46, 207, 220, 0.15)',
  },
  _invalid: { borderColor: 'red.500' },
} satisfies InputProps

interface ModalFieldProps extends PropsWithChildren {
  label: string
  optional?: boolean
  /** A line of help under the box, for a box that needs one. */
  hint?: string
  error?: string
}

/**
 * A label, one control and — when the answer is wrong — a line saying why.
 *
 * Built on Chakra's `Field`, so the label is tied to the box, and the error is
 * read out and marked on the box for a screen reader.
 */
function ModalField({
  label,
  optional,
  hint,
  error,
  children,
}: ModalFieldProps) {
  return (
    <Field.Root invalid={Boolean(error)} gap={1.5}>
      <Field.Label
        fontSize="13px"
        fontWeight="semibold"
        color="site.ink"
        _invalid={{ color: 'site.ink' }}
      >
        {label}
        {optional && (
          <Text as="span" fontWeight="normal" color="site.ink-subtle">
            {' '}
            ({m.common_label_optional().toLowerCase()})
          </Text>
        )}
      </Field.Label>

      {children}

      {hint && (
        <Field.HelperText fontSize="12.5px" color="site.ink-muted">
          {hint}
        </Field.HelperText>
      )}

      <Field.ErrorText fontSize="12.5px" color="red.600">
        {error}
      </Field.ErrorText>
    </Field.Root>
  )
}

export default ModalField
