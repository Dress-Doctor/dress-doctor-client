import { siteContact } from '#/data/site.data'

/** A `wa.me` link to the shop's number with the message already typed. */
export const whatsappUrl = (message: string) =>
  `${siteContact.whatsappHref}?text=${encodeURIComponent(message)}`
