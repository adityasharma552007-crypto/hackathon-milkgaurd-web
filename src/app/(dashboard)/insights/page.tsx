import { createClient } from "@/lib/supabase/server"
import { ChevronLeft, RefreshCw, Activity, CheckCircle, AlertTriangle, Shield, MapPin, Award } from "lucide-react"
import Link from "next/link"
import { format, eachDayOfInterval, isSameDay } from "date-fns"
import { cn } from "@/lib/utils"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import AIAssistantFeed from "@/components/AIAssistantFeed"
import AdulterationTrendChart from "@/components/AdulterationTrendChart"
import { Badge } from "@/components/ui/badge"

function getTrustScoreDetails(avgScore: number, reportCount: number) {
  const trustScore = Math.round((avgScore * 0.6) + Math.max(0, 40 - (reportCount * 5)))
  if (trustScore >= 80) return { score: trustScore, label: 'Trusted', color: 'text-emerald-500', bg: 'bg-emerald-50' }
  if (trustScore >= 50) return { score: trustScore, label: 'Moderate', color: 'text-amber-500', bg: 'bg-amber-50' }
  return { score: trustScore, label: 'Flagged', color: 'text-red-500', bg: 'bg-red-50' }
}

export default async function InsightsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  // 1. Fetch profile and scans
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const { data: scans } = await supabase
    .from('scans')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const city = profile?.city || 'Jaipur'

  // 2. Fetch all vendors in user's city
  const { data: vendors } = await supabase
    .from('vendors')
    .select('*')
    .eq('city', city)

  // 3. STAT CALCULATIONS
  const totalScans = profile?.total_scans || 0
  const safeScans = profile?.safe_scans || 0
  const passRate = totalScans > 0 ? Math.round((safeScans / totalScans) * 100) : 0

  let totalAdulteration = 0
  const mappedVendors = (vendors || []).map(v => {
    const adulteration = 100 - (v.avg_score || 0)
    totalAdulteration += adulteration
    return { ...v, trustDetails: getTrustScoreDetails(v.avg_score || 0, v.report_count || 0) }
  })
  
  const avgAdulterationArea = mappedVendors.length > 0 ? Math.round(totalAdulteration / mappedVendors.length) : 0
  const flagCount = mappedVendors.filter(v => v.trustDetails.score < 50 || v.is_flagged).length

  let areaRisk = { level: 'LOW', color: 'text-[#006b5f]' }
  if (avgAdulterationArea > 60) areaRisk = { level: 'HIGH', color: 'text-[#ba1a1a]' }
  else if (avgAdulterationArea >= 30) areaRisk = { level: 'MEDIUM', color: 'text-amber-600' }

  // 4. WEEKLY TREND
  const now = new Date()
  const last7Days = eachDayOfInterval({
    start: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000),
    end: now
  })

  const trendData = last7Days.map((day: Date) => {
    const dayScans = scans?.filter(s => isSameDay(new Date(s.created_at), day)) || []
    const avgScore = dayScans.length > 0 
      ? dayScans.reduce((acc, s) => acc + (100 - s.safety_score), 0) / dayScans.length 
      : 0
    
    return {
      date: format(day, 'MMM dd'),
      score: avgScore
    }
  })

  // 5. TOP AND BOTTOM VENDORS
  const sortedVendors = [...mappedVendors].sort((a, b) => b.trustDetails.score - a.trustDetails.score)
  const topVendors = sortedVendors.slice(0, 3)
  const flagVendorsList = sortedVendors.filter(v => v.trustDetails.score < 50 || v.is_flagged).reverse().slice(0, 3)

  // Context Object for Groq
  const aiContext = {
    total_city_vendors: mappedVendors.length,
    average_adulteration_score: avgAdulterationArea,
    number_of_flagged_vendors: flagCount,
    user_pass_rate: passRate,
    time_of_day: format(now, 'HH:mm')
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-[#001d36] tracking-tight">Smart City Insights</h1>
          <p className="text-sm font-medium text-[#3e484f]">AI-driven risk analysis & vendor compliance for {city}</p>
        </div>
        <Link href="/insights" className="p-2.5 bg-white rounded-xl border border-[#d1e4ff] text-[#00668a] hover:bg-[#e5efff] transition-all ambient-shadow">
          <RefreshCw size={18} />
        </Link>
      </div>

      {/* Stats Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 ambient-shadow border border-[#d1e4ff] flex flex-col items-center justify-center text-center">
          <span className="text-2xl font-extrabold text-[#001d36]">{totalScans}</span>
          <span className="text-xs font-semibold text-[#3e484f] uppercase tracking-wider mt-1">Total Scans</span>
        </div>
        <div className="bg-white rounded-2xl p-4 ambient-shadow border border-[#d1e4ff] flex flex-col items-center justify-center text-center">
          <span className="text-2xl font-extrabold text-[#00668a]">{passRate}%</span>
          <span className="text-xs font-semibold text-[#3e484f] uppercase tracking-wider mt-1">Pass Rate</span>
        </div>
        <div className="bg-white rounded-2xl p-4 ambient-shadow border border-[#d1e4ff] flex flex-col items-center justify-center text-center">
          <span className={cn("text-2xl font-extrabold", flagCount > 0 ? "text-[#ba1a1a]" : "text-[#006b5f]")}>{flagCount}</span>
          <span className="text-xs font-semibold text-[#3e484f] uppercase tracking-wider mt-1">Flagged Vendors</span>
        </div>
        <div className="bg-white rounded-2xl p-4 ambient-shadow border border-[#d1e4ff] flex flex-col items-center justify-center text-center">
          <span className={cn("text-lg font-extrabold uppercase", areaRisk.color)}>{areaRisk.level}</span>
          <span className="text-xs font-semibold text-[#3e484f] uppercase tracking-wider mt-1">Area Risk</span>
        </div>
      </div>

      {/* AI Generated Insights Section */}
      <section className="space-y-3">
        <h2 className="text-sm font-bold text-[#001d36] uppercase tracking-wider flex items-center gap-2">
          <Activity size={16} className="text-[#00668a]" />
          <span>Live Analyst Briefing</span>
        </h2>
        <AIAssistantFeed contextData={aiContext} />
      </section>

      {/* Weekly Trend Chart */}
      <section>
        <Card className="rounded-2xl border border-[#d1e4ff] ambient-shadow bg-white overflow-hidden">
          <CardHeader className="p-5 pb-0">
            <CardTitle className="text-xs font-bold text-[#3e484f] uppercase tracking-wider">
              Adulteration Trend (Last 7 Days)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 pt-2">
            <AdulterationTrendChart data={trendData} />
          </CardContent>
        </Card>
      </section>

      {/* Top Vendors */}
      <section className="space-y-3">
        <h2 className="text-sm font-bold text-[#001d36] uppercase tracking-wider flex items-center gap-2">
          <Award size={16} className="text-[#006b5f]" />
          <span>Most Trusted Vendors in {city}</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {topVendors.map(vendor => (
            <Link key={vendor.id} href={`/vendors/${vendor.id}`} className="bg-white rounded-2xl p-4 ambient-shadow border border-[#d1e4ff] hover:border-[#00668a] transition-all">
              <div className="flex justify-between items-start mb-2">
                <p className="font-bold text-[#001d36] text-sm truncate">{vendor.name}</p>
                <Badge className="bg-[#30c5b3]/15 text-[#006b5f] text-[10px] uppercase font-bold px-2 py-0.5 border-none">
                  {vendor.trustDetails.score} Trust
                </Badge>
              </div>
              <div className="flex items-center gap-1 text-xs font-medium text-[#3e484f]">
                <MapPin size={12} className="text-[#6e7980]" />
                <span>{vendor.area || city}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Flagged Vendors */}
      {flagVendorsList.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-bold text-[#ba1a1a] uppercase tracking-wider flex items-center gap-2">
            <AlertTriangle size={16} />
            <span>Flagged Vendors Near You</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {flagVendorsList.map(vendor => (
              <Link key={vendor.id} href={`/vendors/${vendor.id}`} className="bg-[#ffdad6]/40 rounded-2xl p-4 border border-[#ffdad6] hover:bg-[#ffdad6]/70 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <p className="font-bold text-[#001d36] text-sm truncate">{vendor.name}</p>
                  <Badge className="bg-[#ba1a1a] text-white text-[10px] uppercase font-bold px-2 py-0.5 border-none">
                    {vendor.trustDetails.score} Score
                  </Badge>
                </div>
                <div className="flex items-center gap-1 text-xs font-medium text-[#93000a]">
                  <MapPin size={12} />
                  <span>{vendor.area || city}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
