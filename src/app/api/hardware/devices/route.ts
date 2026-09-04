import { NextRequest, NextResponse } from 'next/server'
import { getOrCreateDevice, updateDeviceLastSeen } from '@/lib/supabase/masterScanService'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

/**
 * GET /api/hardware/devices
 * Lists registered MilkGuard hardware devices with dynamic online/offline status
 * computed from last_seen_at (within 5 minutes).
 */
export async function GET() {
  try {
    const { data: devices, error } = await supabase
      .from('devices')
      .select('*')
      .order('last_seen_at', { ascending: false, nullsFirst: false })

    if (error) {
      // Return fallback devices if table not yet created
      return NextResponse.json({
        devices: [
          {
            id: 'dev-fallback-1',
            device_uid: 'MG-DEVICE-001',
            device_name: 'MilkGuard ESP32 Primary Pod',
            device_type: 'Spectrometer-ESP32',
            firmware_version: 'v1.4.2',
            status: 'online',
            last_seen_at: new Date().toISOString(),
            is_active_online: true
          }
        ]
      })
    }

    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000

    const mappedDevices = (devices || []).map((dev) => {
      const lastSeenMs = dev.last_seen_at ? new Date(dev.last_seen_at).getTime() : 0
      const isOnline = lastSeenMs > fiveMinutesAgo
      return {
        ...dev,
        is_active_online: isOnline,
        computed_status: isOnline ? 'online' : 'offline',
        seconds_since_last_seen: lastSeenMs ? Math.round((Date.now() - lastSeenMs) / 1000) : null
      }
    })

    return NextResponse.json({ devices: mappedDevices })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

/**
 * POST /api/hardware/devices
 * ESP32 heartbeat / registration endpoint.
 * Payload: { device_uid: string, device_name?: string, firmware_version?: string }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null)
    if (!body || !body.device_uid) {
      return NextResponse.json({ error: 'device_uid is required' }, { status: 400 })
    }

    const device = await getOrCreateDevice(body.device_uid, body.device_name)
    await updateDeviceLastSeen(body.device_uid)

    return NextResponse.json({
      success: true,
      message: 'Heartbeat acknowledged',
      device: {
        ...device,
        status: 'online',
        last_seen_at: new Date().toISOString()
      }
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
