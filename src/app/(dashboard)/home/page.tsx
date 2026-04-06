import { createClient } from "@/lib/supabase/server"
import { Shield, ArrowRight, Activity, MapPin, Zap, Bot } from "lucide-react"
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

  const stats = [
    { label: "Total Scans", value: profile?.total_scans || 0, icon: Activity, color: "text-blue-500" },
    { label: "Safe Milk", value: profile?.safe_scans || 0, icon: Shield, color: "text-[#1A6B4A]" },
  ]

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="p-6 pb-2 pt-12 flex items-center justify-between">
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Welcome back</p>
          <h1 className="text-2xl font-black text-[#1A6B4A] tracking-tighter uppercase leading-none">
            {profile?.full_name?.split(' ')[0] || 'User'}
          </h1>
        </div>
        <Link href="/chat" className="flex items-center gap-2 bg-gradient-to-br from-green-50 to-emerald-50 px-4 py-2 rounded-2xl shadow-sm border border-green-100 hover:shadow-md hover:scale-105 transition-all group">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1A6B4A] to-[#124b33] flex items-center justify-center shrink-0 shadow-inner">
            <Bot className="text-[#F5A623]" size={16} />
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] font-black uppercase tracking-widest text-[#1A6B4A]/60 leading-none mb-0.5">MilkGuard</span>
            <span className="text-xs font-black uppercase tracking-wider text-[#1A6B4A] leading-none">Ask AI</span>
          </div>
        </Link>
      </header>

      <main className="flex-1 p-6 space-y-6">
        {/* Quick Action Card */}
        <Card className="bg-[#1A6B4A] border-none shadow-xl shadow-green-100/50 rounded-3xl overflow-hidden relative">
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
            <Link href="/history" className="text-[10px] font-bold text-[#1A6B4A] uppercase underline underline-offset-4">View All</Link>
          </div>
          
          <div className="space-y-3">
            {scans && scans.length > 0 ? (
              scans.map((scan) => (
                <Link key={scan.id} href={`/history/${scan.id}`}>
                  <Card className="border-none shadow-sm rounded-2xl bg-white hover:bg-slate-50 transition-colors mb-3">
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
                        scan.result_tier === 'safe' ? "bg-green-50 text-[#1A6B4A]" : "bg-red-50 text-red-500"
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
                          scan.result_tier === 'safe' ? "text-[#1A6B4A]" : "text-red-500"
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
