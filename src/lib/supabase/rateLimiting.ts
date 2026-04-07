/**
 * Supabase-based Rate Limiting Utility
 *
 * Provides rate limiting functionality using Supabase as the backend store.
 * All rate limit checks happen via database queries (no middleware).
 */

import { createClient } from './server'

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetIn: number
  limit: number
}

export interface RateLimitStatus {
  limit: number
  remaining: number
  resetTime: string
  resetIn: number
}

// Rate limit configuration cache (reduces DB queries)
let configCache: Map<string, { limit: number; windowMinutes: number }> | null = null
let cacheExpiry: Date | null = null

/**
 * Get rate limit configuration for an endpoint
 * Uses a 5-minute cache to reduce database queries
 */
async function getRateLimitConfig(endpoint: string): Promise<{ limit: number; windowMinutes: number } | null> {
  const now = new Date()

  // Check cache first (5 minute TTL)
  if (configCache && cacheExpiry && now < cacheExpiry) {
    const cached = configCache.get(endpoint)
    if (cached) return cached
  }

  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('rate_limit_config')
      .select('limit_count, window_minutes')
      .eq('endpoint', endpoint)
      .single()

    if (error || !data) {
      console.warn(`[RateLimit] No config found for endpoint: ${endpoint}`, error?.message)
      return null
    }

    // Initialize cache if needed
    if (!configCache) {
      configCache = new Map()
    }
    cacheExpiry = new Date(now.getTime() + 5 * 60 * 1000) // 5 minutes

    const config = {
      limit: data.limit_count,
      windowMinutes: data.window_minutes
    }
    configCache.set(endpoint, config)
    return config
  } catch (err) {
    console.error('[RateLimit] Failed to fetch config:', err)
    // Fail open - return null to allow request through
    return null
  }
}

/**
 * Check rate limit for a given endpoint and user/IP
 *
 * @param endpoint - The API endpoint being accessed (e.g., '/api/chat')
 * @param userId - The authenticated user's ID (optional for unauthenticated requests)
 * @param ipAddress - The client's IP address (for unauthenticated rate limiting)
 * @returns RateLimitResult with allowed status and metadata
 */
