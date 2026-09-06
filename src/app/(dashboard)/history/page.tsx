import { createClient } from "@/lib/supabase/server"
import { format, eachDayOfInterval, isSameDay } from "date-fns"
import { cookies } from "next/headers"
import { HistoryClient } from "./HistoryClient"

export default async function HistoryPage() {
  const cookieStore = cookies()
  const isDemo = cookieStore.get('mg_demo_session')?.value === 'true'

  let user: any = null
  let scans: any[] = []

  const fallbackScans = [
    {
      id: 'scan-demo-1',
      safety_score: 96,
      result_tier: 'safe',
      created_at: new Date().toISOString(),
      source_hardware_id: 'ESP32-DEV-01',
      tx_hash: '0x8f2d3a4b5c6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a',
      vendors: { name: 'Amul Dairy Booth #104' }
    },
    {
      id: 'scan-demo-2',
      safety_score: 92,
      result_tier: 'safe',
      created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
      source_hardware_id: null,
      tx_hash: '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b',
      vendors: { name: 'Saras Milk Outlet' }
    },
    {
      id: 'scan-demo-3',
      safety_score: 45,
      result_tier: 'adulterated',
      created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
      source_hardware_id: null,
      tx_hash: null,
      vendors: { name: 'Local Unregistered Vendor' }
    }
  ]

  if (isDemo) {
    user = { id: 'demo-user-123', email: 'demo@milkguard.com' }
    scans = fallbackScans
  } else {
    try {
      const supabase = createClient()
      const { data } = await supabase.auth.getUser()
      user = data?.user ?? null

      if (user) {
        let fetchedUserScans: any[] = []
        let fetchedHwScans: any[] = []

        // Attempt master architecture join first
        const { data: masterUserScans, error: masterErr } = await supabase
          .from('scans')
          .select('*, devices(device_uid, device_name), sensor_readings(*), vendors(name)')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (!masterErr && masterUserScans) {
          fetchedUserScans = masterUserScans
          const { data: hwData } = await supabase
            .from('scans')
            .select('*, devices(device_uid, device_name), sensor_readings(*), vendors(name)')
            .not('source_hardware_id', 'is', null)
            .order('created_at', { ascending: false })
            .limit(20)
          if (hwData) fetchedHwScans = hwData
        } else {
          // Graceful fallback to legacy columns
          const [{ data: legUser }, { data: legHw }] = await Promise.all([
            supabase.from('scans').select('*, vendors(name)').eq('user_id', user.id).order('created_at', { ascending: false }),
            supabase.from('scans').select('*, vendors(name)').not('source_hardware_id', 'is', null).order('created_at', { ascending: false }).limit(20)
          ])
          fetchedUserScans = legUser ?? []
          fetchedHwScans = legHw ?? []
        }

        const allScans = [...fetchedUserScans, ...fetchedHwScans]
        const seen = new Set<string>()
        const fetched = allScans
          .filter((s) => {
            if (!s?.id || seen.has(s.id)) return false
            seen.add(s.id)
            return true
          })
          .sort((a, b) => {
            const timeA = a.created_at ? new Date(a.created_at).getTime() : 0
            const timeB = b.created_at ? new Date(b.created_at).getTime() : 0
            return timeB - timeA
          })
        scans = fetched
      }
    } catch (err) {
      console.error('[History Page Error]', err)
      user = { id: 'demo-user-123', email: 'demo@milkguard.com' }
      scans = fallbackScans
    }
  }

  if (!user) return null

  // Prepare trend data (last 30 days)
  const now = new Date()
  const last30Days = eachDayOfInterval({
    start: new Date(now.getTime() - 29 * 24 * 60 * 60 * 1000),
    end: now
  })

  const trendData = last30Days.map((day: Date) => {
    const dayScans = scans?.filter((s) => {
      if (!s?.created_at) return false
      const d = new Date(s.created_at)
      return !isNaN(d.getTime()) && isSameDay(d, day)
    }) || []
    const avgScore = dayScans.length > 0 
      ? Math.round(dayScans.reduce((acc, s) => acc + (Number(s.safety_score) || 0), 0) / dayScans.length) 
      : null
    
    return {
      date: format(day, 'MMM dd'),
      score: avgScore
    }
  })

  return (
    <HistoryClient
      scans={scans}
      trendData={trendData}
    />
  )
}
