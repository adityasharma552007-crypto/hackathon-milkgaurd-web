/**
 * Admin Rate Limit Statistics API
 *
 * Provides monitoring data for rate limits across the application.
 * Only accessible to admin users.
 */

import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * Check if user is an admin
 */
async function isAdmin(): Promise<boolean> {
  try {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session?.user) {
      return false
    }

    // Check for admin role in user metadata
    const role = session.user.user_metadata?.role

    // Also check if there's a roles array
    const roles = session.user.user_metadata?.roles

    return role === 'admin' || (Array.isArray(roles) && roles.includes('admin'))
  } catch (err) {
    console.error('[AdminStats] Error checking admin status:', err)
    return false
  }
}

/**
 * Get top endpoints by request count
 */
async function getTopEndpoints(supabase: any, limit: number = 10) {
  const { data, error } = await supabase
    .from('rate_limits')
    .select('endpoint, request_count, updated_at')
    .order('request_count', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('[AdminStats] Error fetching top endpoints:', error)
    return []
  }

  // Group by endpoint and sum counts
  const grouped = new Map<string, { endpoint: string; totalRequests: number; lastActivity: string }>()

  data.forEach((row: any) => {
    const existing = grouped.get(row.endpoint)
    if (existing) {
      existing.totalRequests += row.request_count
      if (new Date(row.updated_at) > new Date(existing.lastActivity)) {
        existing.lastActivity = row.updated_at
      }
    } else {
      grouped.set(row.endpoint, {
        endpoint: row.endpoint,
        totalRequests: row.request_count,
        lastActivity: row.updated_at
      })
    }
  })

  return Array.from(grouped.values()).sort(
    (a, b) => b.totalRequests - a.totalRequests
  ).slice(0, limit)
}

/**
 * Get top users by request count
 */
async function getTopUsers(supabase: any, limit: number = 10) {
  const { data, error } = await supabase
    .from('rate_limits')
    .select('user_id, request_count, endpoint')
    .not('user_id', 'is', null)
    .order('request_count', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('[AdminStats] Error fetching top users:', error)
    return []
  }

  // Group by user_id
  const grouped = new Map<string, { userId: string; totalRequests: number; endpoints: Set<string> }>()

  data.forEach((row: any) => {
    const existing = grouped.get(row.user_id)
    if (existing) {
      existing.totalRequests += row.request_count
      existing.endpoints.add(row.endpoint)
    } else {
      grouped.set(row.user_id, {
        userId: row.user_id,
        totalRequests: row.request_count,
        endpoints: new Set([row.endpoint])
      })
    }
  })

  return Array.from(grouped.values()).map(user => ({
    userId: user.userId,
    totalRequests: user.totalRequests,
    endpointCount: user.endpoints.size,
    endpoints: Array.from(user.endpoints)
  })).sort((a, b) => b.totalRequests - a.totalRequests).slice(0, limit)
}

/**
 * Get suspicious IPs (IPs with high request counts or rate limit violations)
 */
