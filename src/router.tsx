import { createRouter as createTanStackRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'
import { deLocalizeUrl, localizeUrl } from '@/paraglide/runtime'
import { setupRouterSsrQueryIntegration } from '@tanstack/react-router-ssr-query'
import getContext from './config/query-client'

export function getRouter() {
  const context = getContext()

  const router = createTanStackRouter({
    routeTree,
    context,
    scrollRestoration: true,
    defaultPreload: 'intent',

    /**
     * Paraglide's `url` strategy puts the locale in the path (`/fr/admin/...`),
     * but the route tree has no locale segment, so those paths would 404.
     *
     * `input` strips the prefix before the router matches, `output` puts it
     * back when a location is written to history. The route tree therefore
     * stays locale-free while the address bar stays localized.
     */
    rewrite: {
      input: ({ url }) => deLocalizeUrl(url),
      output: ({ url }) => localizeUrl(url),
    },
  })

  setupRouterSsrQueryIntegration({
    router,
    wrapQueryClient: true,
    queryClient: context.queryClient,
  })

  return router
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof getRouter>
  }
}
