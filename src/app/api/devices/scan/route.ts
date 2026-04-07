/**
 * GET /api/devices/scan
 *
 * Server-side concurrent HTTP probe of the configured IP range.
 * For each IP, attempts GET http://<ip>:<port>/info with timeout.
 * Returns array of responding devices with their info payload.
 *
 * Query params:
 *   prefix  — IP prefix (default env NEXT_PUBLIC_DEVICE_IP_PREFIX or "192.168.1")
 *   start   — range start (default 1)
 *   end     — range end   (default 50, max 254)
 *   port    — device port (default env NEXT_PUBLIC_DEVICE_PORT or 8080)
 */

import { NextRequest, NextResponse } from 'next/server'
import { checkAndLogRateLimit, getRateLimitHeaders } from '@/lib/supabase/protectedRoute'

const DEFAULT_PREFIX  = process.env.NEXT_PUBLIC_DEVICE_IP_PREFIX ?? '192.168.1'
const DEFAULT_PORT    = Number(process.env.NEXT_PUBLIC_DEVICE_PORT ?? 8080)
const DEFAULT_TIMEOUT = Number(process.env.NEXT_PUBLIC_DEVICE_TIMEOUT_MS ?? 2500)
const CONCURRENCY     = 20   // IPs probed simultaneously

export async function GET(req: NextRequest) {
  // Check rate limit FIRST
  const rateLimitCheck = await checkAndLogRateLimit('/api/devices/scan', req)

  if (!rateLimitCheck.allowed) {
    return rateLimitCheck.response
  }

  const { searchParams } = req.nextUrl
  const prefix  = searchParams.get('prefix') ?? DEFAULT_PREFIX
  const start   = Math.max(1,   Number(searchParams.get('start')  ?? 1))
  const end     = Math.min(254, Number(searchParams.get('end')    ?? 50))
  const port    = Number(searchParams.get('port') ?? DEFAULT_PORT)
  const timeout = DEFAULT_TIMEOUT

  if (start > end) {
    return NextResponse.json(
      { error: 'start must be ≤ end' },
      {
        status: 400,
        headers: getRateLimitHeaders(rateLimitCheck.limit, rateLimitCheck.remaining, rateLimitCheck.resetIn)
      }
    )
  }

  // Build the list of IPs to probe
  const ips: string[] = []
  for (let i = start; i <= end; i++) ips.push(`${prefix}.${i}`)

  // Probe a single IP
  async function probe(ip: string): Promise<{
    ip: string; port: number; device_id: string;
    firmware?: string; model?: string; battery?: number
  } | null> {
    const url = `http://${ip}:${port}/info`
    try {
      const controller = new AbortController()
      const id = setTimeout(() => controller.abort(), timeout)
      const res = await fetch(url, { signal: controller.signal, cache: 'no-store' })
      clearTimeout(id)
      if (!res.ok) return null
      const data = await res.json()
      // Validate minimal required field
      if (!data?.device_id) return null
      return { ip, port, ...data }
    } catch {
      return null
    }
  }

  // Probe in concurrent batches
  const found: Awaited<ReturnType<typeof probe>>[] = []
  for (let i = 0; i < ips.length; i += CONCURRENCY) {
    const batch   = ips.slice(i, i + CONCURRENCY)
    const results = await Promise.all(batch.map(probe))
    found.push(...results.filter(Boolean))
  }

  return NextResponse.json(
    {
      devices: found,
      scanned: ips.length,
      remaining: rateLimitCheck.remaining
    },
    {
      headers: getRateLimitHeaders(rateLimitCheck.limit, rateLimitCheck.remaining, rateLimitCheck.resetIn)
    }
  )
}
