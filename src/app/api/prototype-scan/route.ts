import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { createClient as createBrowserClient } from '@/lib/supabase/server'

// Service-role client bypasses PostgREST schema cache restrictions
function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
  if (!url || !key) throw new Error('Missing Supabase service role env vars')
  return createClient(url, key)
}

export async function POST(req: NextRequest) {
  try {
    // Verify the user is authenticated
    const browserSupabase = createBrowserClient()
    const { data: { user } } = await browserSupabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const {
      safetyScore, resultTier, aiConfidence, scanDuration,
      wavelengthAnalysis, baselineData, recommendation, adulterants
    } = body

    const supabase = getServiceClient()

    // Insert scan row using service role (no schema cache issues)
    const { data: scan, error: scanErr } = await supabase
      .from('scans')
      .insert({
        user_id:         user.id,
        vendor_id:       null,
        safety_score:    safetyScore,
        result_tier:     resultTier,
        ai_confidence:   aiConfidence,
        scan_duration:   scanDuration,
        wavelength_data: wavelengthAnalysis,
      })
      .select()
      .single()

    if (scanErr || !scan) {
      return NextResponse.json({ error: scanErr?.message ?? 'Insert failed' }, { status: 400 })
    }

    // Insert adulterant results
    if (adulterants?.length) {
      await supabase.from('adulterant_results').insert(
        adulterants.map((a: any) => ({
          scan_id:        scan.id,
          name:           a.name,
          detected_value: a.detectedValue,
          safe_limit:     a.safeLimit,
          unit:           a.unit,
          status:         a.status,
          quantity_500ml: a.quantity500ml,
          analogy:        a.analogy,
        }))
      )
    }

    // Update user scan stats
    await supabase.rpc('increment_user_scans', {
      p_user_id: user.id,
      p_is_safe: safetyScore >= 85,
    })

    return NextResponse.json({ scanId: scan.id })
  } catch (err: any) {
    console.error('[prototype-scan API]', err)
    return NextResponse.json({ error: err.message ?? 'Internal server error' }, { status: 500 })
  }
}
