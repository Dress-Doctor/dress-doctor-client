import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'
import { paraglideVitePlugin } from '@inlang/paraglide-js'

import { tanstackStart } from '@tanstack/react-start/plugin/vite'

import viteReact, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import { nitro } from 'nitro/vite'

/** Old addresses Google still knows, and the pages that replace them. */
const movedPages = {
  '/privacy-policy': '/privacy',
  '/terms-and-conditions': '/terms',
}

/** A permanent redirect for each moved page, in both languages. */
const redirectRules = Object.fromEntries(
  Object.entries(movedPages).flatMap(([from, to]) =>
    ['', '/fr'].map((prefix) => [
      prefix + from,
      { redirect: { to: prefix + to, status: 301 as const } },
    ]),
  ),
)

const config = defineConfig({
  resolve: { tsconfigPaths: true, dedupe: ['react', 'react-dom'] },
  optimizeDeps: { include: ['recharts', '@chakra-ui/charts'] },
  plugins: [
    devtools(),
    paraglideVitePlugin({
      project: './project.inlang',
      outdir: './src/paraglide',
      strategy: ['url', 'baseLocale'],
    }),
    nitro({ routeRules: redirectRules }),
    // Full SSR, not SPA mode: this is the public website, and search engines
    // and link previews need the page content and head tags in the HTML.
    tanstackStart(),
    viteReact(),
    babel({ presets: [reactCompilerPreset()] }),
  ],
})

export default config
