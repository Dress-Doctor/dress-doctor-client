import { createFileRoute } from '@tanstack/react-router'
import { privacyDocument } from '#/data/privacy.data'
import { pageHead } from '#/data/seo.data'
import { m } from '#/paraglide/messages'
import LegalPage from '#/routes/_site/-components/legal/legal-page'

export const Route = createFileRoute('/_site/privacy')({
  head: () =>
    pageHead({
      path: privacyDocument.path,
      title: m.privacy_meta_title(),
      description: m.privacy_meta_description(),
    }),

  component: () => <LegalPage doc={privacyDocument} />,
})
