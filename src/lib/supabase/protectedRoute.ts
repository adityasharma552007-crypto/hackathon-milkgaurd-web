/**
 * Protected Route Helper for MilkGuard API Routes
 *
 * Provides rate limiting protection for API endpoints.
 * Usage: Call checkAndLogRateLimit at the start of your API route handler.
 */

import { NextRequest } from 'next/server'
import { headers, cookies } from 'next/headers'
import { createClient } from './server'
import { checkRateLimit, incrementRateLimit } from './rateLimiting'

/**
 * Check rate limit and return appropriate response
 *
 * @param endpoint - The API endpoint being accessed
 * @param req - The Next.js request object
 * @returns Either a 429 Response object or success metadata
 *
 * @example
 * export async function POST(req: NextRequest) {
 *   const rateLimitCheck = await checkAndLogRateLimit('/api/chat', req);
 *
 *   if (!rateLimitCheck.allowed) {
 *     return rateLimitCheck.response; // Returns 429
 *   }
 *
 *   // Continue with normal logic...
 *   return Response.json({
 *     message: 'Success',
 *     remaining: rateLimitCheck.remaining
 *   });
 * }
 */
export async function checkAndLogRateLimit(
  endpoint: string,
  req?: NextRequest | null
): Promise<{
  allowed: true
  remaining: number
  resetIn: number
  limit: number
  response?: never
} | {
  allowed: false
  remaining: 0
  resetIn: number
  limit: number
  response: Response
}> {
  // Get session for authenticated user
  const session = req ? await getSessionFromRequest(req) : await getSessionFromHeaders()
  const userId = session?.user?.id

  // Get IP address from headers
  const ipAddress = req ? getIpAddress(req) : await getIpAddressFromHeaders()

  // Check rate limit
  const result = await checkRateLimit(endpoint, userId, ipAddress)

  if (!result.allowed) {
    // Rate limit exceeded - return 429 response
    const response = new Response(
      JSON.stringify({
        error: 'Rate limit exceeded',
        message: `Too many requests. Try again in ${result.resetIn} seconds.`,
        retryAfter: result.resetIn,
        limit: result.limit,
        remaining: 0
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': result.resetIn.toString(),
          'X-RateLimit-Limit': result.limit.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': new Date(Date.now() + result.resetIn * 1000).toISOString()
        }
      }
    )

    return {
      allowed: false,
      remaining: 0,
      resetIn: result.resetIn,
      limit: result.limit,
      response
    }
  }

  // Log the successful request
  await incrementRateLimit(endpoint, userId, ipAddress)

  return {
    allowed: true,
    remaining: result.remaining,
    resetIn: result.resetIn,
    limit: result.limit
  }
}

/**
 * Extract session from NextRequest object
 */
async function getSessionFromRequest(req: NextRequest) {
  try {
    const supabase = await createClient()

    // Get the auth token from cookies
    const authToken = req.cookies.get('sb-token')?.value

    if (!authToken) {
      return null
    }

    // Verify the session
    const { data: { session }, error } = await supabase.auth.getSession()

    if (error || !session) {
      return null
    }

    return session
  } catch (err) {
    console.error('[ProtectedRoute] Error getting session:', err)
    return null
  }
}

/**
 * Extract session from headers/cookies (for use without NextRequest)
 */
async function getSessionFromHeaders() {
  try {
    const supabase = await createClient()
    const cookieStore = await cookies()

    // Verify the session using Supabase's built-in method
    const { data: { session }, error } = await supabase.auth.getSession()

    if (error || !session) {
      return null
    }

    return session
  } catch (err) {
    console.error('[ProtectedRoute] Error getting session from headers:', err)
    return null
  }
}

/**
 * Extract IP address from NextRequest headers
 */
function getIpAddress(req: NextRequest): string {
  // Check for forwarded headers (common in proxy/load balancer setups)
  const forwarded = req.headers.get('x-forwarded-for')
  if (forwarded) {
    // x-forwarded-for can contain multiple IPs, take the first one
    return forwarded.split(',')[0].trim()
  }

  // Check for CF-Connecting-IP (Cloudflare)
  const cfIp = req.headers.get('cf-connecting-ip')
  if (cfIp) {
    return cfIp
  }

  // Check for X-Real-IP
  const realIp = req.headers.get('x-real-ip')
  if (realIp) {
    return realIp
  }

  // Fallback to unknown
  return 'unknown'
}

/**
 * Extract IP address from headers (for use without NextRequest)
 */
async function getIpAddressFromHeaders(): Promise<string> {
  const headersList = await headers()

  // Check for forwarded headers (common in proxy/load balancer setups)
  const forwarded = headersList.get('x-forwarded-for')
  if (forwarded) {
    // x-forwarded-for can contain multiple IPs, take the first one
    return forwarded.split(',')[0].trim()
  }

  // Check for CF-Connecting-IP (Cloudflare)
  const cfIp = headersList.get('cf-connecting-ip')
  if (cfIp) {
    return cfIp
  }

  // Check for X-Real-IP
  const realIp = headersList.get('x-real-ip')
  if (realIp) {
    return realIp
  }

  // Fallback to unknown
  return 'unknown'
}

/**
 * Get rate limit headers to include in responses
 */
export function getRateLimitHeaders(
  limit: number,
  remaining: number,
  resetIn: number
): Record<string, string> {
  return {
    'X-RateLimit-Limit': limit.toString(),
    'X-RateLimit-Remaining': remaining.toString(),
    'X-RateLimit-Reset': new Date(Date.now() + resetIn * 1000).toISOString()
  }
}

/**
 * Helper to add rate limit headers to a response
 */
export function withRateLimitHeaders(
  response: Response,
  limit: number,
  remaining: number,
  resetIn: number
): Response {
  const headers = getRateLimitHeaders(limit, remaining, resetIn)
  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value)
  })
  return response
}
