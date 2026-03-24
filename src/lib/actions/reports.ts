'use server'

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function reportVendor(scanId: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error("Unauthorized")

  // Fetch scan details
  const { data: scan, error: scanError } = await supabase
    .from('scans')
    .select('*, vendors(id, name)')
    .eq('id', scanId)
    .single()

  if (scanError || !scan) throw new Error("Scan not found")

  // Check if already reported
  const { data: existing } = await supabase
    .from('fssai_reports')
    .select('id')
    .eq('scan_id', scanId)
    .single()

  if (existing) return { success: true, alreadyReported: true }

  // Create report
  const { error: reportError } = await supabase
    .from('fssai_reports')
    .insert({
      scan_id: scanId,
      user_id: user.id,
      vendor_id: scan.vendor_id || null,
      report_type: 'manual',
      status: 'pending',
      details: `User reported ${scan.vendors?.name || 'Unknown Vendor'} for milk purity score of ${scan.safety_score}%. Result tier: ${scan.result_tier}.`
    })

  if (reportError) throw new Error(reportError.message)

  revalidatePath(`/history/${scanId}`)
  return { success: true }
}
