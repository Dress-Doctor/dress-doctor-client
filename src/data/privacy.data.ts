import icons from '#/config/icons'
import { sitePaths } from '#/data/site.data'
import type { LegalDocumentDto, LegalSectionDto } from '#/interfaces/legal.dto'
import { m } from '#/paraglide/messages'

/**
 * The policy, section by section. Each `id` is also the in-page anchor, so
 * renaming one changes a link that visitors may have saved.
 */
const sections: LegalSectionDto[] = [
  {
    id: 'about',
    title: m.privacy_intro_title,
    blocks: [
      { type: 'paragraph', text: m.privacy_intro_p1 },
      { type: 'paragraph', text: m.privacy_intro_p2 },
      {
        type: 'callout',
        tone: 'promise',
        title: m.privacy_intro_promiseTitle,
        text: m.privacy_intro_promiseBody,
      },
    ],
  },
  {
    id: 'what-we-collect',
    title: m.privacy_collect_title,
    blocks: [
      { type: 'paragraph', text: m.privacy_collect_intro },
      { type: 'heading', text: m.privacy_collect_accountHeading },
      {
        type: 'list',
        items: [
          {
            term: m.privacy_collect_nameTerm,
            text: m.privacy_collect_nameText,
          },
          {
            term: m.privacy_collect_phoneTerm,
            text: m.privacy_collect_phoneText,
          },
          {
            term: m.privacy_collect_emailTerm,
            text: m.privacy_collect_emailText,
          },
          {
            term: m.privacy_collect_languageTerm,
            text: m.privacy_collect_languageText,
          },
        ],
      },
      { type: 'heading', text: m.privacy_collect_orderHeading },
      {
        type: 'list',
        items: [
          {
            term: m.privacy_collect_addressTerm,
            text: m.privacy_collect_addressText,
          },
          {
            term: m.privacy_collect_countTerm,
            text: m.privacy_collect_countText,
          },
          {
            term: m.privacy_collect_notesTerm,
            text: m.privacy_collect_notesText,
          },
          {
            term: m.privacy_collect_photosTerm,
            text: m.privacy_collect_photosText,
          },
        ],
      },
      { type: 'heading', text: m.privacy_collect_paymentHeading },
      { type: 'paragraph', text: m.privacy_collect_paymentBody },
      { type: 'heading', text: m.privacy_collect_messagesHeading },
      { type: 'paragraph', text: m.privacy_collect_messagesBody },
    ],
  },
  {
    id: 'how-we-use-it',
    title: m.privacy_use_title,
    blocks: [
      { type: 'paragraph', text: m.privacy_use_intro },
      {
        type: 'definitions',
        rows: [
          {
            label: m.privacy_use_serviceLabel,
            text: m.privacy_use_serviceText,
          },
          { label: m.privacy_use_talkLabel, text: m.privacy_use_talkText },
          {
            label: m.privacy_use_qualityLabel,
            text: m.privacy_use_qualityText,
          },
          {
            label: m.privacy_use_improveLabel,
            text: m.privacy_use_improveText,
          },
          { label: m.privacy_use_lawLabel, text: m.privacy_use_lawText },
        ],
      },
      { type: 'paragraph', text: m.privacy_use_never },
    ],
  },
  {
    id: 'who-sees-it',
    title: m.privacy_share_title,
    blocks: [
      { type: 'paragraph', text: m.privacy_share_intro },
      {
        type: 'list',
        items: [
          {
            term: m.privacy_share_teamTerm,
            text: m.privacy_share_teamText,
          },
          {
            term: m.privacy_share_paymentTerm,
            text: m.privacy_share_paymentText,
          },
          {
            term: m.privacy_share_techTerm,
            text: m.privacy_share_techText,
          },
          {
            term: m.privacy_share_lawTerm,
            text: m.privacy_share_lawText,
          },
        ],
      },
      {
        type: 'callout',
        tone: 'warning',
        title: m.privacy_share_neverTitle,
        text: m.privacy_share_neverBody,
      },
    ],
  },
  {
    id: 'cookies',
    title: m.privacy_cookies_title,
    blocks: [
      { type: 'paragraph', text: m.privacy_cookies_intro },
      { type: 'heading', text: m.privacy_cookies_neededHeading },
      {
        type: 'list',
        items: [
          { text: m.privacy_cookies_neededLanguage },
          { text: m.privacy_cookies_neededSignIn },
        ],
      },
      { type: 'heading', text: m.privacy_cookies_countHeading },
      {
        type: 'list',
        items: [
          { text: m.privacy_cookies_countVisits },
          { text: m.privacy_cookies_countDevice },
        ],
      },
      { type: 'paragraph', text: m.privacy_cookies_outro },
    ],
  },
  {
    id: 'messages',
    title: m.privacy_messages_title,
    blocks: [
      { type: 'paragraph', text: m.privacy_messages_p1 },
      { type: 'paragraph', text: m.privacy_messages_p2 },
      { type: 'paragraph', text: m.privacy_messages_p3 },
    ],
  },
  {
    id: 'how-long-we-keep-it',
    title: m.privacy_keep_title,
    blocks: [
      { type: 'paragraph', text: m.privacy_keep_intro },
      {
        type: 'definitions',
        rows: [
          {
            label: m.privacy_keep_ordersLabel,
            text: m.privacy_keep_ordersText,
          },
          { label: m.privacy_keep_taxLabel, text: m.privacy_keep_taxText },
          {
            label: m.privacy_keep_photosLabel,
            text: m.privacy_keep_photosText,
          },
          { label: m.privacy_keep_callsLabel, text: m.privacy_keep_callsText },
          {
            label: m.privacy_keep_offersLabel,
            text: m.privacy_keep_offersText,
          },
        ],
      },
    ],
  },
  {
    id: 'your-rights',
    title: m.privacy_rights_title,
    blocks: [
      { type: 'paragraph', text: m.privacy_rights_intro },
      {
        type: 'list',
        items: [
          {
            term: m.privacy_rights_seeTerm,
            text: m.privacy_rights_seeText,
          },
          {
            term: m.privacy_rights_correctTerm,
            text: m.privacy_rights_correctText,
          },
          {
            term: m.privacy_rights_deleteTerm,
            text: m.privacy_rights_deleteText,
          },
          {
            term: m.privacy_rights_copyTerm,
            text: m.privacy_rights_copyText,
          },
          {
            term: m.privacy_rights_objectTerm,
            text: m.privacy_rights_objectText,
          },
        ],
      },
      { type: 'paragraph', text: m.privacy_rights_outro },
      { type: 'contact', kinds: ['email', 'whatsapp'] },
    ],
  },
  {
    id: 'staying-safe',
    title: m.privacy_safe_title,
    blocks: [
      { type: 'paragraph', text: m.privacy_safe_intro },
      {
        type: 'list',
        items: [
          { text: m.privacy_safe_https },
          { text: m.privacy_safe_access },
          { text: m.privacy_safe_lock },
          { text: m.privacy_safe_review },
        ],
      },
      { type: 'paragraph', text: m.privacy_safe_outro },
    ],
  },
  {
    id: 'children',
    title: m.privacy_children_title,
    blocks: [{ type: 'paragraph', text: m.privacy_children_body }],
  },
  {
    id: 'changes',
    title: m.privacy_changes_title,
    blocks: [
      { type: 'paragraph', text: m.privacy_changes_intro },
      {
        type: 'list',
        items: [
          { text: m.privacy_changes_date },
          { text: m.privacy_changes_notify },
          { text: m.privacy_changes_archive },
        ],
      },
    ],
  },
  {
    id: 'contact',
    title: m.privacy_contact_title,
    blocks: [
      { type: 'paragraph', text: m.privacy_contact_intro },
      { type: 'contact', kinds: ['email', 'whatsapp', 'address'] },
    ],
  },
]

/** Raise `version` and `effectiveDate` together when the policy changes. */
export const privacyDocument: LegalDocumentDto = {
  path: sitePaths.privacy,
  icon: icons.secure,
  breadcrumb: m.privacy_breadcrumb_current,
  title: m.privacy_hero_title,
  lead: m.privacy_hero_lead,
  effectiveDate: '2026-10-01',
  version: 'v1.0',
  highlightsTitle: m.privacy_tldr_title,
  highlights: [
    m.privacy_tldr_collect,
    m.privacy_tldr_sell,
    m.privacy_tldr_payment,
    m.privacy_tldr_delete,
  ],
  related: {
    to: sitePaths.terms,
    title: m.terms_hero_title,
    icon: icons.document,
  },
  sections,
}
