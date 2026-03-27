import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import ProfileClient from "./ProfileClient"

export default async function ProfilePage() {
  const supabase = createClient()
  
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  
  if (!user || userError) {
    redirect('/auth/login')
  }

  // First try to get existing profile
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // If no profile exists, create one now
  let profile = existingProfile
  
  if (!existingProfile) {
    const { data: newProfile } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        full_name: 
          user.user_metadata?.full_name ??
          user.user_metadata?.name ??
          user.user_metadata?.user_name ??
          user.email?.split('@')[0] ??
          'MilkGuard User',
        total_scans: 0,
        safe_scans: 0,
      })
      .select()
      .single()
    
    profile = newProfile
  }

  const { data: reports } = await supabase
    .from('fssai_reports')
    .select(`
      id,
      complaint_ref,
      status,
      auto_triggered,
      created_at,
      vendors (
        name,
        area
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  // Safe fallbacks for every field
  const safeProfile = {
    full_name:    profile?.full_name    ?? 
                  user.user_metadata?.name ??
                  user.email?.split('@')[0] ??
                  'MilkGuard User',
    phone:        profile?.phone        ?? '',
    city:         profile?.city         ?? '',
    area:         profile?.area         ?? '',
    total_scans:  profile?.total_scans  ?? 0,
    safe_scans:   profile?.safe_scans   ?? 0,
  }

  const unsafeScans = Math.max(
    0,
    safeProfile.total_scans - safeProfile.safe_scans
  )

  // Pass ONLY real data to client
  return (
    <ProfileClient
      user={{
        id:          user.id,
        email:       user.email ?? '',
        fullName:    safeProfile.full_name,
        phone:       safeProfile.phone,
        city:        safeProfile.city,
        area:        safeProfile.area,
        totalScans:  safeProfile.total_scans,
        safeScans:   safeProfile.safe_scans,
        unsafeScans: unsafeScans,
        createdAt:   profile?.created_at ?? 
                     new Date().toISOString()
      }}
      reports={reports ?? []}
    />
  )
}
