import { AxiosError } from 'axios'

/** An error as axios builds it when the API answers with a status and a code. */
export function apiError(status: number, code?: string) {
  const error = new AxiosError('Request failed')
  error.response = {
    status,
    statusText: '',
    headers: {},
    config: {} as never,
    data: {
      success: false,
      statusCode: status,
      error: { code },
      message: 'Failed',
      timestamp: '2026-10-17T10:00:00.000Z',
    },
  }
  return error
}
