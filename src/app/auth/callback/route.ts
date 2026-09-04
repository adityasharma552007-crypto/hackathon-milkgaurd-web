import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { cookies } from 'next/headers'

/**
 * GET /auth/callback
 * Authoritative OAuth & Password Recovery callback handler.
 * Exchanges authorization code for Supabase user session, securely binds cookies,
 * auto-provisions profiles, and forwards to destination.
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') ?? '/home'
  const error = requestUrl.searchParams.get('error')
  const errorDescription = requestUrl.searchParams.get('error_description')

  // Check if provider returned an error directly
  if (error) {
    console.error('[OAuth Callback Provider Error]', error, errorDescription)
    return NextResponse.redirect(
      new URL(`/auth/login?error=${encodeURIComponent(errorDescription || error)}`, request.url)
    )
  }

  if (code) {
    const targetUrl = new URL(next, request.url)
    const response = NextResponse.redirect(targetUrl)

    let cookieStore: any = null
    try {
      cookieStore = cookies()
    } catch {
      cookieStore = null
    }

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            const reqVal = request.cookies.get(name)?.value
            if (reqVal !== undefined) return reqVal
            try {
              return cookieStore?.get?.(name)?.value
            } catch {
              return undefined
            }
          },
          set(name: string, value: string, options: CookieOptions) {
            response.cookies.set({ name, value, ...options })
            try {
              cookieStore?.set?.({ name, value, ...options })
            } catch {}
          },
          remove(name: string, options: CookieOptions) {
            response.cookies.set({ name, value: '', ...options, maxAge: 0 })
            try {
              cookieStore?.set?.({ name, value: '', ...options, maxAge: 0 })
            } catch {}
          },
        },
      }
    )

    const { error: exchangeError, data } = await supabase.auth.exchangeCodeForSession(code)

    if (!exchangeError && data?.user) {
      // Clear demo session cookie when real authenticated session is established
      response.cookies.set('mg_demo_session', '', {
        path: '/',
        maxAge: 0,
        expires: new Date(0),
      })

      // Ensure user profile exists in public.profiles
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, profile_complete')
          .eq('id', data.user.id)
          .maybeSingle()

        if (!profile) {
          const userMeta = data.user.user_metadata || {}
          const fullName = userMeta.full_name || 
                           userMeta.name || 
                           data.user.email?.split('@')[0] || 
                           'MilkGuard User'
          await supabase.from('profiles').insert([{
            id: data.user.id,
            email: data.user.email,
            full_name: fullName,
            city: 'Jaipur',
            role: 'consumer',
            profile_complete: true
          }])
        }
      } catch (profileErr) {
        console.warn('[OAuth Callback] Profile sync note:', profileErr)
      }

      // If user came from a password recovery link, direct to reset-password
      if (next.includes('/auth/reset-password')) {
        return response
      }

      return response
    } else {
      console.error('[OAuth Callback] exchangeCodeForSession failed:', exchangeError)
      return NextResponse.redirect(
        new URL(`/auth/login?error=${encodeURIComponent(exchangeError?.message || 'Authentication session exchange failed')}`, request.url)
      )
    }
  }

  // No code parameter present in callback
  return NextResponse.redirect(new URL('/auth/login?error=no_auth_code', request.url))
}
