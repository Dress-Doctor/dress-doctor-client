import type { IconType } from 'react-icons/lib'
import type { FileRoutesByTo } from '#/routeTree.gen'

/** Which contact details a `contact` block lists. */
export type LegalContactKindDto = 'email' | 'whatsapp' | 'address'

export interface LegalListItemDto {
  /** Bold lead-in, shown before an em dash. Without one, only `text` shows. */
  term?: () => string
  text: () => string
}

export interface LegalDefinitionDto {
  label: () => string
  text: () => string
}

/**
 * One piece of a section's body. A section is a run of these, so adding a
 * list or a callout to a policy is a data change, not a new component.
 *
 * Text may contain `**bold**`; see `withBold` in the section component.
 */
export type LegalBlockDto =
  | { type: 'paragraph'; text: () => string }
  | { type: 'heading'; text: () => string }
  | { type: 'list'; items: LegalListItemDto[] }
  | { type: 'definitions'; rows: LegalDefinitionDto[] }
  | {
      type: 'callout'
      /** `promise` is turquoise and reassures; `warning` is amber. */
      tone: 'promise' | 'warning'
      title: () => string
      text: () => string
    }
  | { type: 'contact'; kinds: LegalContactKindDto[] }
  /** A stand-alone link on its own line, ending in an arrow. */
  | { type: 'link'; to: keyof FileRoutesByTo; label: () => string }

export interface LegalSectionDto {
  /** Doubles as the in-page anchor, so it is a bare id with no `#`. */
  id: string
  title: () => string
  blocks: LegalBlockDto[]
}

/** The document a legal page shows. Terms and privacy are both one of these. */
export interface LegalDocumentDto {
  /** The page's own route; contents links jump within it. */
  path: keyof FileRoutesByTo
  icon: IconType
  /** Last crumb in "Home / Legal / …". */
  breadcrumb: () => string
  title: () => string
  lead: () => string
  /** Day this version took effect, as `YYYY-MM-DD`. */
  effectiveDate: string
  version: string
  highlightsTitle: () => string
  highlights: (() => string)[]
  /** The sibling document, offered at the foot of the page. */
  related: { to: keyof FileRoutesByTo; title: () => string; icon: IconType }
  sections: LegalSectionDto[]
}
