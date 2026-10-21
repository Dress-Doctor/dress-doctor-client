import { createFileRoute } from '@tanstack/react-router'
import { noIndexHead } from '#/libs/seo'
import { m } from '#/paraglide/messages'
import PlanPage from '../-components/account/plan-page'

export const Route = createFileRoute('/_site/account/subscription')({
  head: () => ({
    meta: [{ title: m.account_meta_subscription() }, ...noIndexHead().meta],
  }),
  component: PlanPage,
})
