import { describe, expect, it } from 'vitest'
import {
  aboutStructuredData,
  breadcrumbData,
  homeStructuredData,
  pageHead,
} from './seo.data'

describe('breadcrumbData', () => {
  it('numbers each step and gives each page its full address', () => {
    const data = breadcrumbData([
      { name: 'Home', path: '/' },
      { name: 'Services', path: '/services' },
    ])

    expect(data['@type']).toBe('BreadcrumbList')
    expect(data.itemListElement).toEqual([
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://www.dressdoctor.io/',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Services',
        item: 'https://www.dressdoctor.io/services',
      },
    ])
  })
})

describe('pageHead', () => {
  const base = { path: '/services', title: 'T', description: 'D' }

  it('adds the trail only when a page asks for one', () => {
    expect(pageHead(base).scripts).toEqual([])
    expect(
      pageHead({ ...base, breadcrumbs: [{ name: 'Home', path: '/' }] }).scripts,
    ).toHaveLength(1)
  })
})

describe('homeStructuredData', () => {
  const business = homeStructuredData()['@graph'].find(
    (node) => node['@type'] === 'DryCleaningOrLaundry',
  ) as Record<string, unknown>

  it('lists Monday to Saturday and leaves Sunday out, which means closed', () => {
    const spec = business.openingHoursSpecification as { dayOfWeek: unknown }[]
    expect(JSON.stringify(spec)).not.toContain('Sunday')
    expect(spec).toHaveLength(1)
  })

  it('gives the shop’s pin and its Google Maps page', () => {
    expect(business.geo).toMatchObject({
      latitude: 4.0733878,
      longitude: 9.7183829,
    })
    expect(business.hasMap).toContain('google.com/maps')
  })
})

describe('aboutStructuredData', () => {
  const graph = aboutStructuredData()['@graph']

  it('describes the page and ties it to the business on the home page', () => {
    const page = graph.find((node) => node['@type'] === 'AboutPage')
    expect(page).toMatchObject({
      url: 'https://www.dressdoctor.io/about',
      about: { '@id': 'https://www.dressdoctor.io/#business' },
    })
  })

  it('lists the factory and the office as two places', () => {
    const business = graph.find(
      (node) => node['@type'] === 'DryCleaningOrLaundry',
    ) as { '@id': string; location: { address: { streetAddress: string } }[] }

    expect(business['@id']).toBe('https://www.dressdoctor.io/#business')
    expect(business.location.map((p) => p.address.streetAddress)).toEqual([
      '105, behind Château Bonaberi',
      'Bépanda Bonabo, directly opposite Génie Militaire',
    ])
  })
})
