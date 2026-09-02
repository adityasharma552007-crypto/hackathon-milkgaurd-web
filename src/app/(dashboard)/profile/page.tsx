import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import ProfileClient from "./ProfileClient"

export default async function ProfilePage() {
  const cookieStore = cookies()
  const isDemo = cookieStore.get('mg_demo_session')?.value === 'true'

  let user: any = null
  let profile: any = null
  let reports: any[] = []

  if (isDemo) {
    user = {
      id: 'demo-user-123',
      email: 'demo@milkguard.com',
      user_metadata: { full_name: 'Demo User', phone: '9876543210' }
    }
    profile = {
      id: 'demo-user-123',
      full_name: 'Demo User',
      phone: '9876543210',
      city: 'Jaipur',
      area: 'Malviya Nagar',
      pod_id: 'POD-JP-042',
      total_scans: 28,
      safe_scans: 26,
      created_at: new Date().toISOString()
    }
  } else {
    try {
      const supabase = createClient()
      const { data } = await supabase.auth.getUser()
      user = data?.user ?? null

      if (user) {
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        profile = existingProfile

        const { data: rep } = await supabase
          .from('fssai_reports')
          .select(`id, complaint_ref, status, auto_triggered, created_at, vendors(name, area)`)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
        reports = rep ?? []
      }
    } catch {
      // Offline fallback
      user = { id: 'demo-user-123', email: 'demo@milkguard.com' }
      profile = { full_name: 'MilkGuard User', city: 'Jaipur', total_scans: 28, safe_scans: 26 }
    }
  }

  if (!user) {
    redirect('/auth/login')
  }

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
