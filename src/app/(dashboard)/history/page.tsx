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

export default async function HistoryPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  // Fetch all scans for the user
  const { data: scans } = await supabase
    .from('scans')
    .select('*, vendors(name)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  // Prepare trend data (last 30 days)
  const now = new Date()
  const last30Days = eachDayOfInterval({
    start: new Date(now.getTime() - 29 * 24 * 60 * 60 * 1000),
    end: now
  })

  const trendData = last30Days.map((day: Date) => {
    const dayScans = scans?.filter(s => isSameDay(new Date(s.created_at), day)) || []
    const avgScore = dayScans.length > 0 
      ? dayScans.reduce((acc, s) => acc + s.safety_score, 0) / dayScans.length 
      : null
    
    return {
      date: format(day, 'MMM dd'),
      score: avgScore
    }
  })

  return (
    <div className="flex flex-col min-h-screen bg-[#F7F9F8] pb-24">
      {/* Header */}
      <header className="p-6 pb-4 pt-12 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <Link href="/home" className="p-2 bg-white rounded-full shadow-sm">
            <ChevronLeft size={20} className="text-[#60A5FA]" />
          </Link>
          <h1 className="text-xl font-black text-[#60A5FA] uppercase tracking-tighter">Scan History</h1>
          <div className="p-2 bg-white rounded-full shadow-sm opacity-0 pointer-events-none">
             <SlidersHorizontal size={20} />
          </div>
        </div>

        {/* Search & Filter */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <Input 
              placeholder="Search vendors..." 
              className="pl-10 h-12 rounded-2xl border-none shadow-sm focus-visible:ring-[#60A5FA]" 
            />
          </div>
          <Button variant="outline" className="h-12 w-12 rounded-2xl p-0 border-none shadow-sm bg-white">
            <Filter size={20} className="text-[#60A5FA]" />
          </Button>
        </div>
      </header>

      <main className="px-6 space-y-6">
        {/* Trend Summary */}
        <Card className="rounded-3xl border-none shadow-lg bg-[#60A5FA] overflow-hidden relative">
          <CardHeader className="p-6 pb-0">
             <CardTitle className="text-[10px] font-black text-white/60 uppercase tracking-widest flex items-center gap-2">
                <TrendingUp size={14} className="text-[#F5A623]" />
                30-Day Safety Trend
             </CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-2">
             <HistoryTrendChart data={trendData} />
          </CardContent>
          <div className="absolute top-[-20px] right-[-20px] w-32 h-32 bg-white/5 rounded-full blur-3xl" />
        </Card>

        {/* List */}
        <div className="space-y-4">
           {scans && scans.length > 0 ? (
             scans.map((scan) => (
                <Link key={scan.id} href={`/history/${scan.id}`}>
                  <Card className="rounded-2xl border-none shadow-sm overflow-hidden hover:bg-slate-50 transition-colors">
                    <CardContent className="p-4 flex items-center gap-4">
                       <div className={cn(
                         "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
                         scan.result_tier === 'safe' ? "bg-blue-50 text-[#60A5FA]" : "bg-red-50 text-red-500"
                       )}>
                         {scan.result_tier === 'safe' ? <Shield size={24} /> : <AlertTriangle size={24} />}
                       </div>
                       <div className="flex-1 min-w-0">
                          <p className="font-bold text-slate-800 truncate">{scan.vendors?.name || 'Home Sample'}</p>
                          <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                             <Calendar size={10} />
                             {format(new Date(scan.created_at), 'MMM dd, yyyy')}
                          </div>
                       </div>
                       <div className="text-right">
                          <span className={cn(
                             "text-lg font-black leading-none block",
                             scan.result_tier === 'safe' ? "text-[#60A5FA]" : "text-red-500"
                          )}>
                             {scan.safety_score}%
                          </span>
                          <Badge variant="outline" className={cn(
                            "text-[8px] h-4 mt-1 px-1 tracking-tighter uppercase font-black",
                            scan.result_tier === 'safe' ? "border-[#60A5FA] text-[#60A5FA]" : "border-red-500 text-red-500"
                          )}>
                            {scan.result_tier}
                          </Badge>
                       </div>
                    </CardContent>
                  </Card>
                </Link>
             ))
           ) : (
             <div className="py-20 text-center flex flex-col items-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                   <Calendar size={32} className="text-slate-300" />
                </div>
                <h3 className="font-bold text-slate-400 uppercase tracking-widest text-sm">No scans found</h3>
                <p className="text-xs text-slate-300 mt-1">Your milk purity history will appear here.</p>
             </div>
           )}
        </div>
      </main>
    </div>
  )
}
