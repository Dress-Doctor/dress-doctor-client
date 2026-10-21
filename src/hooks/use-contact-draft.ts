import { useState } from 'react'
import type { ContactDraftDto } from '#/interfaces/contact.dto'
import { emptyContact } from '#/libs/contact'

/**
 * What the visitor has said about themselves — name, phone, WhatsApp, email,
 * their yes to the terms — kept in one place for both forms.
 *
 * The pickup form and the plan form ask for the same details, so a visitor who
 * fills them in on one and opens the other finds them already there. It lives
 * above both forms, in memory only: it is never put in the address, and only a
 * sent request clears it.
 */
export function useContactDraft() {
  const [contact, setContact] = useState<ContactDraftDto>(emptyContact)

  return {
    contact,
    change: (patch: Partial<ContactDraftDto>) =>
      setContact((current) => ({ ...current, ...patch })),
    clear: () => setContact(emptyContact),
  }
}

export type ContactDraft = ReturnType<typeof useContactDraft>
