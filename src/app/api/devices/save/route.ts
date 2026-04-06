/**
 * POST /api/devices/save
 * Upserts a device record into iot_devices for the authenticated user.
 *
 * DELETE /api/devices/save
 * Removes a device record (forget/unpair).
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => null)
  if (!body?.ip_address || !body?.device_id) {
    return NextResponse.json({ error: 'ip_address and device_id are required' }, { status: 400 })
  }

  const { error } = await supabase.from('iot_devices').upsert(
    {
      user_id:      user.id,
      device_id:    body.device_id,
      display_name: body.display_name ?? null,
      ip_address:   body.ip_address,
      port:         body.port         ?? 8080,
      firmware:     body.firmware     ?? null,
      model:        body.model        ?? null,
      last_seen:    new Date().toISOString(),
    },
    { onConflict: 'user_id,ip_address' }
  )

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

export async function DELETE(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { ip_address } = await req.json().catch(() => ({}))
  if (!ip_address) return NextResponse.json({ error: 'ip_address required' }, { status: 400 })

  const { error } = await supabase
    .from('iot_devices')
    .delete()
    .eq('user_id', user.id)
    .eq('ip_address', ip_address)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
