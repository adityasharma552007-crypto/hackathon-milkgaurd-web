import React from "react"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { ArrowLeft, Settings, MapPin, Bell, Globe, Shield, Info, BookOpen, FileText, ChevronRight } from "lucide-react"
import Link from "next/link"
import { SignOutButton } from "./SignOutButton"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default async function ProfilePage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  const { data: reports } = await supabase
    .from("fssai_reports")
    .select("*, scans(vendors(name))")
    .eq("user_id", user.id)

  const initials = profile?.full_name
    ? profile.full_name.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase()
    : "PK"

  const safeScans = profile?.safe_scans || 20
  const totalScans = profile?.total_scans || 24
  const unsafeScans = totalScans - safeScans

  return (
    <div className="min-h-screen bg-[#F7F9F8] pb-32">
      {/* Header Bar */}
      <header className="flex items-center justify-between p-6 pb-4 bg-[#F7F9F8]">
        <Link href="/home" className="text-[#1A6B4A] hover:bg-green-50 p-2 rounded-full transition-colors">
          <ArrowLeft size={24} />
        </Link>
        <h1 className="text-lg font-bold text-[#1A6B4A]">My Profile</h1>
        <button className="text-[#1A6B4A] hover:bg-green-50 p-2 rounded-full transition-colors">
          <Settings size={24} />
        </button>
      </header>

      <main className="px-4 space-y-4">
        {/* Profile Card */}
        <Card className="rounded-[40px] border-none shadow-sm pt-8 pb-8 text-center bg-white flex flex-col items-center">
          <div className="w-[64px] h-[64px] rounded-full bg-[#1A6B4A] text-white flex flex-col items-center justify-center font-bold text-xl tracking-wider shadow-md">
            {initials}
          </div>
          <h2 className="text-[20px] font-bold text-slate-900 mt-4 leading-tight">
            {profile?.full_name || "Priya Kapoor"}
          </h2>
          <p className="text-[13px] text-slate-500 font-medium">
            {profile?.email || "priya.k@example.com"}
          </p>
          <div className="flex items-center justify-center gap-1 mt-1 text-[#1A6B4A]">
            <MapPin size={13} className="fill-[#1A6B4A] text-white" />
            <span className="text-[13px] uppercase font-bold tracking-widest text-[#1A6B4A]">
              {profile?.area || "MANSAROVAR"}, {profile?.city || "JAIPUR"}
            </span>
          </div>
          <button className="mt-6 px-6 py-2 rounded-full border border-[#1A6B4A] text-[#1A6B4A] text-sm font-bold tracking-wide hover:bg-green-50 transition-colors">
            Edit Profile
          </button>
        </Card>

        {/* Stats Section */}
        <div className="flex justify-between gap-3">
          <Card className="flex-1 rounded-[24px] border-none shadow-sm py-5 flex flex-col items-center justify-center bg-white">
            <span className="text-[22px] font-black text-slate-900 leading-none">{totalScans}</span>
            <span className="text-[9px] uppercase font-black text-slate-900 tracking-widest mt-2">TOTAL SCANS</span>
          </Card>
          <Card className="flex-1 rounded-[24px] border-none shadow-sm py-5 flex flex-col items-center justify-center bg-white">
            <span className="text-[22px] font-black text-[#1A6B4A] leading-none">{safeScans}</span>
            <span className="text-[9px] uppercase font-black text-slate-900 tracking-widest mt-2">SAFE</span>
          </Card>
          <Card className="flex-1 rounded-[24px] border-none shadow-sm py-5 flex flex-col items-center justify-center bg-white">
            <span className="text-[22px] font-black text-red-600 leading-none">{unsafeScans > 0 ? unsafeScans : 4}</span>
            <span className="text-[9px] uppercase font-black text-slate-900 tracking-widest mt-2">UNSAFE</span>
          </Card>
        </div>

        {/* My FSSAI Reports */}
        <section className="mt-8">
          <div className="flex items-center justify-between px-2 mb-4">
            <h3 className="font-bold text-slate-900 text-lg">My FSSAI Reports 📋</h3>
            <Link href="#" className="text-xs font-bold text-[#1A6B4A] hover:underline">View All</Link>
          </div>
          <div className="space-y-3">
            {(!reports || reports.length === 0) && (
              <>
                <Card className="rounded-[24px] border-none shadow-sm p-4 flex items-center justify-between bg-white">
                  <div className="flex items-center gap-4">
                    <div className="w-[52px] h-[52px] bg-orange-100 rounded-[18px] flex items-center justify-center text-orange-600">
                      <FileText size={24} className="fill-orange-600 space-y-0 text-orange-100" />
                    </div>
                    <div>
                      <p className="font-bold text-[15px] text-slate-900">MG-2026-00471</p>
                      <p className="text-[12px] text-slate-500 font-medium">Ramesh Dairy • Mar 24</p>
                    </div>
                  </div>
                  <Badge className="bg-[#fde6cd] hover:bg-[#fde6cd] text-[#c47721] border-none font-bold text-[10px] uppercase tracking-widest px-3 py-1">
                    SUBMITTED
                  </Badge>
                </Card>
                <Card className="rounded-[24px] border-none shadow-sm p-4 flex items-center justify-between bg-white">
                  <div className="flex items-center gap-4">
                    <div className="w-[52px] h-[52px] bg-[#3ff790] rounded-[18px] flex items-center justify-center text-[#1A6B4A]">
                      <Shield size={24} className="fill-[#1A6B4A] text-[#3ff790]" />
                    </div>
                    <div>
                      <p className="font-bold text-[15px] text-slate-900">MG-2026-00382</p>
                      <p className="text-[12px] text-slate-500 font-medium">Urban Fresh • Feb 12</p>
                    </div>
                  </div>
                  <Badge className="bg-[#3ff790] hover:bg-[#3ff790] text-[#1A6B4A] border-none font-bold text-[10px] uppercase tracking-widest px-3 py-1">
                    PROCESSED
                  </Badge>
                </Card>
              </>
            )}

            {reports && reports.map((r: any) => {
               const vendorName = r.scans?.vendors?.name || "Unknown Vendor"
               const dateStr = new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
               return (
                 <Card key={r.id} className="rounded-[24px] border-none shadow-sm p-4 flex items-center justify-between bg-white">
                   <div className="flex items-center gap-4">
                     <div className={`w-[52px] h-[52px] rounded-[18px] flex items-center justify-center ${r.status === 'processed' ? 'bg-[#3ff790] text-[#1A6B4A]' : 'bg-orange-100 text-orange-600'}`}>
                       {r.status === 'processed' ? <Shield size={24} className="fill-[#1A6B4A] text-[#3ff790]" /> : <FileText size={24} className="fill-orange-600 text-orange-100" />}
                     </div>
                     <div>
                       <p className="font-bold text-[15px] text-slate-900">{r.report_number || `MG-2026-${r.id.substring(0,5)}`}</p>
                       <p className="text-[12px] text-slate-500 font-medium">{vendorName} • {dateStr}</p>
                     </div>
                   </div>
                   <Badge className={`${r.status === 'processed' ? 'bg-[#3ff790] text-[#1A6B4A]' : 'bg-[#fde6cd] text-[#c47721]'} hover:opacity-90 border-none font-bold text-[10px] uppercase tracking-widest px-3 py-1`}>
                     {r.status || 'SUBMITTED'}
                   </Badge>
                 </Card>
               )
            })}
          </div>
        </section>

        {/* Account Settings */}
        <section className="mt-10">
          <div className="flex items-center px-6 py-2 mb-2">
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-widest text-slate-500">ACCOUNT SETTINGS</h3>
          </div>
          <Card className="rounded-[32px] border-none shadow-sm bg-white overflow-hidden pb-2 mx-1">
            <div className="flex flex-col pt-2">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-50 cursor-pointer hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-4">
                  <Bell size={20} className="text-slate-700 fill-slate-700" />
                  <span className="font-bold text-[15px] text-slate-900">Notifications</span>
                </div>
                <ChevronRight size={18} className="text-slate-300" />
              </div>
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-50 cursor-pointer hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-4">
                  <Globe size={20} className="text-slate-700" />
                  <span className="font-bold text-[15px] text-slate-900">Language</span>
                </div>
                <div className="flex items-center gap-2 bg-[#EAF8F1] px-3 py-1 rounded-full">
                  <span className="text-[#1A6B4A] text-[12px] font-medium">English</span>
                </div>
              </div>
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-50 cursor-pointer hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-4">
                  <Shield size={20} className="text-slate-700 fill-slate-700" />
                  <span className="font-bold text-[15px] text-slate-900">Privacy</span>
                </div>
                <ChevronRight size={18} className="text-slate-300" />
              </div>
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-50 cursor-pointer hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-4">
                  <Info size={20} className="text-slate-700 fill-slate-700" />
                  <span className="font-bold text-[15px] text-slate-900">About</span>
                </div>
                <ChevronRight size={18} className="text-slate-300" />
              </div>
              <div className="flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-slate-50 transition-colors mb-2">
                <div className="flex items-center gap-4">
                  <BookOpen size={20} className="text-slate-700 fill-slate-700" />
                  <span className="font-bold text-[15px] text-slate-900">FSSAI Guidelines</span>
                </div>
                <div className="w-6 h-6 rounded flex items-center justify-center border border-slate-300 hover:bg-slate-100">
                   <ChevronRight size={14} className="text-slate-400 -rotate-45" />
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* Sign Out Button integrated */}
        <div className="mt-8 mb-8 pb-4">
          <SignOutButton />
        </div>

      </main>
    </div>
  )
}
