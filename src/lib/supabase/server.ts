import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export const createClient = () => {
  let cookieStore: any = null
  try {
    cookieStore = cookies()
  } catch {
    cookieStore = null
  }

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        fetch: (url, options) => {
          const controller = new AbortController()
          const timer = setTimeout(() => controller.abort(), 10000)
          return fetch(url, {
            ...options,
            signal: options?.signal || controller.signal,
          }).finally(() => clearTimeout(timer))
        },
      },

      cookies: {
        get(name: string) {
          try {
            return cookieStore?.get?.(name)?.value
          } catch {
            return undefined
          }
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore?.set?.({ name, value, ...options })
          } catch {
            // The `set` method was called from a Server Component.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore?.set?.({ name, value: '', ...options })
          } catch {
            // The `remove` method was called from a Server Component.
          }
        },
      },
    }
  )
}
