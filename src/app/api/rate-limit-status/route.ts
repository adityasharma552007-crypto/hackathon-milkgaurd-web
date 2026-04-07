/**
 * Rate Limit Status API
 *
 * Returns current rate limit status for a given endpoint.
 * Used by frontend components to display rate limit information to users.
 */

import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getRateLimitStatus } from '@/lib/supabase/rateLimiting'

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const endpoint = searchParams.get('endpoint')

    if (!endpoint) {
      return Response.json(
        { error: 'Missing endpoint parameter' },
        { status: 400 }
      )
    }

    // Validate endpoint format
    if (!endpoint.startsWith('/')) {
      return Response.json(
        { error: 'Invalid endpoint format' },
        { status: 400 }
      )
    }

    // Get session for authenticated user
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()

    // Get rate limit status
    const status = await getRateLimitStatus(endpoint, session?.user?.id)

    if (!status) {
      // No rate limit configured for this endpoint
      // Return a default "unlimited" status
      return Response.json({
        limit: 999,
        remaining: 999,
        resetTime: null,
        resetIn: 0,
        unlimited: true
      })
    }

    return Response.json(status)
  } catch (err) {
    console.error('[RateLimitStatus] Error:', err)
    return Response.json(
      { error: 'Failed to fetch rate limit status' },
      { status: 500 }
    )
  }
}
