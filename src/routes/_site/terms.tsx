import { createFileRoute } from '@tanstack/react-router'
import { pageHead } from '#/data/seo.data'
import { termsDocument } from '#/data/terms.data'
import { m } from '#/paraglide/messages'
import LegalPage from '#/routes/_site/-components/legal/legal-page'

export const Route = createFileRoute('/_site/terms')({
  head: () =>
    pageHead({
      path: termsDocument.path,
      title: m.terms_meta_title(),
      description: m.terms_meta_description(),
    }),

  component: () => <LegalPage doc={termsDocument} />,
})
