/** Which contact details a `contact` block lists. */
export type PrivacyContactKindDto = 'email' | 'whatsapp' | 'address'

export interface PrivacyListItemDto {
  /** Bold lead-in, shown before an em dash. Without one, only `text` shows. */
  term?: () => string
  text: () => string
}

export interface PrivacyDefinitionDto {
  label: () => string
  text: () => string
}

/**
 * One piece of a section's body. A section is a run of these, so adding a
 * list or a callout to the policy is a data change, not a new component.
 */
export type PrivacyBlockDto =
  | { type: 'paragraph'; text: () => string }
  | { type: 'heading'; text: () => string }
  | { type: 'list'; items: PrivacyListItemDto[] }
  | { type: 'definitions'; rows: PrivacyDefinitionDto[] }
  | {
      type: 'callout'
      /** `promise` is turquoise and reassures; `warning` is amber. */
      tone: 'promise' | 'warning'
      title: () => string
      text: () => string
    }
  | { type: 'contact'; kinds: PrivacyContactKindDto[] }

export interface PrivacySectionDto {
  /** Doubles as the in-page anchor, so it is a bare id with no `#`. */
  id: string
  title: () => string
  blocks: PrivacyBlockDto[]
}
