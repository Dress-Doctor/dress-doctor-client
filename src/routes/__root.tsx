// Self-hosted, so the first paint does not wait on a third party. These two
// variable fonts cover every weight the site uses.
import '@fontsource-variable/figtree/wght.css'
import '@fontsource-variable/jost/wght.css'
import { getLocale } from '#/paraglide/runtime'
import TanStackQueryDevtools from '@/config/query-devtools'
import TanStackRouterDevtools from '@/config/router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'
import type { QueryClient } from '@tanstack/react-query'
import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRouteWithContext,
} from '@tanstack/react-router'
import { Provider as ChakraAppProvider } from '@/components/ui/provider'
import chakraTheme from '@/config/theme'
import { Toaster } from '#/components/ui/toaster'
import AntThemeSwitch from '#/components/ant-theme-switch'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/react'

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()(
  {
    beforeLoad: async () => {
      // Other redirect strategies are possible; see
      // https://github.com/TanStack/router/tree/main/examples/react/i18n-paraglide#offline-redirect
      if (typeof document !== 'undefined')
        document.documentElement.setAttribute('lang', getLocale())
    },

    head: () => ({
      meta: [
        { charSet: 'utf-8' },
        // Site-wide defaults. Pages set their own title, description,
        // canonical and share tags in their route `head`.
        { title: 'Dress Doctor' },
        { name: 'theme-color', content: '#202938' },
        { property: 'og:type', content: 'website' },
        { property: 'og:site_name', content: 'Dress Doctor' },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        // Proves domain ownership to Meta Business Manager.
        {
          name: 'facebook-domain-verification',
          content: 'pbsnftyr8pobkiqv0ug6kka62r6glt',
        },
        // Proves site ownership to Google Search Console.
        {
          name: 'google-site-verification',
          content: 'tMWloQx1nVtHsguWrBB6eVhP2inu3y8QBr8XcWatf_8',
        },
      ],
      links: [
        // PNG icons: the bundled favicon.ico is PNG data, so declaring it as
        // an .ico makes browsers drop it.
        {
          rel: 'icon',
          type: 'image/png',
          sizes: '32x32',
          href: '/favicon-32x32.png',
        },
        {
          rel: 'icon',
          type: 'image/png',
          sizes: '16x16',
          href: '/favicon-16x16.png',
        },
        { rel: 'manifest', href: '/manifest.json' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
      ],
    }),
    shellComponent: RootDocument,
  },
)

function RootDocument() {
  return (
    <html lang={getLocale()} suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <ChakraAppProvider theme={chakraTheme} forcedTheme="light">
          <Toaster />
          <AntThemeSwitch>
            <Outlet />
          </AntThemeSwitch>
        </ChakraAppProvider>
        <TanStackDevtools
          config={{ position: 'bottom-left' }}
          plugins={[TanStackRouterDevtools, TanStackQueryDevtools]}
        />
        <Analytics />
        <SpeedInsights />
        <Scripts />
      </body>
    </html>
  )
}
