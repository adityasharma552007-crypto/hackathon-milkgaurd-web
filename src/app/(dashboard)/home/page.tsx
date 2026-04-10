import { createClient } from "@/lib/supabase/server"
import { Shield, ArrowRight, Activity, MapPin, Zap, Bot, AlertTriangle, BrainCircuit } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Metadata } from "next"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { homeMetadata } from "@/app/page.metadata"

export const metadata: Metadata = homeMetadata

export default async function HomePage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  // Fetch profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Fetch recent scans
  const { data: scans } = await supabase
    .from('scans')
    .select('*, vendors(name)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(3)

  // Fetch flagged vendors in user's city
  const { count: flaggedCount } = await supabase
    .from('vendors')
    .select('id', { count: 'exact', head: true })
    .eq('city', profile?.city || 'Jaipur')
    .eq('is_flagged', true)

  const stats = [
    { label: "Total Scans", value: profile?.total_scans || 0, icon: Activity, color: "text-blue-400" },
    { label: "Safe Milk", value: profile?.safe_scans || 0, icon: Shield, color: "text-[#60A5FA]" },
  ]

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="p-6 pb-2 pt-12 flex items-center justify-between">
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Welcome back</p>
          <h1 className="text-2xl font-black text-[#60A5FA] tracking-tighter uppercase leading-none">
            {profile?.full_name?.split(' ')[0] || 'User'}
          </h1>
        </div>
        <Link href="/chat" className="flex items-center gap-2 bg-gradient-to-br from-blue-50 to-indigo-50 px-4 py-2 rounded-2xl shadow-sm border border-blue-100 hover:shadow-md hover:scale-105 transition-all group">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#60A5FA] to-[#3B82F6] flex items-center justify-center shrink-0 shadow-inner">
            <Bot className="text-[#F5A623]" size={16} />
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] font-black uppercase tracking-widest text-[#60A5FA]/60 leading-none mb-0.5">MilkGuard</span>
            <span className="text-xs font-black uppercase tracking-wider text-[#60A5FA] leading-none">Ask AI</span>
          </div>
        </Link>
      </header>

      <main className="flex-1 p-6 pt-0 space-y-6">
        {/* Flagged Vendors Alert */}
        {flaggedCount && flaggedCount > 0 ? (
          <Link href="/map?filter=flagged" className="block mt-4 mb-2">
            <div className="bg-red-50 border border-red-100 rounded-2xl p-4 flex items-center justify-between group hover:bg-red-100 transition-colors shadow-sm shadow-red-100/50">
               <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                     <AlertTriangle size={14} className="text-red-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest leading-tight">
                      Community Alert
                    </p>
                    <p className="text-[11px] font-black text-red-600 uppercase tracking-tight leading-tight">
                      ⚠️ {flaggedCount} vendors in your area are flagged 
                    </p>
                  </div>
               </div>
               <ArrowRight size={16} className="text-red-400 group-hover:translate-x-1 transition-transform shrink-0" />
            </div>
          </Link>
        ) : null}

        {/* AI Insights Link */}
        <Link href="/insights" className="block mb-6">
           <div className="bg-slate-800 rounded-3xl p-5 relative overflow-hidden group hover:scale-[1.02] transition-transform shadow-xl shadow-slate-200">
              <div className="flex justify-between items-center relative z-10">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-700 rounded-2xl flex items-center justify-center shrink-0">
                       <BrainCircuit size={24} className="text-[#60A5FA]" />
                    </div>
                    <div>
                       <h3 className="text-white font-black uppercase tracking-tighter text-lg leading-tight flex items-center gap-2">
                          AI Insights <span className="bg-[#60A5FA] text-white text-[8px] px-1.5 py-0.5 rounded uppercase tracking-widest leading-none">New</span>
                       </h3>
                       <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-0.5">City-wide Risk Analysis</p>
                    </div>
                 </div>
                 <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center group-hover:bg-[#60A5FA] transition-colors">
                    <ArrowRight size={14} className="text-white" />
                 </div>
              </div>
              <div className="absolute top-[-20px] right-[-20px] w-32 h-32 bg-[#60A5FA]/20 rounded-full blur-3xl pointer-events-none" />
           </div>
        </Link>

        {/* Quick Action Card */}
        <Card className="bg-[#60A5FA] border-none shadow-xl shadow-blue-100/50 rounded-3xl overflow-hidden relative">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-md">
                <Shield className="text-white" size={32} />
              </div>
              <Badge variant="outline" className="text-white border-white/20 bg-white/5 backdrop-blur-md">AI Active</Badge>
            </div>
            <h2 className="text-white text-3xl font-black uppercase tracking-tighter mb-2 leading-none">
              Scan Your <br />Milk Now
            </h2>
            <p className="text-white/60 text-sm mb-6 max-w-[200px]">
              Verify purity in 8 seconds using AI spectral analysis.
            </p>
            <Button asChild className="w-full h-14 bg-[#F5A623] hover:bg-[#E09512] text-white font-black text-lg rounded-full group">
              <Link href="/scan">
                START SCANNING
                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </CardContent>
          <div className="absolute top-[-20px] right-[-20px] w-40 h-40 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          {stats.map((stat) => (
            <Card key={stat.label} className="border-none shadow-sm rounded-2xl bg-white">
              <CardContent className="p-4 flex flex-col items-center text-center">
                <stat.icon className={cn("mb-2", stat.color)} size={24} />
                <span className="text-2xl font-black text-slate-800 leading-none">{stat.value}</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">{stat.label}</span>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Scans */}
        <div className="space-y-4">
          <div className="flex justify-between items-end">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Recent Activity</h3>
            <Link href="/history" className="text-[10px] font-bold text-[#60A5FA] uppercase underline underline-offset-4">View All</Link>
          </div>
          
          <div className="space-y-3">
            {scans && scans.length > 0 ? (
              scans.map((scan) => (
                <Link key={scan.id} href={`/history/${scan.id}`}>
                  <Card className="border-none shadow-sm rounded-2xl bg-white hover:bg-slate-50 transition-colors mb-3">
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
                        scan.result_tier === 'safe' ? "bg-blue-50 text-[#60A5FA]" : "bg-red-50 text-red-500"
                      )}>
                        {scan.result_tier === 'safe' ? <Shield size={24} /> : <Activity size={24} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-800 truncate">{scan.vendors?.name || 'Home Sample'}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">{format(new Date(scan.created_at), 'dd MMM, hh:mm a')}</p>
                      </div>
                      <div className="text-right">
                        <span className={cn(
                          "text-lg font-black leading-none block",
                          scan.result_tier === 'safe' ? "text-[#60A5FA]" : "text-red-500"
                        )}>
                          {scan.safety_score}%
                        </span>
                        <span className="text-[9px] font-black uppercase text-slate-400 tracking-tighter">Safety</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))
            ) : (
              <div className="py-12 text-center bg-white rounded-3xl border border-dashed border-slate-200">
                <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">No scans yet</p>
                <p className="text-slate-300 text-xs mt-1">Start your first scan to see results</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
