import type { PublicStatsDto } from '#/interfaces/public.dto'
import APIClient from '#/libs/api-client'

/** Calls the public website may make without a signed-in customer. */
const publicApi = {
  /** The totals shown on the home page. */
  stats: async () => {
    const response = await new APIClient<PublicStatsDto>(
      '/v1/public/stats',
    ).getWithoutId()
    if (!response.data) throw new Error('The stats answer was empty')
    return response.data
  },
}

export default publicApi
