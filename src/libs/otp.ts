/** How many digits a code has. The API sends and checks six. */
export const CODE_LENGTH = 6

/**
 * How long before another code can be asked for. The API has no fixed wait
 * between codes (it only slows down after several), so this one stops a
 * visitor sending a second code before the first has arrived.
 */
export const RESEND_WAIT_SECONDS = 60

/** The code boxes with nothing in them. */
export const emptyCode = () => Array.from({ length: CODE_LENGTH }, () => '')
