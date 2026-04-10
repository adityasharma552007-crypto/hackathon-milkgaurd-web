'use server'

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function submitVendorReport(formData: FormData) {
  const supabase = createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return { error: 'You must be logged in to report a vendor.' }
  }

  const vendorId = formData.get('vendorId') as string
  const issueType = formData.get('issueType') as string
  const description = formData.get('description') as string
  const scanId = formData.get('scanId') as string | null

  if (!vendorId || !issueType || !description) {
    return { error: 'Missing required fields.' }
  }

  if (description.length > 300) {
    return { error: 'Description must be under 300 characters.' }
  }

  try {
    const { error } = await supabase
      .from('vendor_reports')
      .insert({
        vendor_id: vendorId,
        user_id: user.id,
        issue_type: issueType,
        description: description,
        scan_id: scanId || null
      })

    if (error) throw error

    revalidatePath('/map')
    revalidatePath('/home')
    revalidatePath('/history/[id]', 'page')
    
    return { success: true }
  } catch (error: any) {
    console.error('[submitVendorReport] Error:', error)
    return { error: error.message || 'Failed to submit report.' }
  }
}