export async function checkRateLimit(
  endpoint: string,
  userId?: string,
  ipAddress?: string
): Promise<RateLimitResult> {
  const config = await getRateLimitConfig(endpoint)

  // If no config exists, allow the request (fail open)
  if (!config) {
    return {
      allowed: true,
      remaining: 999,
      resetIn: 0,
      limit: 999
    }
  }

  try {
    const supabase = await createClient()
    const now = new Date().toISOString()

    // Build the query to find existing rate limit record
    let query = supabase
      .from('rate_limits')
      .select('id, request_count, reset_time')
      .eq('endpoint', endpoint)
      .gt('reset_time', now) // Only consider non-expired records
      .order('reset_time', { ascending: false })
      .limit(1)

    // Filter by user_id or ip_address
    if (userId) {
      query = query.eq('user_id', userId)
    } else if (ipAddress) {
      query = query.eq('ip_address', ipAddress)
    } else {
      // No identifier, allow the request
      return {
        allowed: true,
        remaining: config.limit - 1,
        resetIn: config.windowMinutes * 60,
        limit: config.limit
      }
    }

    const { data: existing, error: fetchError } = await query.single()

    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = no rows
      console.error('[RateLimit] Error fetching rate limit:', fetchError)
      // Fail open on error
      return {
        allowed: true,
        remaining: config.limit - 1,
        resetIn: config.windowMinutes * 60,
        limit: config.limit
      }
    }

    if (!existing) {
      // No existing record - create one and allow
      const resetTime = new Date(Date.now() + config.windowMinutes * 60 * 1000)

      const { error: insertError } = await supabase
        .from('rate_limits')
        .insert({
          user_id: userId || null,
          endpoint,
          request_count: 1,
          reset_time: resetTime.toISOString(),
          ip_address: ipAddress || null
        })

      if (insertError) {
        console.error('[RateLimit] Error creating rate limit record:', insertError)
        // Still allow the request even if logging fails
      }

      return {
        allowed: true,
        remaining: config.limit - 1,
        resetIn: config.windowMinutes * 60,
        limit: config.limit
      }
    }

    // Existing record found - check if limit exceeded
    const resetTime = new Date(existing.reset_time)
    const resetIn = Math.max(0, Math.floor((resetTime.getTime() - Date.now()) / 1000))

    if (existing.request_count >= config.limit) {
      // Rate limit exceeded
      return {
        allowed: false,
        remaining: 0,
        resetIn,
        limit: config.limit
      }
    }

    // Increment counter
    const { error: updateError } = await supabase
      .from('rate_limits')
      .update({
        request_count: existing.request_count + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', existing.id)

    if (updateError) {
      console.error('[RateLimit] Error updating rate limit:', updateError)
    }

    return {
      allowed: true,
      remaining: config.limit - existing.request_count - 1,
      resetIn,
      limit: config.limit
    }
  } catch (err) {
    console.error('[RateLimit] Unexpected error:', err)
    // Fail open on unexpected errors
    return {
      allowed: true,
      remaining: config.limit - 1,
      resetIn: config.windowMinutes * 60,
      limit: config.limit
    }
  }
}

/**
 * Increment rate limit counter for a given endpoint
 * Used to log successful requests after they've been processed
 *
 * @param endpoint - The API endpoint
 * @param userId - The user's ID (optional)
 * @param ipAddress - The client's IP address (optional)
 * @returns Remaining requests or null if record not found
 */
export async function incrementRateLimit(
  endpoint: string,
  userId?: string,
  ipAddress?: string
): Promise<number | null> {
  try {
    const supabase = await createClient()
    const now = new Date().toISOString()

    let query = supabase
      .from('rate_limits')
      .select('id, request_count')
      .eq('endpoint', endpoint)
      .gt('reset_time', now)
      .order('reset_time', { ascending: false })
      .limit(1)

    if (userId) {
      query = query.eq('user_id', userId)
    } else if (ipAddress) {
      query = query.eq('ip_address', ipAddress)
    }

    const { data: existing } = await query.single()

    if (!existing) {
      return null
    }

    const { error } = await supabase
      .from('rate_limits')
      .update({
        request_count: existing.request_count + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', existing.id)

    if (error) {
      console.error('[RateLimit] Error incrementing counter:', error)
      return null
    }

    const config = await getRateLimitConfig(endpoint)
    return config ? config.limit - existing.request_count - 1 : 999
  } catch (err) {
    console.error('[RateLimit] Error in incrementRateLimit:', err)
    return null
  }
}

/**
 * Get current rate limit status for a user/endpoint
 *
 * @param endpoint - The API endpoint
 * @param userId - The user's ID
 * @returns RateLimitStatus with current limit information
 */
export async function getRateLimitStatus(
  endpoint: string,
  userId?: string
): Promise<RateLimitStatus | null> {
  try {
    const config = await getRateLimitConfig(endpoint)
    if (!config) {
      return null
    }

    const supabase = await createClient()
    const now = new Date().toISOString()

    let query = supabase
      .from('rate_limits')
      .select('request_count, reset_time')
      .eq('endpoint', endpoint)
      .gt('reset_time', now)
      .order('reset_time', { ascending: false })
      .limit(1)

    if (userId) {
      query = query.eq('user_id', userId)
    }

    const { data: existing } = await query.single()

    if (!existing) {
      // No active limit record - user has full quota
      return {
        limit: config.limit,
        remaining: config.limit,
        resetTime: new Date(Date.now() + config.windowMinutes * 60 * 1000).toISOString(),
        resetIn: config.windowMinutes * 60
      }
    }

    const resetTime = new Date(existing.reset_time)
    const resetIn = Math.max(0, Math.floor((resetTime.getTime() - Date.now()) / 1000))

    return {
      limit: config.limit,
      remaining: Math.max(0, config.limit - existing.request_count),
      resetTime: existing.reset_time,
      resetIn
    }
  } catch (err) {
    console.error('[RateLimit] Error getting status:', err)
    return null
  }
}

/**
 * Manually clear rate limit for a user (admin function)
 *
 * @param userId - The user's ID to clear limits for
 * @param endpoint - Optional specific endpoint to clear (clears all if not provided)
 * @returns Number of records cleared
 */
export async function clearRateLimit(
  userId: string,
  endpoint?: string
): Promise<number> {
  try {
    const supabase = await createClient()

    let query = supabase
      .from('rate_limits')
      .delete()
      .eq('user_id', userId)

    if (endpoint) {
      query = query.eq('endpoint', endpoint)
    }

    const { count, error } = await query

    if (error) {
      console.error('[RateLimit] Error clearing rate limit:', error)
      return 0
    }

    return count || 0
  } catch (err) {
    console.error('[RateLimit] Error in clearRateLimit:', err)
    return 0
  }
}

/**
 * Clean up expired rate limit records
 * Should be called periodically (e.g., via cron job)
 *
 * @param olderThanHours - Delete records older than this many hours (default: 24)
 * @returns Number of records deleted
 */
export async function cleanupExpiredRateLimits(
  olderThanHours: number = 24
): Promise<number> {
  try {
    const supabase = await createClient()
    const cutoffDate = new Date(Date.now() - olderThanHours * 60 * 60 * 1000)

    const { count, error } = await supabase
      .from('rate_limits')
      .delete()
      .lt('updated_at', cutoffDate.toISOString())

    if (error) {
      console.error('[RateLimit] Error cleaning up expired records:', error)
      return 0
    }

    return count || 0
  } catch (err) {
    console.error('[RateLimit] Error in cleanupExpiredRateLimits:', err)
    return 0
  }
}
