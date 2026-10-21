import { ChakraProvider, defaultSystem } from '@chakra-ui/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { cleanup, render, renderHook } from '@testing-library/react'
import type { RenderHookOptions, RenderOptions } from '@testing-library/react'
import { afterEach } from 'vitest'
import type { ReactElement, ReactNode } from 'react'

/**
 * Component and hook tests run in jsdom, chosen per file with
 * `// @vitest-environment jsdom` at the top. The rest of the suite stays on
 * node, which is faster and has nothing to draw.
 *
 * Testing Library only cleans up on its own when the test runner exposes
 * globals, and this one does not, so each file that renders gets it from here.
 */
afterEach(() => cleanup())

/**
 * jsdom has no `ResizeObserver`, and Chakra's dialogs and popovers measure
 * with one. A stub that never reports is enough: nothing here needs a size.
 */
if (typeof globalThis.ResizeObserver === 'undefined') {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
}

/** A client that never retries and never keeps an answer between tests. */
export const testQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: Infinity },
      mutations: { retry: false },
    },
  })

interface WrapperOptions {
  client?: QueryClient
}

function wrapperFor({ client = testQueryClient() }: WrapperOptions) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <ChakraProvider value={defaultSystem}>
        <QueryClientProvider client={client}>{children}</QueryClientProvider>
      </ChakraProvider>
    )
  }
}

/** Draws a component inside Chakra and a query client, and hands back the client. */
export function renderWithProviders(
  ui: ReactElement,
  {
    client = testQueryClient(),
    ...options
  }: WrapperOptions & RenderOptions = {},
) {
  return {
    client,
    ...render(ui, { wrapper: wrapperFor({ client }), ...options }),
  }
}

/** Runs a hook inside a query client, and hands back the client. */
export function renderHookWithClient<TResult, TProps>(
  hook: (props: TProps) => TResult,
  {
    client = testQueryClient(),
    ...options
  }: WrapperOptions & Omit<RenderHookOptions<TProps>, 'wrapper'> = {},
) {
  return {
    client,
    ...renderHook(hook, { wrapper: wrapperFor({ client }), ...options }),
  }
}
