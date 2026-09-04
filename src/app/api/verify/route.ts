import { NextRequest, NextResponse } from 'next/server'
import { verifyPublicScan } from '@/lib/supabase/masterScanService'

/**
 * GET /api/verify?scan_id=MG-20260904-A8F31C
 * POST /api/verify { "scan_id": "MG-20260904-A8F31C" }
 *
 * Public MilkGuard Blockchain Verification Engine.
 * Recalculates canonical SHA-256 data hash from stored 14 sensor signals and matches against blockchain fingerprint.
 * Never leaks private user information (user_id, email, phone).
 */
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const scanId = searchParams.get('query') || searchParams.get('scan_id') || searchParams.get('tx') || searchParams.get('id')

  if (!scanId) {
    return NextResponse.json({ error: 'scan_id or transaction hash is required' }, { status: 400 })
  }

  try {
    const result = await verifyPublicScan(scanId)
    return NextResponse.json(result)
  } catch (err: any) {
    return NextResponse.json({
      verified: false,
      error: err.message || 'Verification failed: no record found or hash mismatch'
    }, { status: 404 })
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const scanId = body.query || body.scan_id || body.tx || body.id

  if (!scanId) {
    return NextResponse.json({ error: 'scan_id or transaction hash is required' }, { status: 400 })
  }

  try {
    const result = await verifyPublicScan(scanId)
    return NextResponse.json(result)
  } catch (err: any) {
    return NextResponse.json({
      verified: false,
      error: err.message || 'Verification failed'
    }, { status: 404 })
  }
}
