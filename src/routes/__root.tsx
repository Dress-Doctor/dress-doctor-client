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
        { title: 'Laundry & Dry Cleaning Service in Douala' },
        { name: 'theme-color', content: '#202938' },
        { property: 'og:type', content: 'website' },
        { name: 'twitter:card', content: 'summary_large_image' },
        {
          property: 'og:site_name',
          content: 'Laundry & Dry Cleaning Service in Douala',
        },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
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
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        // Fonts
        {
          rel: 'preconnect',
          crossOrigin: 'anonymous',
          href: 'https://fonts.gstatic.com',
        },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Figtree:ital,wght@0,300..900;1,300..900&family=Jost:ital,wght@0,100..900;1,100..900&display=swap',
        },
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
        <ChakraAppProvider theme={chakraTheme}>
          <Toaster />
          <AntThemeSwitch>
            <Outlet />
          </AntThemeSwitch>
        </ChakraAppProvider>
        <TanStackDevtools
          config={{ position: 'bottom-left' }}
          plugins={[TanStackRouterDevtools, TanStackQueryDevtools]}
        />
        <Scripts />
      </body>
    </html>
  )
}
