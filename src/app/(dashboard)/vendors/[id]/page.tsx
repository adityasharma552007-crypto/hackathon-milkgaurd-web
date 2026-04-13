import { createClient } from "@/lib/supabase/server"
import { Shield, MapPin, ChevronLeft, Award, Activity, Users, AlertOctagon } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { format, eachDayOfInterval, isSameDay } from "date-fns"
import { cn } from "@/lib/utils"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import AdulterationTrendChart from "@/components/AdulterationTrendChart"
import ReportVendorButton from "@/components/ReportVendorButton"

function getTrustScoreDetails(avgScore: number, reportCount: number) {
  const trustScore = Math.round((avgScore * 0.6) + Math.max(0, 40 - (reportCount * 5)))
  if (trustScore >= 80) return { score: trustScore, label: 'Trusted', color: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-100', icon: Award }
  if (trustScore >= 50) return { score: trustScore, label: 'Moderate', color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-100', icon: Shield }
  return { score: trustScore, label: 'Flagged', color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-100', icon: AlertOctagon }
}

export default async function VendorProfilePage({ params }: { params: { id: string } }) {
  const supabase = createClient()

  // 1. Fetch Vendor
  const { data: vendor, error } = await supabase
    .from('vendors')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error || !vendor) {
    notFound()
  }

  // 2. Fetch all scans for this vendor
  const { data: scans } = await supabase
    .from('scans')
    .select('*')
    .eq('vendor_id', vendor.id)
    .order('created_at', { ascending: false })

  const totalScans = scans?.length || 0
  const avgPurity = vendor.avg_score || 0
  const reportCount = vendor.report_count || 0

  const trustDetails = getTrustScoreDetails(avgPurity, reportCount)
  const TrustIcon = trustDetails.icon

  // 3. WEEKLY TREND (Average ADULTERATION score per day)
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

  return (
    <div className="flex flex-col min-h-screen bg-[#F7F9F8] pb-24">
      {/* Header */}
      <header className="p-6 pb-4 pt-12 flex items-center justify-between sticky top-0 bg-[#F7F9F8]/80 backdrop-blur-md z-10">
        <div className="flex items-center gap-4">
          <Link href="javascript:history.back()" className="p-2 bg-white rounded-full shadow-sm hover:scale-105 transition-transform">
            <ChevronLeft size={20} className="text-slate-600" />
          </Link>
          <div>
            <h1 className="text-xl font-black text-slate-800 uppercase tracking-tighter leading-none inline-flex items-center gap-2">
              Profile
            </h1>
          </div>
        </div>
        <ReportVendorButton vendorId={vendor.id} vendorName={vendor.name} className="h-10 px-4 bg-white ring-red-100 shadow-sm" />
      </header>

      <main className="px-6 space-y-6">
        
        {/* Vendor Top Section */}
        <section className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col items-center text-center relative overflow-hidden">
           <div className={cn("absolute top-0 left-0 w-full h-2", trustDetails.bg)}></div>
           <div className={cn("w-20 h-20 rounded-full flex items-center justify-center mb-4 mt-2", trustDetails.bg)}>
              <TrustIcon size={32} className={trustDetails.color} />
           </div>
           
           <h2 className="text-2xl font-black text-slate-800 tracking-tight leading-none mb-2">{vendor.name}</h2>
           <p className="text-xs font-bold text-slate-400 flex items-center gap-1 uppercase tracking-wider mb-4">
              <MapPin size={12} /> {vendor.address}, {vendor.area || vendor.city}
           </p>

           <div className="flex items-center gap-2">
             <Badge className={cn("px-3 py-1 font-black uppercase tracking-widest text-[10px] border-none", trustDetails.bg, trustDetails.color)}>
               {trustDetails.label}
             </Badge>
             {vendor.is_flagged && (
                <Badge className="bg-red-500 text-white px-3 py-1 font-black uppercase tracking-widest text-[10px] border-none shadow-sm shadow-red-200">
                  ⚠️ Flagged
                </Badge>
             )}
           </div>

           {/* Score display */}
           <div className="mt-8 pt-6 border-t border-slate-100 w-full flex justify-between items-center px-4">
             <div className="text-center">
                <p className="text-3xl font-black tracking-tighter text-slate-800">{trustDetails.score}</p>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mt-1">Trust Score</p>
             </div>
             <div className="w-px h-10 bg-slate-100"></div>
             <div className="text-center">
                <p className={cn("text-3xl font-black tracking-tighter", trustDetails.color)}>{avgPurity}%</p>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mt-1">Avg Purity</p>
             </div>
           </div>
        </section>

        {/* Quick Stats Row */}
        <div className="grid grid-cols-2 gap-3">
           <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                 <Users size={18} className="text-[#60A5FA]" />
              </div>
              <div>
                 <p className="text-xl font-black text-slate-800 leading-none">{totalScans}</p>
                 <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mt-1">Community Scans</p>
              </div>
           </div>
           <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                 <Activity size={18} className="text-red-400" />
              </div>
              <div>
                 <p className="text-xl font-black text-slate-800 leading-none">{reportCount}</p>
                 <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mt-1">Active Reports</p>
              </div>
           </div>
        </div>

        {/* Purity Trend Chart */}
        <section>
          <Card className="rounded-3xl border-none shadow-sm bg-white overflow-hidden relative">
            <CardHeader className="p-5 pb-0">
               <CardTitle className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex justify-between items-center">
                  <span>Community Adulteration Trend</span>
               </CardTitle>
            </CardHeader>
            <CardContent className="p-5 pt-2">
               <AdulterationTrendChart data={trendData} />
            </CardContent>
          </Card>
        </section>

        {/* Scan History (Anonymous for community) */}
        <section className="space-y-4">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Recent Community Scans</h3>
          
          <div className="space-y-3">
            {scans && scans.length > 0 ? (
              scans.slice(0, 5).map((scan) => (
                <Card key={scan.id} className="border-none shadow-sm rounded-2xl bg-white mb-3">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
                      scan.result_tier === 'safe' ? "bg-emerald-50 text-emerald-500" : "bg-red-50 text-red-500"
                    )}>
                      {scan.result_tier === 'safe' ? <Shield size={24} /> : <Activity size={24} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-800 truncate">Community Member</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">{format(new Date(scan.created_at), 'dd MMM, hh:mm a')}</p>
                    </div>
                    <div className="text-right">
                      <span className={cn(
                        "text-lg font-black leading-none block",
                        scan.result_tier === 'safe' ? "text-emerald-500" : "text-red-500"
                      )}>
                        {scan.safety_score}%
                      </span>
                      <span className="text-[9px] font-black uppercase text-slate-400 tracking-tighter">Purity</span>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="py-8 text-center bg-white rounded-3xl border border-dashed border-slate-200">
                <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">No scans yet</p>
                <p className="text-slate-300 text-xs mt-1">Be the first to scan this location</p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  )
}
