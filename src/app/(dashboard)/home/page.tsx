import { createClient } from "@/lib/supabase/server"
import { Metadata } from "next"
import { homeMetadata } from "@/app/page.metadata"
import { cookies } from "next/headers"
import { HomeClient } from "./HomeClient"

export const metadata: Metadata = homeMetadata

export default async function HomePage() {
  const cookieStore = cookies()
  const isDemo = cookieStore.get('mg_demo_session')?.value === 'true'

  let user: any = null
  let profile: any = null
  let allScans: any[] = []
  let flaggedCount = 0

  if (isDemo) {
    user = { id: 'demo-user-123', email: 'demo@milkguard.com' }
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
    allScans = [
      {
        id: 'scan-demo-1',
        safety_score: 96,
        result_tier: 'safe',
        created_at: new Date().toISOString(),
        source_hardware_id: 'ESP32-DEV-01',
        vendors: { name: 'Amul Dairy Booth #104' }
      },
      {
        id: 'scan-demo-2',
        safety_score: 92,
        result_tier: 'safe',
        created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
        source_hardware_id: null,
        vendors: { name: 'Saras Milk Outlet' }
      },
      {
        id: 'scan-demo-3',
        safety_score: 45,
        result_tier: 'adulterated',
        created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
        source_hardware_id: null,
        vendors: { name: 'Local Unregistered Vendor' }
      }
    ]
    flaggedCount = 2
  } else {
    try {
      const supabase = createClient()
      const { data } = await supabase.auth.getUser()
      user = data?.user ?? null

      if (user) {
        const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single()
        profile = p

        const [{ data: userScans }, { data: hwScans }, { count: fc }] = await Promise.all([
          supabase.from('scans').select('*, vendors(name), source_hardware_id').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5),
          supabase.from('scans').select('*, vendors(name), source_hardware_id').not('source_hardware_id', 'is', null).order('created_at', { ascending: false }).limit(5),
          supabase.from('vendors').select('id', { count: 'exact', head: true }).eq('city', profile?.city || 'Jaipur').eq('is_flagged', true)
        ])

        allScans = [...(userScans ?? []), ...(hwScans ?? [])].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        flaggedCount = fc || 0
      }
    } catch {
      // Offline fallback
      user = { id: 'demo-user-123', email: 'demo@milkguard.com' }
      profile = { full_name: 'MilkGuard User', city: 'Jaipur', total_scans: 12, safe_scans: 11 }
    }
  }

  if (!user) return null

  return (
    <HomeClient
      profile={profile}
      allScans={allScans}
      flaggedCount={flaggedCount}
    />
  )
}
