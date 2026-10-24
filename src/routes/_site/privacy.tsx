import { createFileRoute } from '@tanstack/react-router'
import { privacyDocument } from '#/data/privacy.data'
import { pageHead } from '#/data/seo.data'
import { sitePaths } from '#/data/site.data'
import { m } from '#/paraglide/messages'
import LegalPage from '#/routes/_site/-components/legal/legal-page'

export const Route = createFileRoute('/_site/privacy')({
  head: () =>
    pageHead({
      path: privacyDocument.path,
      title: m.privacy_meta_title(),
      description: m.privacy_meta_description(),
      breadcrumbs: [
        { name: m.legal_breadcrumb_home(), path: sitePaths.home },
        { name: m.privacy_breadcrumb_current(), path: privacyDocument.path },
      ],
    }),

  component: () => <LegalPage doc={privacyDocument} />,
})
