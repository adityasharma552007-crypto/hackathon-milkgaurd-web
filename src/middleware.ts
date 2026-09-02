import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const { pathname } = request.nextUrl

  // Check demo session cookie first for instant 0ms auth check
  const demoCookie = request.cookies.get('mg_demo_session')?.value
  let user: any = null

  if (demoCookie === 'true') {
    user = {
      id: 'demo-user-123',
      email: 'demo@milkguard.com',
      user_metadata: { full_name: 'Demo User', phone: '9876543210' }
    }
  } else {
    try {
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          global: {
            fetch: (url, options) => {
              const controller = new AbortController()
              const timer = setTimeout(() => controller.abort(), 1000)
              return fetch(url, {
                ...options,
                signal: options?.signal || controller.signal,
              }).finally(() => clearTimeout(timer))
            },
          },
          cookies: {
            get(name: string) {
              return request.cookies.get(name)?.value
            },
            set(name: string, value: string, options: CookieOptions) {
              request.cookies.set({ name, value, ...options })
              response = NextResponse.next({
                request: { headers: request.headers },
              })
              response.cookies.set({ name, value, ...options })
            },
            remove(name: string, options: CookieOptions) {
              request.cookies.set({ name, value: '', ...options })
              response = NextResponse.next({
                request: { headers: request.headers },
              })
              response.cookies.set({ name, value: '', ...options })
            },
          },
        }
      )

      const { data } = await supabase.auth.getUser()
      user = data?.user ?? null
    } catch {
      user = null
    }
  }

  // Public routes — never redirect to login
  const isLandingPage = pathname === '/'
  const isAuthPage = pathname.startsWith('/auth')

  // 1. Landing page — always let through (server component handles logged-in redirect to /home)
  if (isLandingPage) {
    return response
  }

  // 2. Auth pages — if already logged in, go to /home (except profile completion)
  const isProfileCompletion = pathname === '/auth/complete-profile'
  if (isAuthPage && user && !isProfileCompletion) {
    return NextResponse.redirect(new URL('/home', request.url))
  }

  // 3. Protected dashboard routes — redirect to login if not authenticated
  const protectedPaths = ['/home', '/scan', '/chat', '/map', '/history', '/profile', '/learn', '/insights', '/verify', '/hardware']
  const isProtected = protectedPaths.some(path => pathname.startsWith(path))
  if (isProtected && !user) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