async function getSuspiciousIPs(supabase: any, limit: number = 10) {
  // Get IPs with rate limits at or near max
  const { data: rateLimitedData, error } = await supabase
    .from('rate_limits')
    .select('ip_address, request_count, endpoint, reset_time')
    .not('ip_address', 'is', null)
    .order('request_count', { ascending: false })
    .limit(50)

  if (error) {
    console.error('[AdminStats] Error fetching suspicious IPs:', error)
    return []
  }

  // Get config for comparison
  const { data: configData } = await supabase
    .from('rate_limit_config')
    .select('endpoint, limit_count')

  const configMap = new Map(configData?.map((c: any) => [c.endpoint, c.limit_count]) || [])

  // Analyze for suspicious activity
  const ipAnalysis = new Map<string, {
    ipAddress: string
    totalRequests: number
    rateLimitHits: number
    endpoints: Set<string>
    riskScore: number
  }>()

  rateLimitedData.forEach((row: any) => {
    const limit = configMap.get(row.endpoint) || 10
    const usageRatio = row.request_count / limit

    const existing = ipAnalysis.get(row.ip_address)
    if (existing) {
      existing.totalRequests += row.request_count
      if (usageRatio >= 0.8) existing.rateLimitHits++
      existing.endpoints.add(row.endpoint)
      existing.riskScore += usageRatio
    } else {
      ipAnalysis.set(row.ip_address, {
        ipAddress: row.ip_address,
        totalRequests: row.request_count,
        rateLimitHits: usageRatio >= 0.8 ? 1 : 0,
        endpoints: new Set([row.endpoint]),
        riskScore: usageRatio
      })
    }
  })

  return Array.from(ipAnalysis.values())
    .filter(ip => ip.rateLimitHits > 0 || ip.riskScore > 2)
    .sort((a, b) => b.riskScore - a.riskScore)
    .slice(0, limit)
    .map(ip => ({
      ...ip,
      endpointCount: ip.endpoints.size,
      endpoints: Array.from(ip.endpoints),
      riskLevel: ip.riskScore > 5 ? 'high' : ip.riskScore > 2 ? 'medium' : 'low'
    }))
}

/**
 * Get recent rate limit violations
 */
async function getRecentViolations(supabase: any, limit: number = 20) {
  const { data, error } = await supabase
    .from('rate_limits')
    .select(`
      id,
      user_id,
      ip_address,
      endpoint,
      request_count,
      reset_time,
      created_at,
      updated_at
    `)
    .order('updated_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('[AdminStats] Error fetching recent violations:', error)
    return []
  }

  // Get config for comparison
  const { data: configData } = await supabase
    .from('rate_limit_config')
    .select('endpoint, limit_count')

  const configMap = new Map(configData?.map((c: any) => [c.endpoint, c.limit_count]) || [])

  return data
    .map((row: any) => {
      const limit = configMap.get(row.endpoint) || 10
      return {
        id: row.id,
        userId: row.user_id,
        ipAddress: row.ip_address,
        endpoint: row.endpoint,
        requestCount: row.request_count,
        limit,
        usagePercent: Math.round((row.request_count / limit) * 100),
        resetTime: row.reset_time,
        updatedAt: row.updated_at,
        isViolating: row.request_count >= limit
      }
    })
    .filter(row => row.usagePercent >= 50) // Only show entries at 50%+ usage
    .slice(0, limit)
}

export async function GET(req: NextRequest) {
  try {
    // Check admin authorization
    const adminCheck = await isAdmin()
    if (!adminCheck) {
      return Response.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      )
    }

    const supabase = await createClient()

    // Fetch all stats in parallel
    const [topEndpoints, topUsers, suspiciousIPs, recentViolations] = await Promise.all([
      getTopEndpoints(supabase, 10),
      getTopUsers(supabase, 10),
      getSuspiciousIPs(supabase, 10),
      getRecentViolations(supabase, 20)
    ])

    // Get summary counts
    const { count: totalRecords } = await supabase
      .from('rate_limits')
      .select('*', { count: 'exact', head: true })

    const { data: configData } = await supabase
      .from('rate_limit_config')
      .select('endpoint, limit_count, window_minutes')

    return Response.json({
      summary: {
        totalRateLimitRecords: totalRecords || 0,
        configuredEndpoints: configData?.length || 0,
        timestamp: new Date().toISOString()
      },
      topEndpoints,
      topUsers,
      suspiciousIPs,
      recentViolations,
      config: configData?.map((c: any) => ({
        endpoint: c.endpoint,
        limit: c.limit_count,
        windowMinutes: c.window_minutes
      }))
    })
  } catch (err) {
    console.error('[AdminStats] Error:', err)
    return Response.json(
      { error: 'Failed to fetch rate limit statistics' },
      { status: 500 }
    )
  }
}
