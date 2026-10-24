import { createFileRoute } from '@tanstack/react-router'
import PagePlaceholder from '#/routes/_site/-components/page-placeholder'
import { m } from '#/paraglide/messages'
import { noIndexHead } from '#/libs/seo'

export const Route = createFileRoute('/_site/services/bedding-and-home')({
  head: noIndexHead,
  component: () => <PagePlaceholder title={m.site_service_bedding_name()} />,
})
