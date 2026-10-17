/**
 * An implementation for a mock that fails when it is called.
 *
 * `mockRejectedValue(error)` makes the rejected promise when it is set up, not
 * when the mock is called, so a test that sets it up and never calls it (or
 * calls it later) is reported as an error nobody handled. This makes it at the
 * call.
 */
export const rejecting = (error: unknown) => () => Promise.reject(error)
