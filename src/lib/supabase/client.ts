import { createBrowserClient } from '@supabase/ssr'

export const createClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        fetch: (url, options) => {
          const controller = new AbortController()
          const timer = setTimeout(() => controller.abort(), 2500)
          return fetch(url, {
            ...options,
            signal: options?.signal || controller.signal,
          }).finally(() => clearTimeout(timer))
        },
      },
    }
  )
