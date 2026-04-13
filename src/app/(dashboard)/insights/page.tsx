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

  let areaRisk = { level: 'LOW', color: 'text-emerald-500' }
  if (avgAdulterationArea > 60) areaRisk = { level: 'HIGH', color: 'text-red-500' }
  else if (avgAdulterationArea >= 30) areaRisk = { level: 'MEDIUM', color: 'text-amber-500' }

  // 4. WEEKLY TREND (Average ADULTERATION score per day)
  const now = new Date()
  const last7Days = eachDayOfInterval({
    start: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000),
    end: now
  })

  const trendData = last7Days.map((day: Date) => {
    // For adulteration, it's 100 - safety_score
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
    <div className="flex flex-col min-h-screen bg-[#F7F9F8] pb-24">
      {/* Header */}
      <header className="p-6 pb-4 pt-12 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/home" className="p-2 bg-white rounded-full shadow-sm hover:scale-105 transition-transform">
            <ChevronLeft size={20} className="text-[#60A5FA]" />
          </Link>
          <div>
            <h1 className="text-xl font-black text-[#60A5FA] uppercase tracking-tighter leading-none inline-flex items-center gap-2">
              Smart Insights
            </h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
              AI analysis in {city}
            </p>
          </div>
        </div>
        <Link href="/insights" className="p-2 bg-white rounded-full shadow-sm hover:scale-105 transition-transform text-[#60A5FA]">
           <RefreshCw size={18} />
        </Link>
      </header>

      <main className="px-6 space-y-8">
        
        {/* Stats Strip */}
        <div className="grid grid-cols-4 gap-2">
           <div className="bg-white rounded-2xl p-3 shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center">
              <span className="text-lg font-black text-slate-800 leading-none">{totalScans}</span>
              <span className="text-[8px] font-black uppercase text-slate-400 tracking-widest mt-1">Scans</span>
           </div>
           <div className="bg-white rounded-2xl p-3 shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center">
              <span className="text-lg font-black text-[#60A5FA] leading-none">{passRate}%</span>
              <span className="text-[8px] font-black uppercase text-slate-400 tracking-widest mt-1">Pass</span>
           </div>
           <div className="bg-white rounded-2xl p-3 shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center">
              <span className={cn("text-lg font-black leading-none", flagCount > 0 ? "text-red-500" : "text-emerald-500")}>{flagCount}</span>
              <span className="text-[8px] font-black uppercase text-slate-400 tracking-widest mt-1">Flagged</span>
           </div>
           <div className="bg-white rounded-2xl p-3 shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center">
              <span className={cn("text-sm mt-0.5 font-black leading-none line-clamp-1", areaRisk.color)}>{areaRisk.level}</span>
              <span className="text-[8px] font-black uppercase text-slate-400 tracking-widest mt-1">Risk</span>
           </div>
        </div>

        {/* AI Generated Insights Section */}
        <section>
           <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
             <Activity size={14} /> Live Analyst Briefing
           </h2>
           <AIAssistantFeed contextData={aiContext} />
        </section>

        {/* Weekly Trend Chart */}
        <section>
          <Card className="rounded-3xl border-none shadow-sm bg-white overflow-hidden relative">
            <CardHeader className="p-5 pb-0">
               <CardTitle className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex justify-between items-center">
                  <span>Adulteration Trend (7 Days)</span>
               </CardTitle>
            </CardHeader>
            <CardContent className="p-5 pt-2">
               <AdulterationTrendChart data={trendData} />
            </CardContent>
          </Card>
        </section>

        {/* Top Vendors */}
        <section>
           <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
             <Award size={14} /> Most Trusted Vendors
           </h2>
           <div className="flex gap-3 overflow-x-auto pb-4 snap-x pr-6 -mr-6 pl-1">
              {topVendors.map(vendor => (
                <Link key={vendor.id} href={`/vendors/${vendor.id}`} className="min-w-[200px] bg-white rounded-2xl p-4 shadow-sm border border-slate-100 snap-center shrink-0 hover:shadow-md transition-shadow">
                   <div className="flex justify-between items-start mb-2">
                     <p className="font-black text-slate-800 text-sm truncate pr-2">{vendor.name}</p>
                     <Badge className="bg-emerald-50 text-emerald-600 shrink-0 text-[8px] uppercase font-black px-1.5 border-none h-4">
                        {vendor.trustDetails.score}
                     </Badge>
                   </div>
                   <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                     <MapPin size={10} /> {vendor.area || city}
                   </div>
                </Link>
              ))}
           </div>
        </section>

        {/* Flagged Vendors */}
        {flagVendorsList.length > 0 && (
          <section>
             <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
               <AlertTriangle size={14} /> Flagged Vendors Near You
             </h2>
             <div className="flex gap-3 overflow-x-auto pb-4 snap-x pr-6 -mr-6 pl-1">
                {flagVendorsList.map(vendor => (
                  <Link key={vendor.id} href={`/vendors/${vendor.id}`} className="min-w-[200px] bg-red-50 rounded-2xl p-4 border border-red-100 snap-center shrink-0 hover:bg-red-100 transition-colors">
                     <div className="flex justify-between items-start mb-2">
                       <p className="font-black text-slate-800 text-sm truncate pr-2">{vendor.name}</p>
                       <Badge className="bg-red-500 text-white shrink-0 text-[8px] uppercase font-black px-1.5 border-none h-4">
                          {vendor.trustDetails.score}
                       </Badge>
                     </div>
                     <div className="flex items-center gap-1 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                       <MapPin size={10} /> {vendor.area || city}
                     </div>
                  </Link>
                ))}
             </div>
          </section>
        )}
      </main>
    </div>
  )
}
