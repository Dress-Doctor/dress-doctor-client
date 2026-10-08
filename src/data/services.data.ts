import type { SiteServiceDto } from '#/interfaces/site.dto'
import { m } from '#/paraglide/messages'

/**
 * What each service suits best, for the comparison table on the services
 * page. Keyed by the id in `siteServices`, so the two lists stay in step.
 */
export const serviceBestFor: Record<SiteServiceDto['id'], () => string> = {
  washFold: m.services_bestFor_washFold,
  perPiece: m.services_bestFor_perPiece,
  dryClean: m.services_bestFor_dryClean,
  ironing: m.services_bestFor_ironing,
  bedding: m.services_bestFor_bedding,
  shoeCare: m.services_bestFor_shoeCare,
}
