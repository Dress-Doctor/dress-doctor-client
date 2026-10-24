import type { IconType } from 'react-icons/lib'
import founderImage from '#/assets/imagery/founder.jpg'
import icons from '#/config/icons'
import { siteContact } from '#/data/site.data'
import { m } from '#/paraglide/messages'

export interface AboutServiceDto {
  id: string
  icon: IconType
  title: () => string
  text: () => string
}

export interface AboutStepDto {
  id: string
  title: () => string
  text: () => string
}

export interface AboutPlaceDto {
  id: string
  label: () => string
  address: () => string
}

/** What we do, in the founder's own list. The icons come from the services. */
export const aboutServices: AboutServiceDto[] = [
  {
    id: 'laundry',
    icon: icons.laundry,
    title: m.about_services_laundry_title,
    text: m.about_services_laundry_text,
  },
  {
    id: 'ironing',
    icon: icons.ironing,
    title: m.about_services_ironing_title,
    text: m.about_services_ironing_text,
  },
  {
    id: 'dryClean',
    icon: icons.dryClean,
    title: m.about_services_dryClean_title,
    text: m.about_services_dryClean_text,
  },
  {
    id: 'shoes',
    icon: icons.shoeCare,
    title: m.about_services_shoes_title,
    text: m.about_services_shoes_text,
  },
  {
    id: 'bedding',
    icon: icons.bedding,
    title: m.about_services_bedding_title,
    text: m.about_services_bedding_text,
  },
  {
    id: 'business',
    icon: icons.office,
    title: m.about_services_business_title,
    text: m.about_services_business_text,
  },
]

export const aboutSteps: AboutStepDto[] = [
  {
    id: 'book',
    title: m.about_steps_book_title,
    text: m.about_steps_book_text,
  },
  {
    id: 'collect',
    title: m.about_steps_collect_title,
    text: m.about_steps_collect_text,
  },
  {
    id: 'care',
    title: m.about_steps_care_title,
    text: m.about_steps_care_text,
  },
  {
    id: 'return',
    title: m.about_steps_return_title,
    text: m.about_steps_return_text,
  },
]

/** The factory and the office are two different places. */
export const aboutPlaces: AboutPlaceDto[] = [
  {
    id: 'factory',
    label: m.about_places_factory,
    address: m.about_places_factoryAddress,
  },
  {
    id: 'office',
    label: m.about_places_office,
    address: m.about_places_officeAddress,
  },
]

/** The two numbers on the About page. The first is the one used everywhere else. */
export const aboutPhones = [
  { display: siteContact.phoneDisplay, href: siteContact.phoneHref },
  { display: '+237 654 030 978', href: 'tel:+237654030978' },
] as const

/** The shop's Google Maps listing, as Google gave it for embedding. */
export const aboutMapEmbed =
  'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3979.739575644999!2d9.718382876118921!3d4.073387795900372!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1061137d7f72a947%3A0xc75beec07c65dfeb!2sDress%20Doctor%20Laundry%20Service!5e0!3m2!1sen!2scm!4v1792838603882!5m2!1sen!2scm'

/** The founder, who tells the story on the About page. */
export const aboutFounder = {
  name: 'Fedjio Raymond',
  image: founderImage,
} as const
