import type {
  KgServiceDto,
  HomeFaqDto,
  HomePieceDto,
  HomePlanDto,
  HomeStatDto,
  HomeStepDto,
  HomeTestimonialDto,
} from '#/interfaces/site.dto'
import { m } from '#/paraglide/messages'

/** The heaviest load the estimator counts up to, in kg. */
export const KG_MAX = 60

/**
 * The per-kilo services. Ironing costs more per kilo but takes a smaller
 * load, so each carries its own minimum.
 */
export const homeKgServices: KgServiceDto[] = [
  { id: 'washFold', rate: 700, min: 5, name: m.home_estimator_washFold },
  { id: 'washIron', rate: 1000, min: 3, name: m.home_estimator_washIron },
]

/** A quarterly subscription is billed at 90% of the monthly price. */
export const QUARTERLY_MULTIPLIER = 0.9

/**
 * What the plan cards, and the plan form that opens over them, show when the
 * address says nothing. Both read these, so the form can never start on a
 * different count or billing than the cards behind it.
 */
export const DEFAULT_PLAN_MODE = 'kg'
export const DEFAULT_PLAN_BILLING = 'monthly'

/**
 * Confirmed business figures. Update these only from real data — they are
 * shown to customers and the rating is also sent as structured data.
 */
export const businessFacts = {
  customersServed: 120,
  googleRating: 5,
  googleReviewCount: 7,
} as const

export const homeStats: HomeStatDto[] = [
  {
    id: 'customers',
    value: businessFacts.customersServed,
    suffix: '+',
    label: m.home_stats_customers,
  },
  {
    id: 'rating',
    value: businessFacts.googleRating,
    suffix: '★',
    label: m.home_stats_rating,
  },
  { id: 'turnaround', text: '24–72h', label: m.home_stats_turnaround },
  { id: 'express', value: 24, suffix: 'h', label: m.home_stats_express },
]

export const homeSteps: HomeStepDto[] = [
  {
    id: 'book',
    index: '01',
    accent: 'turquoise',
    title: m.home_steps_bookTitle,
    body: m.home_steps_bookBody,
  },
  {
    id: 'pickup',
    index: '02',
    accent: 'turquoise',
    title: m.home_steps_pickupTitle,
    body: m.home_steps_pickupBody,
  },
  {
    id: 'treat',
    index: '03',
    accent: 'turquoise',
    title: m.home_steps_treatTitle,
    body: m.home_steps_treatBody,
  },
  {
    id: 'deliver',
    index: '04',
    accent: 'amber',
    title: m.home_steps_deliverTitle,
    body: m.home_steps_deliverBody,
  },
]

/** The five garment types the per-piece estimator counts. */
export const homePieces: HomePieceDto[] = [
  { id: 'shirt', price: 1000, unit: 'each', label: m.home_piece_shirt },
  { id: 'trousers', price: 1200, unit: 'each', label: m.home_piece_trousers },
  { id: 'dress', price: 2000, unit: 'each', label: m.home_piece_dress },
  { id: 'suit', price: 5000, unit: 'set', label: m.home_piece_suit },
  { id: 'bedsheets', price: 2000, unit: 'set', label: m.home_piece_bedsheets },
]

/** What the estimator starts on — a basket of laundry someone would recognise. */
export const homePieceDefaults: Record<string, number> = {
  shirt: 2,
  trousers: 1,
  dress: 0,
  suit: 0,
  bedsheets: 0,
}

export const KG_DEFAULT = 6

/**
 * The three subscriptions.
 *
 * Each carries two feature lists because the plan card is read in one of two
 * modes: counting garments, or counting weight. The KG list leads with the
 * bedsheets and curtains that a weight allowance swallows whole, since that is
 * the difference someone is choosing between.
 */
