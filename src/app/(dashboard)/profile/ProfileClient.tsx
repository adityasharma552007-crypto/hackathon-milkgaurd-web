"use client"

import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Settings, MapPin, Bell, Globe, Shield, Info, BookOpen, FileText, ChevronRight } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { SignOutButton } from "./SignOutButton"
import { BottomSheet } from "@/components/ui/BottomSheet"

interface ProfileClientProps {
  user: {
    id: string
    email: string
    fullName: string
    phone: string
    city: string
    area: string
    totalScans: number
    safeScans: number
    unsafeScans: number
    createdAt: string
  }
  reports: Array<{
    id: string
    complaint_ref: string | null
    status: string
    auto_triggered: boolean
    created_at: string
    vendors: {
      name: string
      area: string
    } | null
  }>
}

export default function ProfileClient({ user, reports }: ProfileClientProps) {
  const router = useRouter()
  const supabase = createClient()
  
  // States
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    fullName: user.fullName || "",
    phone: user.phone || "",
    city: user.city || "",
    area: user.area || ""
  })
  
  const [sheetOpen, setSheetOpen] = useState<'notifications' | 'language' | 'privacy' | 'about' | 'fssai' | null>(null)
  
  // Sheet States
  const [notifPrefs, setNotifPrefs] = useState({
    area: true,
    scan: true,
    fssai: true
  })
  const [language, setLanguage] = useState('English')

  // Calculated values
  const initials = user.fullName
    .split(' ')
    .filter(Boolean)
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || (user.email ? user.email[0].toUpperCase() : "U")

  // Handlers
  const handleSaveProfile = async () => {
    const { error } = await supabase
      .from('profiles')
      .update({ 
        full_name: editForm.fullName,
        phone: editForm.phone, 
        city: editForm.city, 
        area: editForm.area 
      })
      .eq('id', user.id)
    
    if (error) {
      alert("Error saving profile")
    } else {
      alert("Profile updated ✅")
      setIsEditing(false)
      router.refresh()
    }
  }

  const handleResetPassword = async () => {
    await supabase.auth.resetPasswordForEmail(
      user.email,
      { redirectTo: window.location.origin + '/auth/reset-password' }
    )
    alert("Reset link sent to your email ✅")
  }

  return (
    <div className="min-h-screen bg-[#F7F9F8] pb-32">
      {/* Header Bar */}
      <header className="flex items-center justify-center p-6 pb-4 bg-[#F7F9F8]">
        <h1 className="text-lg font-bold text-[#1A6B4A]">My Profile</h1>
      </header>

      <main className="px-4 space-y-4">
        {/* Profile Card */}
        <Card className="rounded-[40px] border-none shadow-sm pt-8 pb-8 text-center bg-white flex flex-col items-center">
          {isEditing ? (
            <div className="w-full px-6 flex flex-col gap-3 text-left">
              <h3 className="font-bold text-slate-900 mb-2">Edit Profile</h3>
              <input 
                className="w-full h-12 px-4 rounded-xl border border-slate-200 text-sm focus:border-[#1A6B4A] focus:outline-none"
                placeholder="Full Name" 
                value={editForm.fullName} 
                onChange={e => setEditForm({...editForm, fullName: e.target.value})} 
              />
              <input 
                className="w-full h-12 px-4 rounded-xl border border-slate-200 text-sm focus:border-[#1A6B4A] focus:outline-none"
                placeholder="Phone" 
                value={editForm.phone} 
                onChange={e => setEditForm({...editForm, phone: e.target.value})} 
              />
              <input 
                className="w-full h-12 px-4 rounded-xl border border-slate-200 text-sm focus:border-[#1A6B4A] focus:outline-none"
                placeholder="City" 
                value={editForm.city} 
                onChange={e => setEditForm({...editForm, city: e.target.value})} 
              />
              <input 
                className="w-full h-12 px-4 rounded-xl border border-slate-200 text-sm focus:border-[#1A6B4A] focus:outline-none"
                placeholder="Area" 
                value={editForm.area} 
                onChange={e => setEditForm({...editForm, area: e.target.value})} 
              />
              <div className="flex gap-2 mt-4">
                <button 
                  onClick={() => setIsEditing(false)}
                  className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors"
                >Cancel</button>
                <button 
                  onClick={handleSaveProfile}
                  className="flex-1 py-3 rounded-xl bg-[#1A6B4A] text-white font-bold hover:bg-[#124b33] transition-colors"
                >Save</button>
              </div>
            </div>
          ) : (
            <>
              <div className="w-[64px] h-[64px] rounded-full bg-[#1A6B4A] text-white flex items-center justify-center font-bold text-xl tracking-wider shadow-md">
                {initials}
              </div>
              <h2 className="text-[20px] font-bold text-slate-900 mt-4 leading-tight">
                {user.fullName || "MilkGuard User"}
              </h2>
              <p className="text-[13px] text-slate-500 font-medium mt-1">
                {user.email}
              </p>
              {(user.city || user.area) && (
                <div className="flex items-center justify-center gap-1 mt-2 text-[#1A6B4A]">
                  <MapPin size={13} className="fill-[#1A6B4A] text-white" />
                  <span className="text-[13px] uppercase font-bold tracking-widest text-[#1A6B4A]">
                    {[user.area, user.city].filter(Boolean).join(", ")}
                  </span>
                </div>
              )}
              <button 
                onClick={() => setIsEditing(true)}
                className="mt-6 px-6 py-2 rounded-full border border-[#1A6B4A] text-[#1A6B4A] text-[13px] font-bold tracking-wide hover:bg-green-50 transition-colors"
              >
                Edit Profile
              </button>
            </>
          )}
        </Card>

        {/* Scan Stats Strip */}
        <div className="flex justify-between gap-3 pt-2">
          <Card className="flex-1 rounded-[24px] border-none shadow-sm py-5 flex flex-col items-center justify-center bg-white">
            <span className="text-[22px] font-black text-slate-900 leading-none">{user.totalScans}</span>
            <span className="text-[9px] uppercase font-black text-slate-900 tracking-widest mt-2">TOTAL SCANS</span>
          </Card>
          <Card className="flex-1 rounded-[24px] border-none shadow-sm py-5 flex flex-col items-center justify-center bg-white">
            <span className="text-[22px] font-black text-[#1A6B4A] leading-none">{user.safeScans}</span>
            <span className="text-[9px] uppercase font-black text-slate-900 tracking-widest mt-2">SAFE</span>
          </Card>
          <Card className="flex-1 rounded-[24px] border-none shadow-sm py-5 flex flex-col items-center justify-center bg-white">
            <span className="text-[22px] font-black text-[#D32F2F] leading-none">{user.unsafeScans}</span>
            <span className="text-[9px] uppercase font-black text-slate-900 tracking-widest mt-2">UNSAFE</span>
          </Card>
        </div>

        {/* FSSAI Reports */}
        <section className="mt-8">
          <div className="flex items-center justify-between px-2 mb-4">
            <h3 className="font-bold text-slate-900 text-lg">My FSSAI Reports 📋</h3>
            <button className="text-[13px] font-bold text-[#1A6B4A] hover:underline">View All</button>
          </div>
          <div className="space-y-3">
            {reports.length === 0 ? (
              <Card className="rounded-[24px] border-none shadow-sm p-8 flex flex-col items-center justify-center bg-white text-center">
                <div className="w-[52px] h-[52px] bg-[#F7F9F8] rounded-full flex items-center justify-center mb-4 border border-slate-100">
                  <Shield size={26} className="text-slate-400" />
                </div>
                <p className="font-bold text-[15px] text-slate-900 mb-1">No reports filed yet</p>
                <p className="text-[12px] text-slate-500 font-medium px-4">
                  Reports are auto-created for hazardous scans
                </p>
              </Card>
            ) : (
              reports.map(report => (
                <Card key={report.id} className="rounded-[24px] border-none shadow-sm p-4 flex items-center justify-between bg-white">
                  <div className="flex items-center gap-4">
                    <div className={`w-[52px] h-[52px] rounded-[18px] flex items-center justify-center ${report.status === 'resolved' ? 'bg-[#3ff790] text-[#1A6B4A]' : 'bg-amber-100 text-amber-600'}`}>
                      {report.status === 'resolved' ? <Shield size={24} className="fill-[#1A6B4A] text-[#3ff790]" /> : <FileText size={24} className="fill-amber-600 text-amber-100" />}
                    </div>
                    <div>
                      <p className="font-bold text-[15px] text-[#1A6B4A]">{report.complaint_ref || `MG-2026-${report.id.slice(0,5)}`}</p>
                      <p className="text-[12px] text-slate-500 font-medium">
                        {report.vendors?.name ?? 'Unknown vendor'} · {report.vendors?.area || 'Unknown area'}
                      </p>
                      <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                        {new Date(report.created_at).toLocaleDateString('en-IN')}
                      </p>
                    </div>
                  </div>
                  <Badge className={`border-none font-bold text-[10px] uppercase tracking-widest px-3 py-1 ${
                    report.status === 'submitted' ? 'bg-amber-100 text-amber-800 hover:bg-amber-100' :
                    report.status === 'under_review' ? 'bg-blue-100 text-blue-800 hover:bg-blue-100' :
                    'bg-[#3ff790] text-[#1A6B4A] hover:bg-[#3ff790]'
                  }`}>
                    {report.status.replace('_', ' ')}
                  </Badge>
                </Card>
              ))
            )}
          </div>
        </section>

        {/* Account Settings */}
        <section className="mt-10">
          <div className="flex items-center px-6 py-2 mb-2">
            <h3 className="font-bold text-slate-900 text-lg">Account Settings ⚙️</h3>
          </div>
          <Card className="rounded-[32px] border-none shadow-sm bg-white overflow-hidden pb-2 mx-1">
            <div className="flex flex-col pt-2">
              <div onClick={() => setSheetOpen('notifications')} className="flex items-center justify-between px-6 py-4 border-b border-slate-50 cursor-pointer hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-4">
                  <Bell size={20} className="text-slate-700 fill-slate-700" />
                  <span className="font-bold text-[15px] text-slate-900">Notifications</span>
                </div>
                <ChevronRight size={18} className="text-slate-300" />
              </div>
              <div onClick={() => setSheetOpen('language')} className="flex items-center justify-between px-6 py-4 border-b border-slate-50 cursor-pointer hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-4">
                  <Globe size={20} className="text-slate-700" />
                  <span className="font-bold text-[15px] text-slate-900">Language</span>
                </div>
                <div className="flex items-center gap-2 bg-[#EAF8F1] px-3 py-1 rounded-full">
                  <span className="text-[#1A6B4A] text-[12px] font-bold">{language}</span>
                </div>
              </div>
              <div onClick={() => setSheetOpen('privacy')} className="flex items-center justify-between px-6 py-4 border-b border-slate-50 cursor-pointer hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-4">
                  <Shield size={20} className="text-slate-700 fill-slate-700" />
                  <span className="font-bold text-[15px] text-slate-900">Privacy & Security</span>
                </div>
                <ChevronRight size={18} className="text-slate-300" />
              </div>
              <div onClick={() => setSheetOpen('about')} className="flex items-center justify-between px-6 py-4 border-b border-slate-50 cursor-pointer hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-4">
                  <Info size={20} className="text-slate-700 fill-slate-700" />
                  <span className="font-bold text-[15px] text-slate-900">About MilkGuard</span>
                </div>
                <ChevronRight size={18} className="text-slate-300" />
              </div>
              <div onClick={() => setSheetOpen('fssai')} className="flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-slate-50 transition-colors mb-2">
                <div className="flex items-center gap-4">
                  <BookOpen size={20} className="text-slate-700 fill-slate-700" />
                  <span className="font-bold text-[15px] text-slate-900">FSSAI Guidelines</span>
                </div>
                <div className="w-6 h-6 rounded flex items-center justify-center border border-slate-200 bg-slate-50 hover:bg-slate-100">
                   <ChevronRight size={14} className="text-slate-400" />
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* Sign Out Button */}
        <div className="mt-8 mb-8 pb-4">
          <SignOutButton />
        </div>

      </main>

      {/* BOTTOM SHEETS */}
      <BottomSheet isOpen={sheetOpen === 'notifications'} onClose={() => setSheetOpen(null)} title="Notifications">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <span className="font-medium text-slate-900">Area adulteration alerts</span>
            <input type="checkbox" checked={notifPrefs.area} onChange={e => {setNotifPrefs({...notifPrefs, area: e.target.checked}); localStorage.setItem('notif_prefs', JSON.stringify({...notifPrefs, area: e.target.checked}))}} className="w-5 h-5 accent-[#1A6B4A]" />
          </div>
          <div className="flex items-center justify-between">
            <span className="font-medium text-slate-900">Scan reminders</span>
            <input type="checkbox" checked={notifPrefs.scan} onChange={e => {setNotifPrefs({...notifPrefs, scan: e.target.checked}); localStorage.setItem('notif_prefs', JSON.stringify({...notifPrefs, scan: e.target.checked}))}} className="w-5 h-5 accent-[#1A6B4A]" />
          </div>
          <div className="flex items-center justify-between">
            <span className="font-medium text-slate-900">FSSAI report updates</span>
            <input type="checkbox" checked={notifPrefs.fssai} onChange={e => {setNotifPrefs({...notifPrefs, fssai: e.target.checked}); localStorage.setItem('notif_prefs', JSON.stringify({...notifPrefs, fssai: e.target.checked}))}} className="w-5 h-5 accent-[#1A6B4A]" />
          </div>
        </div>
      </BottomSheet>

      <BottomSheet isOpen={sheetOpen === 'language'} onClose={() => setSheetOpen(null)} title="Select Language">
        <div className="space-y-4">
           {['English', 'हिंदी (Hindi)', 'ਪੰਜਾਬੀ (Punjabi)', 'मराठी (Marathi)'].map(lang => (
             <div 
               key={lang} 
               onClick={() => {
                 setLanguage(lang.split(' ')[0])
                 localStorage.setItem('app_language', lang.split(' ')[0])
                 alert("Language preference saved")
                 setSheetOpen(null)
               }}
               className="p-4 rounded-xl border border-slate-200 text-[#1A6B4A] font-bold hover:bg-green-50 hover:border-green-300 cursor-pointer transition-colors"
             >
               🇮🇳 {lang}
             </div>
           ))}
        </div>
      </BottomSheet>

      <BottomSheet isOpen={sheetOpen === 'privacy'} onClose={() => setSheetOpen(null)} title="Privacy & Security">
        <div className="space-y-6">
          <div>
            <h4 className="font-bold text-slate-900 mb-2">Your Data</h4>
            <p className="text-sm text-slate-500 leading-relaxed">
              MilkGuard stores your scan history securely in Supabase. Your data is never shared with third parties.
            </p>
          </div>
          <div className="pt-6 border-t border-slate-100">
            <h4 className="font-bold text-slate-900 mb-3">Change Password</h4>
            <div className="flex flex-col gap-3">
              <input readOnly value={user.email} className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 text-sm focus:outline-none" />
              <button onClick={handleResetPassword} className="w-full h-12 rounded-xl bg-[#1A6B4A] text-white font-bold tracking-wide hover:bg-[#124b33] transition-colors">
                Send Reset Link
              </button>
            </div>
          </div>
        </div>
      </BottomSheet>

      <BottomSheet isOpen={sheetOpen === 'about'} onClose={() => setSheetOpen(null)} title="About MilkGuard">
        <div className="flex flex-col items-center text-center space-y-4 pt-4">
          <div className="w-20 h-20 bg-[#1A6B4A] rounded-full flex items-center justify-center shadow-md">
            <Shield className="text-white" size={40} />
          </div>
          <div>
            <h3 className="text-xl font-black text-[#1A6B4A]">MilkGuard</h3>
            <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">Version 1.0.0 (Hackathon Edition)</p>
          </div>
          <p className="text-[15px] text-slate-600 leading-relaxed px-4 py-2">
            MilkGuard is a contactless milk adulteration detection system using NIR spectral analysis and AI.
          </p>
          <div className="bg-slate-50 w-full py-4 rounded-xl border border-slate-100 mt-2">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Built with</p>
            <p className="text-sm font-bold text-slate-800">Next.js 14 | Supabase | Vercel</p>
          </div>
          <p className="text-sm font-bold text-[#1A6B4A] pt-4 leading-relaxed">
            Protecting families from adulterated milk — one scan at a time. 🥛
          </p>
        </div>
      </BottomSheet>

      <BottomSheet isOpen={sheetOpen === 'fssai'} onClose={() => setSheetOpen(null)} title="FSSAI Safety Standards 📋">
        <div className="space-y-4">
          <table className="w-full text-left text-[13px]">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="py-3 font-bold">Adulterant</th>
                <th className="py-3 font-bold">Safe Limit</th>
                <th className="py-3 font-bold">Risk Level</th>
              </tr>
            </thead>
            <tbody className="text-slate-800">
              <tr className="border-b border-slate-50"><td className="py-3">Water Addition</td><td>&lt; 3.0%</td><td className="text-amber-600 font-bold">Substandard</td></tr>
              <tr className="border-b border-slate-50"><td className="py-3">Urea</td><td>&lt; 0.07%</td><td className="text-red-500 font-bold">Unsafe</td></tr>
              <tr className="border-b border-slate-50"><td className="py-3">Detergent</td><td>Zero</td><td className="text-red-600 font-bold">Hazardous</td></tr>
              <tr className="border-b border-slate-50"><td className="py-3">Formalin</td><td>Zero</td><td className="text-red-600 font-bold">Hazardous</td></tr>
              <tr className="border-b border-slate-50"><td className="py-3">Starch</td><td>Zero</td><td className="text-slate-600 font-bold">Misbranded</td></tr>
              <tr className="border-b border-slate-50"><td className="py-3">Neutralizers</td><td>&lt; 0.05%</td><td className="text-red-500 font-bold">Unsafe</td></tr>
              <tr><td className="py-3">Fat Content</td><td>&ge; 3.5%</td><td className="text-amber-600 font-bold">Substandard</td></tr>
            </tbody>
          </table>
          <p className="text-[11px] text-slate-400 font-medium pt-4 text-center border-t border-slate-100">
            FSSAI Food Safety Standards 2025-26<br/>For reporting call 1800-112-100
          </p>
        </div>
      </BottomSheet>
    </div>
  )
}
