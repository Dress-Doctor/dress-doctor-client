import { createFileRoute, notFound } from '@tanstack/react-router'
import NotFound from '#/components/site/not-found'
import { noIndexHead } from '#/libs/seo'

/**
 * Catches every address no page owns. It throws `notFound()` so the answer is
 * a real 404, and it lives under `_site` so the 404 page keeps the header and
 * footer.
 */
export const Route = createFileRoute('/_site/$')({
  head: noIndexHead,
  beforeLoad: () => {
    throw notFound()
  },
  notFoundComponent: NotFound,
})
