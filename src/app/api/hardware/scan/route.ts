import { NextRequest, NextResponse } from 'next/server'
import { createAuthoritativeScan } from '@/lib/supabase/masterScanService'
import { createClient } from '@supabase/supabase-js'

/**
 * POST /api/hardware/scan
 * Authoritative ESP32 Wi-Fi hardware scan ingestion endpoint.
 *
 * Payload:
 * {
 *   "device_uid": "MG-DEVICE-001",
 *   "signals": [0.823, 0.714, ..., 0.291], // exactly 14 channels
 *   "user_id": "optional-uuid"
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null)

    if (!body) {
      return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 })
    }

    const deviceUid = body.device_uid || body.deviceId || body.device_id || 'MG-DEVICE-001'
    
    // Normalize 14 signals
    let signals: number[] = []

    if (Array.isArray(body.signals) && body.signals.length === 14) {
      signals = body.signals.map(Number)
    } else if (Array.isArray(body.readings) && body.readings.length === 14) {
      signals = body.readings.map(Number)
    } else if (body.f1 !== undefined && body.f8 !== undefined) {
      // Legacy AS7343 object format: { f1..f8, nir, clear, ... }
      signals = [
        Number(body.f1 || 0.52),
        Number(body.f2 || 0.61),
        Number(body.f3 || 0.74),
        Number(body.f4 || 0.78),
        Number(body.f5 || 0.80),
        Number(body.f6 || 0.76),
        Number(body.f7 || 0.70),
        Number(body.f8 || 0.63),
        Number(body.nir || 0.48),
        Number(body.clear || 0.82),
        Number(body.fd || 0.44),
        Number(body.fz || 0.51),
        Number(body.fy || 0.58),
        Number(body.fxl || 0.65),
      ]
    } else if (body.signal_01 !== undefined) {
      signals = [
        Number(body.signal_01), Number(body.signal_02), Number(body.signal_03), Number(body.signal_04),
        Number(body.signal_05), Number(body.signal_06), Number(body.signal_07), Number(body.signal_08),
        Number(body.signal_09), Number(body.signal_10), Number(body.signal_11), Number(body.signal_12),
        Number(body.signal_13), Number(body.signal_14)
      ]
    }

    if (signals.length !== 14 || signals.some(s => isNaN(s))) {
      return NextResponse.json({
        error: 'Validation failed: payload must contain exactly 14 valid numeric spectral signals (signal_01..signal_14).'
      }, { status: 400 })
    }

    // Process canonical scan pipeline
    const scan = await createAuthoritativeScan({
      deviceUid,
      signals,
      userId: body.user_id || null
    })

    // Also broadcast/insert into milk_data for existing realtime subscribers
    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
      await supabase.from('milk_data').insert({
        quality: (scan.safety_score || 95) / 100,
        tx_hash: scan.blockchain_tx_hash,
        status: scan.result_tier === 'safe' ? 'Pure' : 'Adulterated',
        channel_hash: scan.data_hash,
        device_id: deviceUid,
        f1: signals[0],
        f2: signals[1],
        f3: signals[2],
        f4: signals[3],
        f5: signals[4],
        f6: signals[5],
        f7: signals[6],
        f8: signals[7],
        nir: signals[8],
        clear: signals[9]
      })
    } catch (e) {
      // Non-blocking for legacy table
    }

    return NextResponse.json({
      success: true,
      scan_id: scan.scan_id,
      id: scan.id,
      status: scan.status,
      analysis_result: scan.analysis_result,
      analysis_confidence: scan.analysis_confidence,
      analysis_summary: scan.analysis_summary,
      data_hash: scan.data_hash,
      blockchain_tx_hash: scan.blockchain_tx_hash,
      blockchain_status: scan.blockchain_status,
      verified_at: scan.verified_at,
      report_url: scan.report_url,
      signals: signals
    })
  } catch (err: any) {
    console.error('[POST /api/hardware/scan error]', err)
    return NextResponse.json({ error: err.message || 'Internal hardware scan error' }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'online',
    endpoint: '/api/hardware/scan',
    expected_channels: 14,
    protocol: 'ESP32 Wi-Fi HTTP POST JSON',
    example_payload: {
      device_uid: 'MG-DEVICE-001',
      signals: [0.823, 0.714, 0.655, 0.735, 0.811, 0.749, 0.625, 0.591, 0.527, 0.519, 0.487, 0.411, 0.390, 0.667]
    }
  })
}
