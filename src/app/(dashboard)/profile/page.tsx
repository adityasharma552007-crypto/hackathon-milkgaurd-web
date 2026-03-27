import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import ProfileClient from "./ProfileClient"

export default async function ProfilePage() {
  const supabase = createClient()
  
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  
  if (!user || userError) {
    redirect('/auth/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

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

  const unsafeScans = (profile?.total_scans ?? 0) - (profile?.safe_scans ?? 0)

  return (
    <ProfileClient
      user={{
        id: user.id,
        email: user.email ?? '',
        fullName: profile?.full_name ?? user.user_metadata?.name ?? user.user_metadata?.full_name ?? '',
        phone: profile?.phone ?? '',
        city: profile?.city ?? '',
        area: profile?.area ?? '',
        totalScans: profile?.total_scans ?? 0,
        safeScans: profile?.safe_scans ?? 0,
        unsafeScans: unsafeScans < 0 ? 0 : unsafeScans,
        createdAt: profile?.created_at ?? ''
      }}
      reports={reports ?? []}
    />
  )
}
