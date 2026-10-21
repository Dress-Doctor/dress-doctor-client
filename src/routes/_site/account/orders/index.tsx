import { createFileRoute } from '@tanstack/react-router'
import { noIndexHead } from '#/libs/seo'
import { m } from '#/paraglide/messages'
import OrdersPage from '../../-components/account/orders-page'

export const Route = createFileRoute('/_site/account/orders/')({
  head: () => ({
    meta: [{ title: m.account_meta_orders() }, ...noIndexHead().meta],
  }),
  component: OrdersPage,
})
