import { createFileRoute } from '@tanstack/react-router'
import { noIndexHead } from '#/libs/seo'
import { m } from '#/paraglide/messages'
import DetailsPage from '../-components/account/details-page'

export const Route = createFileRoute('/_site/account/')({
  head: () => ({
    meta: [{ title: m.account_meta_details() }, ...noIndexHead().meta],
  }),
  component: DetailsPage,
})
