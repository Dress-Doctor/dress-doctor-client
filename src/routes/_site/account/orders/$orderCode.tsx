import { createFileRoute } from '@tanstack/react-router'
import { noIndexHead } from '#/libs/seo'
import { m } from '#/paraglide/messages'
import OrderDetailPage from '../../-components/account/order-detail-page'

export const Route = createFileRoute('/_site/account/orders/$orderCode')({
  head: ({ params }) => ({
    meta: [
      { title: m.account_meta_order({ code: params.orderCode }) },
      ...noIndexHead().meta,
    ],
  }),
  component: OrderRoute,
})

function OrderRoute() {
  const { orderCode } = Route.useParams()
  return <OrderDetailPage orderCode={orderCode} />
}
