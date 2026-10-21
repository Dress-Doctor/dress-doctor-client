import { chakra } from '@chakra-ui/react'

/**
 * The `<form>` both modals are built inside: a column that fills the card and
 * lets its body scroll while the header and the buttons stay put.
 *
 * Browser checking is off — each step is checked by our own code, so the
 * messages are the shop's words, in the visitor's language.
 */
const ModalForm = chakra('form', {
  base: {
    display: 'flex',
    flexDirection: 'column',
    flex: '1',
    minH: 0,
  },
})

export default ModalForm