export const homePlans: HomePlanDto[] = [
  {
    id: 'basic',
    price: 20000,
    featured: false,
    delay: 0,
    name: m.home_plan_basic_name,
    tag: m.home_plan_basic_tag,
    best: m.home_plan_basic_best,
    cta: m.home_plan_basic_cta,
    allowKg: m.home_plan_basic_allowKg,
    allowPieces: m.home_plan_basic_allowPieces,
    featuresPieces: [
      {
        id: 'pickups',
        title: m.home_planFeature_pickups4,
        note: m.home_planFeature_weeklyCadence,
      },
      {
        id: 'washIron',
        title: m.home_planFeature_washIron,
        note: m.home_planFeature_washIronSub,
      },
      {
        id: 'turnaround',
        title: m.home_planFeature_turn72,
        note: m.home_planFeature_turn72Sub,
      },
    ],
    featuresKg: [
      {
        id: 'bedsheets',
        title: m.home_planFeature_bedsheets,
        note: m.home_planFeature_bedsheetsSub,
      },
      {
        id: 'curtains',
        title: m.home_planFeature_curtains,
        note: m.home_planFeature_curtainsSub,
      },
      {
        id: 'pickups',
        title: m.home_planFeature_pickups4,
        note: m.home_planFeature_weeklyCadence,
      },
      {
        id: 'washIron',
        title: m.home_planFeature_washIron,
        note: m.home_planFeature_washIronSub,
      },
      {
        id: 'turnaround',
        title: m.home_planFeature_turn72,
        note: m.home_planFeature_turn72Sub,
      },
    ],
  },
  {
    id: 'standard',
    price: 40000,
    featured: true,
    delay: 90,
    name: m.home_plan_standard_name,
    tag: m.home_plan_standard_tag,
    best: m.home_plan_standard_best,
    cta: m.home_plan_standard_cta,
    allowKg: m.home_plan_standard_allowKg,
    allowPieces: m.home_plan_standard_allowPieces,
    featuresPieces: [
      {
        id: 'pickups',
        title: m.home_planFeature_pickups4,
        note: m.home_planFeature_yourDay,
      },
      {
        id: 'linen',
        title: m.home_planFeature_bedsheets4,
        note: m.home_planFeature_includedMonthly,
      },
      {
        id: 'washIron',
        title: m.home_planFeature_washIron,
        note: m.home_planFeature_washIronSub,
      },
      {
        id: 'turnaround',
        title: m.home_planFeature_turn48,
        note: m.home_planFeature_turn48Sub,
      },
    ],
    featuresKg: [
      {
        id: 'bedsheets',
        title: m.home_planFeature_bedsheets,
        note: m.home_planFeature_bedsheetsSub,
      },
      {
        id: 'curtains',
        title: m.home_planFeature_curtains,
        note: m.home_planFeature_curtainsSub,
      },
      {
        id: 'pickups',
        title: m.home_planFeature_pickups4,
        note: m.home_planFeature_yourDay,
      },
      {
        id: 'washIron',
        title: m.home_planFeature_washIron,
        note: m.home_planFeature_washIronSub,
      },
      {
        id: 'turnaround',
        title: m.home_planFeature_turn48,
        note: m.home_planFeature_turn48Sub,
      },
    ],
  },
  {
    id: 'premium',
    price: 65000,
    featured: false,
    delay: 180,
    name: m.home_plan_premium_name,
    tag: m.home_plan_premium_tag,
    best: m.home_plan_premium_best,
    cta: m.home_plan_premium_cta,
    allowKg: m.home_plan_premium_allowKg,
    allowPieces: m.home_plan_premium_allowPieces,
    featuresPieces: [
      {
        id: 'pickups',
        title: m.home_planFeature_pickups8,
        note: m.home_planFeature_twiceWeekly,
      },
      {
        id: 'linen',
        title: m.home_planFeature_bedsheets8,
        note: m.home_planFeature_includedMonthly,
      },
      {
        id: 'stains',
        title: m.home_planFeature_stainCare,
        note: m.home_planFeature_stainCareSub,
      },
      {
        id: 'priority',
        title: m.home_planFeature_priority,
        note: m.home_planFeature_prioritySub,
      },
    ],
    featuresKg: [
      {
        id: 'bedsheets',
        title: m.home_planFeature_bedsheets,
        note: m.home_planFeature_bedsheetsUnlimitedSub,
      },
      {
        id: 'curtains',
        title: m.home_planFeature_curtains,
        note: m.home_planFeature_curtainsSub,
      },
      {
        id: 'pickups',
        title: m.home_planFeature_pickups8,
        note: m.home_planFeature_twiceWeekly,
      },
      {
        id: 'stains',
        title: m.home_planFeature_stainCare,
        note: m.home_planFeature_stainCareSub,
      },
      {
        id: 'priority',
        title: m.home_planFeature_priority,
        note: m.home_planFeature_prioritySub,
      },
    ],
  },
]

