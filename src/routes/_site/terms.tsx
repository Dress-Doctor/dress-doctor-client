import { createFileRoute } from '@tanstack/react-router'
import { pageHead } from '#/data/seo.data'
import { sitePaths } from '#/data/site.data'
import { termsDocument } from '#/data/terms.data'
import { m } from '#/paraglide/messages'
import LegalPage from '#/routes/_site/-components/legal/legal-page'

export const Route = createFileRoute('/_site/terms')({
  head: () =>
    pageHead({
      path: termsDocument.path,
      title: m.terms_meta_title(),
      description: m.terms_meta_description(),
      breadcrumbs: [
        { name: m.legal_breadcrumb_home(), path: sitePaths.home },
        { name: m.terms_breadcrumb_current(), path: termsDocument.path },
      ],
    }),

  component: () => <LegalPage doc={termsDocument} />,
})
