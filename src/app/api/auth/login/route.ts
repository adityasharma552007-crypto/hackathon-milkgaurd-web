/**
 * POST /api/auth/login
 * Handles user login with rate limiting protection
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkAndLogRateLimit, getRateLimitHeaders } from '@/lib/supabase/protectedRoute'

export async function POST(req: NextRequest) {
  // Check rate limit FIRST
  const rateLimitCheck = await checkAndLogRateLimit('/api/auth/login', req)

  if (!rateLimitCheck.allowed) {
    return rateLimitCheck.response
  }

  const supabase = await createClient()
  const body = await req.json().catch(() => null)

  if (!body?.email || !body?.password) {
    return NextResponse.json(
      { error: 'Email and password are required' },
      {
        status: 400,
        headers: getRateLimitHeaders(rateLimitCheck.limit, rateLimitCheck.remaining, rateLimitCheck.resetIn)
      }
    )
  }

  const { error } = await supabase.auth.signInWithPassword({
    email: body.email,
    password: body.password,
  })

  if (error) {
    return NextResponse.json(
      { error: error.message },
      {
        status: 401,
        headers: getRateLimitHeaders(rateLimitCheck.limit, rateLimitCheck.remaining, rateLimitCheck.resetIn)
      }
    )
  }

  return NextResponse.json(
    {
      success: true,
      remaining: rateLimitCheck.remaining
    },
    {
      headers: getRateLimitHeaders(rateLimitCheck.limit, rateLimitCheck.remaining, rateLimitCheck.resetIn)
    }
  )
}
