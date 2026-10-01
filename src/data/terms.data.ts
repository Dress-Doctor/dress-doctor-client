import icons from '#/config/icons'
import { sitePaths } from '#/data/site.data'
import type { LegalDocumentDto, LegalSectionDto } from '#/interfaces/legal.dto'
import { m } from '#/paraglide/messages'

/**
 * The terms, section by section. Each `id` is also the in-page anchor, so
 * renaming one changes a link that visitors may have saved.
 */
const sections: LegalSectionDto[] = [
  {
    id: 'about',
    title: m.terms_agree_title,
    blocks: [
      { type: 'paragraph', text: m.terms_agree_p1 },
      { type: 'paragraph', text: m.terms_agree_p2 },
      {
        type: 'callout',
        tone: 'promise',
        title: m.terms_agree_promiseTitle,
        text: m.terms_agree_promiseBody,
      },
    ],
  },
  {
    id: 'our-services',
    title: m.terms_services_title,
    blocks: [
      { type: 'paragraph', text: m.terms_services_intro },
      {
        type: 'list',
        items: [
          {
            term: m.terms_services_kgTerm,
            text: m.terms_services_kgText,
          },
          {
            term: m.terms_services_pieceTerm,
            text: m.terms_services_pieceText,
          },
          {
            term: m.terms_services_careTerm,
            text: m.terms_services_careText,
          },
          {
            term: m.terms_services_plansTerm,
            text: m.terms_services_plansText,
          },
        ],
      },
      { type: 'paragraph', text: m.terms_services_turnaround },
      { type: 'paragraph', text: m.terms_services_pricesNote },
      {
        type: 'link',
        to: sitePaths.pricing,
        label: m.terms_services_pricesLink,
      },
    ],
  },
  {
    id: 'booking',
    title: m.terms_booking_title,
    blocks: [
      { type: 'heading', text: m.terms_booking_howHeading },
      { type: 'paragraph', text: m.terms_booking_howBody },
      { type: 'heading', text: m.terms_booking_timesHeading },
      { type: 'paragraph', text: m.terms_booking_timesBody },
      { type: 'heading', text: m.terms_booking_cancelHeading },
      {
        type: 'list',
        items: [
          {
            term: m.terms_booking_cancelBeforeTerm,
            text: m.terms_booking_cancelBeforeText,
          },
          {
            term: m.terms_booking_cancelOnWayTerm,
            text: m.terms_booking_cancelOnWayText,
          },
          {
            term: m.terms_booking_cancelNobodyTerm,
            text: m.terms_booking_cancelNobodyText,
          },
        ],
      },
    ],
  },
  {
    id: 'prices-and-payment',
    title: m.terms_price_title,
    blocks: [
      { type: 'paragraph', text: m.terms_price_intro },
      { type: 'heading', text: m.terms_price_whenHeading },
      {
        type: 'list',
        items: [
          {
            term: m.terms_price_orderTerm,
            text: m.terms_price_orderText,
          },
          {
            term: m.terms_price_planTerm,
            text: m.terms_price_planText,
          },
        ],
      },
      { type: 'heading', text: m.terms_price_methodsHeading },
      {
        type: 'list',
        items: [
          { text: m.terms_price_momo },
          { text: m.terms_price_orange },
          { text: m.terms_price_ecobank },
          { text: m.terms_price_cash },
        ],
      },
      { type: 'heading', text: m.terms_price_overHeading },
      { type: 'paragraph', text: m.terms_price_overBody },
      { type: 'heading', text: m.terms_price_lateHeading },
      { type: 'paragraph', text: m.terms_price_lateBody },
    ],
  },
  {
    id: 'care',
    title: m.terms_care_title,
    blocks: [
      { type: 'paragraph', text: m.terms_care_p1 },
      { type: 'paragraph', text: m.terms_care_p2 },
      { type: 'heading', text: m.terms_care_extraHeading },
      {
        type: 'list',
        items: [
          { text: m.terms_care_wedding },
          { text: m.terms_care_suits },
          { text: m.terms_care_silk },
          { text: m.terms_care_uniforms },
        ],
      },
    ],
  },
  {
    id: 'lost-or-damaged',
    title: m.terms_loss_title,
    blocks: [
      { type: 'paragraph', text: m.terms_loss_intro },
      { type: 'heading', text: m.terms_loss_coverHeading },
      {
        type: 'list',
        items: [
          {
            term: m.terms_loss_recleanTerm,
            text: m.terms_loss_recleanText,
          },
          {
            term: m.terms_loss_damageTerm,
            text: m.terms_loss_damageText,
          },
          {
            term: m.terms_loss_lostTerm,
            text: m.terms_loss_lostText,
          },
        ],
      },
      { type: 'heading', text: m.terms_loss_notHeading },
      {
        type: 'list',
        items: [
          { text: m.terms_loss_existing },
          { text: m.terms_loss_fault },
          { text: m.terms_loss_dryClean },
          { text: m.terms_loss_uncollected },
        ],
      },
      {
        type: 'callout',
        tone: 'warning',
        title: m.terms_loss_reportTitle,
        text: m.terms_loss_reportBody,
      },
    ],
  },
  {
    id: 'items-we-cannot-take',
    title: m.terms_refuse_title,
    blocks: [
      { type: 'paragraph', text: m.terms_refuse_intro },
      {
        type: 'list',
        items: [
          { text: m.terms_refuse_fluids },
          { text: m.terms_refuse_heavy },
        ],
      },
    ],
  },
  {
    id: 'what-we-ask',
    title: m.terms_you_title,
    blocks: [
      { type: 'paragraph', text: m.terms_you_intro },
      {
        type: 'list',
        items: [
          {
            term: m.terms_you_pocketsTerm,
            text: m.terms_you_pocketsText,
          },
          {
            term: m.terms_you_delicateTerm,
            text: m.terms_you_delicateText,
          },
          {
            term: m.terms_you_stainsTerm,
            text: m.terms_you_stainsText,
          },
          {
            term: m.terms_you_checkTerm,
            text: m.terms_you_checkText,
          },
          {
            term: m.terms_you_contactTerm,
            text: m.terms_you_contactText,
          },
        ],
      },
    ],
  },
  {
    id: 'monthly-plans',
    title: m.terms_plans_title,
    blocks: [
      { type: 'heading', text: m.terms_plans_amountHeading },
      { type: 'paragraph', text: m.terms_plans_amountBody },
      { type: 'heading', text: m.terms_plans_pauseHeading },
      {
        type: 'list',
        items: [
          { text: m.terms_plans_cancel },
          { text: m.terms_plans_midMonth },
          { text: m.terms_plans_pause },
        ],
      },
      { type: 'heading', text: m.terms_plans_changeHeading },
      { type: 'paragraph', text: m.terms_plans_changeBody },
    ],
  },
  {
    id: 'outside-our-control',
    title: m.terms_outside_title,
    blocks: [{ type: 'paragraph', text: m.terms_outside_body }],
  },
  {
    id: 'law-and-problems',
    title: m.terms_law_title,
    blocks: [
      { type: 'paragraph', text: m.terms_law_p1 },
      { type: 'paragraph', text: m.terms_law_p2 },
    ],
  },
  {
    id: 'changes',
    title: m.terms_changes_title,
    blocks: [
      { type: 'paragraph', text: m.terms_changes_p1 },
      { type: 'paragraph', text: m.terms_changes_p2 },
    ],
  },
  {
    id: 'contact',
    title: m.terms_contact_title,
    blocks: [
      { type: 'paragraph', text: m.terms_contact_intro },
      { type: 'contact', kinds: ['email', 'whatsapp', 'address'] },
    ],
  },
]

/** Raise `version` and `effectiveDate` together when the terms change. */
export const termsDocument: LegalDocumentDto = {
  path: sitePaths.terms,
  icon: icons.document,
  breadcrumb: m.terms_breadcrumb_current,
  title: m.terms_hero_title,
  lead: m.terms_hero_lead,
  effectiveDate: '2026-10-01',
  version: 'v1.0',
  highlightsTitle: m.terms_tldr_title,
  highlights: [
    m.terms_tldr_pickup,
    m.terms_tldr_cancel,
    m.terms_tldr_damage,
    m.terms_tldr_plans,
  ],
  related: {
    to: sitePaths.privacy,
    title: m.privacy_hero_title,
    icon: icons.secure,
  },
  sections,
}