/** The plan the form starts on when the address names none: the recommended one. */
export const DEFAULT_PLAN_ID =
  homePlans.find((plan) => plan.featured)?.id ?? homePlans[0].id

/**
 * Three of Dress Doctor's genuine 5-star Google reviews, word for word. A
 * shortened review is flagged `excerpt` so the card says so. Never edit the
 * wording of a quote.
 */
export const homeTestimonials: HomeTestimonialDto[] = [
  {
    id: 'tafowo-cedric',
    initial: 'T',
    accent: 'turquoise',
    indented: false,
    delay: 0,
    author: 'Tafowo Cedric',
    excerpt: false,
    quote:
      'Exceptional service from Dress Doctor! Their team is incredibly careful with every item, and I love how neatly everything is folded and pressed. Pickup and delivery are super fast, they’ve saved me so much time. In Douala, they’re definitely the best laundry service I’ve used. Highly recommend!',
  },
  {
    id: 'courtney-kulbacki',
    initial: 'C',
    accent: 'amber',
    indented: true,
    delay: 90,
    author: 'Courtney Kulbacki',
    excerpt: true,
    quote:
      'From start to finish, they were so kind, professional, and patient. Our clothes came back beautifully. It was fast and charged by the kg. So much cheaper than the hotel!',
  },
  {
    id: 'jared-mattinson',
    initial: 'J',
    accent: 'charcoal',
    indented: false,
    delay: 180,
    author: 'Jared Mattinson',
    excerpt: false,
    quote:
      'Fantastic service we used while in Douala! Excellent communicators in English and via WhatsApp and performed a true 5 star service. Picked up and delivered to our hotel within the timeline promised for a reasonable price.',
  },
]

/**
 * The questions people in Douala ask before they book. Every answer here is
 * visible on the page and is also sent as FAQ structured data, so only add a
 * question whose answer is true today.
 */
export const homeFaqs: HomeFaqDto[] = [
  {
    id: 'pickup',
    question: m.home_faq_pickup_q,
    answer: m.home_faq_pickup_a,
  },
  {
    id: 'cost',
    question: m.home_faq_cost_q,
    answer: m.home_faq_cost_a,
  },
  {
    id: 'duration',
    question: m.home_faq_duration_q,
    answer: m.home_faq_duration_a,
  },
  {
    id: 'area',
    question: m.home_faq_area_q,
    answer: m.home_faq_area_a,
  },
  {
    id: 'delicates',
    question: m.home_faq_delicates_q,
    answer: m.home_faq_delicates_a,
  },
  {
    id: 'bedding',
    question: m.home_faq_bedding_q,
    answer: m.home_faq_bedding_a,
  },
  {
    id: 'shoes',
    question: m.home_faq_shoes_q,
    answer: m.home_faq_shoes_a,
  },
  {
    id: 'allowance',
    question: m.home_faq_allowance_q,
    answer: m.home_faq_allowance_a,
  },
  {
    id: 'damage',
    question: m.home_faq_damage_q,
    answer: m.home_faq_damage_a,
  },
]
