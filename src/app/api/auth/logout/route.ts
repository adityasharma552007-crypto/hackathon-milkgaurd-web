import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'

export async function POST() {
  const cookieStore = cookies()
  const response = NextResponse.json({ success: true })

  // 1. Call Supabase server-side signOut
  try {
    const supabase = createClient()
    await supabase.auth.signOut()
  } catch (err) {
    console.warn('Server supabase signOut warning:', err)
  }

  // 2. Clear demo session cookie
  response.cookies.set('mg_demo_session', '', {
    path: '/',
    maxAge: 0,
    expires: new Date(0),
    sameSite: 'lax',
  })

  // 3. Clear all Supabase auth cookies present on the request
  const allCookies = cookieStore.getAll()
  for (const cookie of allCookies) {
    if (cookie.name.startsWith('sb-') || cookie.name.includes('auth') || cookie.name.includes('session')) {
      response.cookies.set(cookie.name, '', {
        path: '/',
        maxAge: 0,
        expires: new Date(0),
        sameSite: 'lax',
      })
    }
  }

  return response
}

export async function GET() {
  return POST()
}
