import { createClient } from "@/lib/supabase/server"
import { 
  ChevronLeft, 
  Search, 
  SlidersHorizontal, 
  Calendar, 
  Shield, 
  AlertTriangle, 
  TrendingUp,
  Filter
} from "lucide-react"
import Link from "next/link"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from "date-fns"
import { cn } from "@/lib/utils"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import HistoryTrendChart from "@/components/HistoryTrendChart"

import { cookies } from "next/headers"

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
    <div className="flex flex-col gap-6 w-full">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#001d36] tracking-tight">Reports & Compliance</h1>
          <p className="text-sm font-medium text-[#3e484f]">Historical milk test results and regulatory audit trails</p>
        </div>

        {/* Search & Filter bar */}
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6e7980]" size={16} />
            <Input 
              placeholder="Search vendor or sample ID..." 
              className="pl-10 h-11 rounded-xl border-[#d1e4ff] bg-white text-xs font-semibold focus-visible:ring-[#00668a]" 
            />
          </div>
          <Button variant="outline" className="h-11 w-11 rounded-xl border-[#d1e4ff] bg-white p-0 text-[#00668a] hover:bg-[#e5efff]">
            <Filter size={18} />
          </Button>
        </div>
      </div>

      {/* Trend Summary Card */}
      <Card className="rounded-2xl border border-[#c4e7ff] shadow-md bg-gradient-to-br from-[#00668a] to-[#004c69] text-white overflow-hidden relative">
        <CardHeader className="p-6 pb-2">
          <CardTitle className="text-xs font-bold uppercase tracking-wider text-[#c4e7ff] flex items-center gap-2">
            <TrendingUp size={16} className="text-[#30c5b3]" />
            <span>30-Day Milk Purity Trajectory</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <HistoryTrendChart data={trendData} />
        </CardContent>
      </Card>

      {/* Scan History Cards */}
      <div className="space-y-3">
        <div className="flex justify-between items-center px-1">
          <h2 className="text-sm font-bold text-[#001d36] uppercase tracking-wider">All Scans ({scans.length})</h2>
          <span className="text-xs text-[#3e484f]">Sorted by most recent</span>
        </div>

        {scans && scans.length > 0 ? (
          scans.map((scan) => {
            const displayScanId = scan.scan_id || (scan.id?.length > 15 ? `MG-${scan.id.slice(0, 8).toUpperCase()}` : scan.id)
            const deviceName = scan.devices?.device_name || (scan.devices?.device_uid ? `Hardware Pod (${scan.devices.device_uid})` : (scan.source_hardware_id ? `Hardware Pod (${scan.source_hardware_id})` : (scan.vendors?.name || 'MilkGuard Test Unit')))
            const isSafe = (scan.analysis_result || scan.result_tier) === 'safe'
            const score = scan.safety_score ?? (scan.analysis_confidence ? Math.round(Number(scan.analysis_confidence)) : 95)
            const txHash = scan.blockchain_tx_hash || scan.tx_hash
            const bStatus = scan.blockchain_status || (txHash ? 'confirmed' : 'pending')

            return (
              <div key={scan.id} className="relative group">
                <Card className="rounded-2xl border border-[#d1e4ff] bg-white ambient-shadow hover:border-[#00668a] transition-all overflow-hidden">
                  <CardContent className="p-4 flex items-center justify-between gap-4">
                    <Link href={`/history/${scan.id}`} className="flex items-center gap-3.5 min-w-0 flex-1">
                      <div className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
                        isSafe ? "bg-[#30c5b3]/15 text-[#006b5f]" : "bg-[#ffdad6] text-[#93000a]"
                      )}>
                        <span className="material-symbols-outlined text-2xl">
                          {isSafe ? 'verified' : 'warning'}
                        </span>
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-[#001d36] text-sm truncate hover:text-[#00668a] transition-colors">
                            {deviceName}
                          </p>
                          <span className="font-mono text-[10px] font-bold bg-[#e5efff] text-[#00668a] px-2 py-0.5 rounded-md shrink-0 border border-[#c4e7ff]">
                            {displayScanId}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-[#3e484f] font-medium mt-1">
                          <span className="flex items-center gap-1">
                            <Calendar size={12} className="text-[#6e7980]" />
                            {scan.created_at && !isNaN(new Date(scan.created_at).getTime()) ? format(new Date(scan.created_at), 'MMM dd, yyyy · hh:mm a') : 'Recent'}
                          </span>
                          <span>•</span>
                          <span className={cn(
                            "text-[10px] font-bold uppercase px-1.5 py-0.2 rounded",
                            bStatus === 'confirmed' ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                          )}>
                            {bStatus === 'confirmed' ? 'On-Chain Verified' : 'Block Pending'}
                          </span>
                        </div>
                      </div>
                    </Link>

                    <div className="flex items-center gap-4 shrink-0">
                      <Link href={`/history/${scan.id}`} className="text-right block">
                        <span className={cn(
                          "text-xl font-extrabold block leading-tight",
                          isSafe ? "text-[#006b5f]" : "text-[#ba1a1a]"
                        )}>
                          {score}%
                        </span>
                        <Badge variant="outline" className={cn(
                          "text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border-none",
                          isSafe ? "bg-[#30c5b3]/20 text-[#006b5f]" : "bg-[#ffdad6] text-[#93000a]"
                        )}>
                          {scan.analysis_result || scan.result_tier || (isSafe ? 'safe' : 'alert')}
                        </Badge>
                      </Link>

                      {/* Action Links */}
                      <div className="hidden sm:flex flex-col items-end gap-1">
                        {txHash && (
                          <a
                            href={`https://amoy.polygonscan.com/tx/${txHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#e5efff] text-[#00668a] hover:bg-[#c4e7ff] transition-colors border border-[#c4e7ff]"
                          >
                            <span className="material-symbols-outlined text-xs">verified</span>
                            <span>Polygon</span>
                          </a>
                        )}
                        <Link 
                          href={`/history/${scan.id}?report=true`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#f8f9ff] text-[#3e484f] hover:bg-[#e5efff] transition-colors border border-[#d1e4ff]"
                        >
                          <span>📄 PDF Report</span>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )
          })
        ) : (

          <div className="py-16 text-center flex flex-col items-center justify-center bg-white rounded-2xl border border-dashed border-[#d1e4ff]">
            <span className="material-symbols-outlined text-5xl text-[#bdc8d1] mb-2">history</span>
            <h3 className="font-bold text-[#001d36] text-base">No scans found</h3>
            <p className="text-xs text-[#6e7980] mt-1">Your test reports and compliance history will appear here.</p>
          </div>
        )}
      </div>
    </div>
  )
}
