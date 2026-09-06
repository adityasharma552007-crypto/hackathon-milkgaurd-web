"use client"

import React, { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  MapPin,
  Bell,
  Globe,
  Shield,
  Info,
  BookOpen,
  FileText,
  ChevronDown,
  User as UserIcon,
  Phone,
  Building2,
  CheckCircle2,
  AlertTriangle,
  Activity,
  Edit3,
  X,
  Save,
  Loader2,
  Lock,
  Sparkles,
  ShieldCheck,
  Check,
  Cpu,
  QrCode
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { SignOutButton } from "./SignOutButton"
import { toast } from "sonner"
import Link from "next/link"

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

const LANGUAGES = [
  { id: 'English', label: 'English', native: 'English', flag: '🇬🇧' },
  { id: 'Hindi', label: 'Hindi', native: 'हिंदी', flag: '🇮🇳' },
  { id: 'Punjabi', label: 'Punjabi', native: 'ਪੰਜਾਬੀ', flag: '🇮🇳' },
  { id: 'Marathi', label: 'Marathi', native: 'मराठी', flag: '🇮🇳' },
  { id: 'Gujarati', label: 'Gujarati', native: 'ગુજરાતી', flag: '🇮🇳' },
]

import { useTranslation } from "@/lib/i18n/useTranslation"
import { type SupportedLanguage } from "@/store/useLanguageStore"

export default function ProfileClient({ user, reports }: ProfileClientProps) {
  const router = useRouter()
  const supabase = createClient()
  const { t, language, setLanguage } = useTranslation()

  // States
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isResettingPassword, setIsResettingPassword] = useState(false)
  const [editForm, setEditForm] = useState({
    fullName: user.fullName || "",
    phone: user.phone || "",
    city: user.city || "",
    area: user.area || ""
  })

  // Which option card is currently popped up / expanded inline
  const [expandedOption, setExpandedOption] = useState<'notifications' | 'language' | 'privacy' | 'about' | 'fssai' | null>(null)

  // Preferences
  const [notifPrefs, setNotifPrefs] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('notif_prefs')
        if (saved) return JSON.parse(saved)
      } catch { /* fallback */ }
    }
    return { area: true, scan: true, fssai: true }
  })

  // Calculations
  const initials = user.fullName
    ? user.fullName
        .split(' ')
        .filter(Boolean)
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : user.email[0]?.toUpperCase() ?? 'U'

  const purityRate = user.totalScans > 0
    ? Math.round((user.safeScans / user.totalScans) * 100)
    : 100

  // Gauge calculation for purity circle
  const strokeDashoffset = 283 - (283 * (purityRate / 100))

  // Toggle option expansion
  const toggleOption = (option: 'notifications' | 'language' | 'privacy' | 'about' | 'fssai') => {
    setExpandedOption(prev => prev === option ? null : option)
  }

  // Handlers
  const handleSaveProfile = async () => {
    setIsSaving(true)
    try {
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
        toast.error(error.message || "Failed to update profile")
      } else {
        toast.success("Profile updated successfully")
        setIsEditing(false)
        router.refresh()
      }
    } catch (err: any) {
      toast.error(err.message || "An unexpected error occurred")
    } finally {
      setIsSaving(false)
    }
  }

  const handleResetPassword = async () => {
    setIsResettingPassword(true)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        user.email,
        { redirectTo: window.location.origin + '/auth/reset-password' }
      )
      if (error) {
        toast.error(error.message || "Failed to send reset link")
      } else {
        toast.success("Password reset link sent to your email")
      }
    } catch (err: any) {
      toast.error(err.message || "An error occurred")
    } finally {
      setIsResettingPassword(false)
    }
  }

  const updateNotifPref = (key: 'area' | 'scan' | 'fssai', value: boolean) => {
    const updated = { ...notifPrefs, [key]: value }
    setNotifPrefs(updated)
    try {
      localStorage.setItem('notif_prefs', JSON.stringify(updated))
    } catch { /* ignore */ }
    toast.success("Notification preferences updated")
  }

  const selectLanguage = (langId: string) => {
    setLanguage(langId as SupportedLanguage)
    toast.success(`Language set to ${langId}`)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-24">

      {/* ── Top Hero Profile Bento Card ── */}
      <Card className="relative overflow-hidden rounded-3xl border border-[#c4e7ff] bg-gradient-to-br from-[#eef4ff] via-white to-[#f0fdf4] ambient-shadow p-6 sm:p-8">
        {/* Soft Radial Ambient Auras */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#38bdf8]/15 rounded-full blur-3xl pointer-events-none -mr-24 -mt-24" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#30c5b3]/15 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

        <div className="relative z-10">
          {isEditing ? (
            /* ── Inline Edit Form ── */
            <div className="space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-[#d1e4ff]">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#00668a]/10 text-[#00668a] flex items-center justify-center">
                    <Edit3 size={16} />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-[#001d36] tracking-tight">{t('edit_profile', 'Edit Profile')}</h2>
                    <p className="text-xs text-[#51666d]">Update your contact and regional delivery details</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsEditing(false)}
                  className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#51666d] flex items-center gap-1.5">
                    <UserIcon size={13} className="text-[#00668a]" /> {t('full_name', 'Full Name')}
                  </label>
                  <input
                    className="w-full h-11 px-3.5 rounded-xl border border-[#d1e4ff] bg-white text-sm text-[#001d36] font-semibold focus:border-[#00668a] focus:ring-2 focus:ring-[#00668a]/15 focus:outline-none transition-all"
                    placeholder="e.g. Aditya Sharma"
                    value={editForm.fullName}
                    onChange={e => setEditForm({ ...editForm, fullName: e.target.value })}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#51666d] flex items-center gap-1.5">
                    <Phone size={13} className="text-[#00668a]" /> {t('phone_number', 'Phone Number')}
                  </label>
                  <input
                    className="w-full h-11 px-3.5 rounded-xl border border-[#d1e4ff] bg-white text-sm text-[#001d36] font-semibold focus:border-[#00668a] focus:ring-2 focus:ring-[#00668a]/15 focus:outline-none transition-all"
                    placeholder="e.g. +91 98765 43210"
                    value={editForm.phone}
                    onChange={e => setEditForm({ ...editForm, phone: e.target.value })}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#51666d] flex items-center gap-1.5">
                    <Building2 size={13} className="text-[#00668a]" /> {t('city', 'City')}
                  </label>
                  <input
                    className="w-full h-11 px-3.5 rounded-xl border border-[#d1e4ff] bg-white text-sm text-[#001d36] font-semibold focus:border-[#00668a] focus:ring-2 focus:ring-[#00668a]/15 focus:outline-none transition-all"
                    placeholder="e.g. Jaipur"
                    value={editForm.city}
                    onChange={e => setEditForm({ ...editForm, city: e.target.value })}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#51666d] flex items-center gap-1.5">
                    <MapPin size={13} className="text-[#00668a]" /> {t('area', 'Area / Sector')}
                  </label>
                  <input
                    className="w-full h-11 px-3.5 rounded-xl border border-[#d1e4ff] bg-white text-sm text-[#001d36] font-semibold focus:border-[#00668a] focus:ring-2 focus:ring-[#00668a]/15 focus:outline-none transition-all"
                    placeholder="e.g. Malviya Nagar"
                    value={editForm.area}
                    onChange={e => setEditForm({ ...editForm, area: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setIsEditing(false)}
                  disabled={isSaving}
                  className="px-5 py-2.5 rounded-xl border border-[#d1e4ff] text-slate-600 font-bold text-xs hover:bg-slate-50 transition-colors"
                >
                  {t('cancel', 'Cancel')}
                </button>
                <button
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-xl bg-[#00668a] text-white font-bold text-xs hover:bg-[#004c69] transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
                >
                  {isSaving ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save size={14} />
                      <span>{t('save_changes', 'Save Changes')}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            /* ── Profile Presentation Mode ── */
            <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
                {/* Monogram Avatar */}
                <div className="relative shrink-0">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-tr from-[#00668a] via-[#0284c7] to-[#38bdf8] text-white flex items-center justify-center font-black text-2xl sm:text-3xl shadow-md border-2 border-white ring-4 ring-[#00668a]/10">
                    {initials}
                  </div>
                  <div
                    className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#10b981] border-2 border-white flex items-center justify-center text-white shadow-sm"
                    title="Verified Active Guardian"
                  >
                    <ShieldCheck size={14} />
                  </div>
                </div>

                {/* Identity & Metadata */}
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <h1 className="text-2xl sm:text-3xl font-black text-[#001d36] tracking-tight">
                      {user.fullName || "MilkGuard Consumer"}
                    </h1>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#e6f4ea] text-[#137333] text-[11px] font-bold border border-[#a8dab5]">
                      <Sparkles size={11} />
                      <span>{t('consumer_guardian', 'Family Guardian')}</span>
                    </span>
                  </div>

                  <p className="text-xs font-semibold text-[#51666d]">
                    {user.email}
                  </p>

                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                    {(user.city || user.area) && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/90 text-[#001d36] text-xs font-bold border border-[#c4e7ff] shadow-sm">
                        <MapPin size={12} className="text-[#00668a]" />
                        <span>{[user.area, user.city].filter(Boolean).join(", ")}</span>
                      </span>
                    )}

                    {user.phone && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/90 text-[#001d36] text-xs font-bold border border-[#c4e7ff] shadow-sm">
                        <Phone size={12} className="text-[#00668a]" />
                        <span>{user.phone}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-white text-[#00668a] text-xs font-bold hover:bg-[#e5efff] transition-all border border-[#c4e7ff] shadow-sm active:scale-95 shrink-0"
              >
                <Edit3 size={13} />
                <span>{t('edit_profile', 'Edit Profile')}</span>
              </button>
            </div>
          )}
        </div>
      </Card>

      {/* ── Middle Metrics & Safety Score Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        
        {/* Purity Gauge Card (5 cols on md) */}
        <Card className="md:col-span-5 rounded-3xl border border-[#c4e7ff] bg-white p-6 ambient-shadow flex flex-col items-center justify-center text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#30c5b3]/10 rounded-full blur-2xl pointer-events-none" />

          <p className="text-[11px] font-black uppercase tracking-wider text-[#51666d] mb-3">
            {t('overall_safety', 'Overall Milk Safety Score')}
          </p>

          {/* SVG Circular Gauge */}
          <div className="relative w-36 h-36 flex items-center justify-center my-1">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              {/* Track */}
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="transparent"
                stroke="#e2e8f0"
                strokeWidth="7"
              />
              {/* Progress Bar */}
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="transparent"
                stroke="#10b981"
                strokeWidth="7"
                strokeDasharray="283"
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            </svg>

            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-3xl font-black text-[#001d36] tracking-tight">{purityRate}%</span>
              <span className="text-[10px] font-bold text-[#10b981] uppercase tracking-wider">
                {purityRate >= 80 ? t('purity_verified', 'Purity Verified') : t('risk_detected', 'Risk Detected')}
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-500 font-medium mt-3 max-w-xs">
            {user.safeScans} of {user.totalScans} milk batches tested passed all national FSSAI purity standards.
          </p>
        </Card>

        {/* 3 Metric Summary Cards (7 cols on md) */}
        <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Total Scans Card */}
          <Card className="rounded-2xl border border-[#d1e4ff] bg-white p-4 sm:p-5 ambient-shadow flex flex-col justify-between hover:border-[#00668a] transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-black uppercase tracking-wider text-[#51666d]">{t('total_tests', 'Total Tests')}</span>
              <div className="w-8 h-8 rounded-xl bg-[#e5efff] text-[#00668a] flex items-center justify-center">
                <Activity size={16} />
              </div>
            </div>
            <div>
              <span className="text-3xl font-black text-[#001d36] tracking-tight">{user.totalScans}</span>
              <p className="text-[11px] text-slate-500 font-medium mt-1">14-channel NIR spectroscopy</p>
            </div>
          </Card>

          {/* Safe Samples Card */}
          <Card className="rounded-2xl border border-[#a8dab5] bg-gradient-to-b from-white to-[#f0fdf4] p-4 sm:p-5 ambient-shadow flex flex-col justify-between hover:border-[#10b981] transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-black uppercase tracking-wider text-[#137333]">{t('pure_milk', 'Pure Milk')}</span>
              <div className="w-8 h-8 rounded-xl bg-[#dcfce7] text-[#16a34a] flex items-center justify-center">
                <CheckCircle2 size={16} />
              </div>
            </div>
            <div>
              <span className="text-3xl font-black text-[#15803d] tracking-tight">{user.safeScans}</span>
              <p className="text-[11px] text-[#15803d]/80 font-medium mt-1">Zero hazardous chemicals</p>
            </div>
          </Card>

          {/* Adulteration Blocked Card */}
          <Card className="rounded-2xl border border-[#fecaca] bg-gradient-to-b from-white to-[#fff5f5] p-4 sm:p-5 ambient-shadow flex flex-col justify-between hover:border-[#ef4444] transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-black uppercase tracking-wider text-[#991b1b]">{t('threats_blocked', 'Threats Blocked')}</span>
              <div className="w-8 h-8 rounded-xl bg-[#fee2e2] text-[#dc2626] flex items-center justify-center">
                <AlertTriangle size={16} />
              </div>
            </div>
            <div>
              <span className="text-3xl font-black text-[#dc2626] tracking-tight">{user.unsafeScans}</span>
              <p className="text-[11px] text-[#b91c1c]/80 font-medium mt-1">Harmful milk prevented</p>
            </div>
          </Card>
        </div>
      </div>

      {/* ── FSSAI Official Reports Section ── */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-[#00668a]/10 text-[#00668a] flex items-center justify-center">
              <FileText size={14} />
            </div>
            <h2 className="text-base font-black text-[#001d36] tracking-tight">
              {t('official_reports', 'Official FSSAI Complaint Records')}
            </h2>
          </div>
          <span className="text-xs font-bold text-[#00668a] bg-[#e5efff] px-2.5 py-1 rounded-full border border-[#c4e7ff]">
            {reports.length} {reports.length === 1 ? 'Report' : 'Reports'}
          </span>
        </div>

        {reports.length === 0 ? (
          <Card className="rounded-2xl border border-dashed border-[#c4e7ff] p-6 sm:p-8 flex flex-col items-center justify-center bg-white text-center ambient-shadow">
            <div className="w-12 h-12 bg-[#f8faff] rounded-2xl flex items-center justify-center mb-3 text-[#00668a] border border-[#d1e4ff]">
              <ShieldCheck size={24} />
            </div>
            <h3 className="font-extrabold text-sm text-[#001d36] mb-1">{t('no_reports', 'No Active Hazard Reports')}</h3>
            <p className="text-xs text-[#51666d] max-w-sm leading-relaxed mb-4">
              When hazardous adulterants (such as urea, detergent, or formalin) are detected during a scan, an official FSSAI complaint dossier is automatically generated here.
            </p>
            <Link
              href="/scan"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#00668a] text-white text-xs font-bold rounded-xl hover:bg-[#004c69] transition-all shadow-sm active:scale-95"
            >
              <span>{t('test_sample_now', 'Test Milk Sample Now')}</span>
              <QrCode size={14} />
            </Link>
          </Card>
        ) : (
          <div className="space-y-2.5">
            {reports.map((report) => (
              <Card
                key={report.id}
                className="rounded-2xl border border-[#d1e4ff] p-4 flex items-center justify-between bg-white hover:border-[#00668a] transition-all ambient-shadow"
              >
                <div className="flex items-center gap-3.5">
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                      report.status === 'resolved'
                        ? 'bg-[#dcfce7] text-[#16a34a]'
                        : 'bg-[#fff7ed] text-[#ea580c]'
                    }`}
                  >
                    {report.status === 'resolved' ? (
                      <ShieldCheck size={20} />
                    ) : (
                      <FileText size={20} />
                    )}
                  </div>
                  <div>
                    <p className="font-black text-xs text-[#001d36]">
                      {report.complaint_ref || `MG-2026-${report.id.slice(0, 5)}`}
                    </p>
                    <p className="text-xs text-slate-500 font-medium">
                      {report.vendors?.name ?? 'Unregistered Vendor'} · {report.vendors?.area || 'Local Dairy'}
                    </p>
                    <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                      Filed on {new Date(report.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                </div>

                <Badge
                  className={`border-none font-bold text-[10px] uppercase tracking-wider px-2.5 py-1 ${
                    report.status === 'submitted'
                      ? 'bg-amber-100 text-amber-800'
                      : report.status === 'under_review'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {report.status.replace('_', ' ')}
                </Badge>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* ── Interactive Pop-Up Accordion Cards (Hidden Inside Options) ── */}
      <section className="space-y-3">
        <div className="flex items-center gap-2 px-1">
          <div className="w-6 h-6 rounded-lg bg-[#00668a]/10 text-[#00668a] flex items-center justify-center">
            <Lock size={14} />
          </div>
          <div>
            <h2 className="text-base font-black text-[#001d36] tracking-tight">
              {t('settings_title', 'Preferences & Regulatory Standards')}
            </h2>
            <p className="text-xs text-slate-500">{t('settings_sub', 'Tap any option to pop open its details right inside')}</p>
          </div>
        </div>

        <div className="space-y-3">

          {/* ── 1. Notifications & Alerts Card ── */}
          <Card className="rounded-2xl border border-[#d1e4ff] bg-white overflow-hidden ambient-shadow transition-all">
            <button
              onClick={() => toggleOption('notifications')}
              className="w-full flex items-center justify-between p-4 sm:p-5 text-left hover:bg-[#f8faff] transition-colors"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100">
                  <Bell size={19} />
                </div>
                <div>
                  <span className="font-extrabold text-sm text-[#001d36] block">{t('notifications', 'Notifications & Alerts')}</span>
                  <span className="text-xs text-slate-500 font-medium">Contamination warnings, daily scan reminders</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 hidden sm:inline">
                  {Object.values(notifPrefs).filter(Boolean).length} Active
                </span>
                <ChevronDown
                  size={18}
                  className={`text-slate-400 transition-transform duration-300 ${expandedOption === 'notifications' ? 'rotate-180 text-[#00668a]' : ''}`}
                />
              </div>
            </button>

            {/* Pop-Up Card Hidden Inside */}
            <AnimatePresence initial={false}>
              {expandedOption === 'notifications' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="p-4 sm:p-5 pt-1 bg-[#f8faff] border-t border-[#e5efff] space-y-3">
                    <div className="flex items-center justify-between p-3.5 rounded-xl bg-white border border-[#d1e4ff] shadow-sm">
                      <div>
                        <span className="font-bold text-sm text-[#001d36] block">Area Adulteration Alerts</span>
                        <span className="text-xs text-slate-500">Get notified when contaminated milk is detected in your neighborhood</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={notifPrefs.area}
                        onChange={e => updateNotifPref('area', e.target.checked)}
                        className="w-4 h-4 rounded text-[#00668a] focus:ring-[#00668a] cursor-pointer"
                      />
                    </div>

                    <div className="flex items-center justify-between p-3.5 rounded-xl bg-white border border-[#d1e4ff] shadow-sm">
                      <div>
                        <span className="font-bold text-sm text-[#001d36] block">Scan Reminder</span>
                        <span className="text-xs text-slate-500">Daily morning reminder to test your household milk packet</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={notifPrefs.scan}
                        onChange={e => updateNotifPref('scan', e.target.checked)}
                        className="w-4 h-4 rounded text-[#00668a] focus:ring-[#00668a] cursor-pointer"
                      />
                    </div>

                    <div className="flex items-center justify-between p-3.5 rounded-xl bg-white border border-[#d1e4ff] shadow-sm">
                      <div>
                        <span className="font-bold text-sm text-[#001d36] block">FSSAI Safety Bulletins</span>
                        <span className="text-xs text-slate-500">Official food safety notifications and local vendor advisories</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={notifPrefs.fssai}
                        onChange={e => updateNotifPref('fssai', e.target.checked)}
                        className="w-4 h-4 rounded text-[#00668a] focus:ring-[#00668a] cursor-pointer"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>

          {/* ── 2. App Language Selection Card ── */}
          <Card className="rounded-2xl border border-[#d1e4ff] bg-white overflow-hidden ambient-shadow transition-all">
            <button
              onClick={() => toggleOption('language')}
              className="w-full flex items-center justify-between p-4 sm:p-5 text-left hover:bg-[#f8faff] transition-colors"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#00668a] flex items-center justify-center shrink-0 border border-blue-100">
                  <Globe size={19} />
                </div>
                <div>
                  <span className="font-extrabold text-sm text-[#001d36] block">{t('app_language', 'App Language')}</span>
                  <span className="text-xs text-slate-500 font-medium">{t('app_language_sub', 'Select preferred regional display language')}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#00668a] bg-[#e5efff] px-2.5 py-1 rounded-full border border-[#c4e7ff]">
                  {language}
                </span>
                <ChevronDown
                  size={18}
                  className={`text-slate-400 transition-transform duration-300 ${expandedOption === 'language' ? 'rotate-180 text-[#00668a]' : ''}`}
                />
              </div>
            </button>

            {/* Pop-Up Card Hidden Inside */}
            <AnimatePresence initial={false}>
              {expandedOption === 'language' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="p-4 sm:p-5 pt-1 bg-[#f8faff] border-t border-[#e5efff]">
                    <p className="text-xs text-slate-500 mb-3">Choose your native language for test results and explanations:</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {LANGUAGES.map(lang => {
                        const isSelected = language === lang.id
                        return (
                          <div
                            key={lang.id}
                            onClick={() => selectLanguage(lang.id)}
                            className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition-all ${
                              isSelected
                                ? "bg-[#e5efff] border-[#00668a] text-[#00668a] shadow-sm font-bold ring-2 ring-[#00668a]/10"
                                : "bg-white border-slate-200 text-slate-800 hover:bg-slate-50"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-xl">{lang.flag}</span>
                              <div>
                                <span className="text-sm font-bold block">{lang.label}</span>
                                <span className="text-xs text-slate-500 font-medium">{lang.native}</span>
                              </div>
                            </div>
                            {isSelected && (
                              <div className="w-5 h-5 rounded-full bg-[#00668a] text-white flex items-center justify-center">
                                <Check size={12} />
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>

          {/* ── 3. Privacy & Password Card ── */}
          <Card className="rounded-2xl border border-[#d1e4ff] bg-white overflow-hidden ambient-shadow transition-all">
            <button
              onClick={() => toggleOption('privacy')}
              className="w-full flex items-center justify-between p-4 sm:p-5 text-left hover:bg-[#f8faff] transition-colors"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
                  <Shield size={19} />
                </div>
                <div>
                  <span className="font-extrabold text-sm text-[#001d36] block">{t('privacy_security', 'Privacy & Security')}</span>
                  <span className="text-xs text-slate-500 font-medium">{t('privacy_sub', 'Data encryption, password reset')}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#137333] bg-[#e6f4ea] px-2 py-0.5 rounded-full border border-[#a8dab5] hidden sm:inline">
                  Encrypted
                </span>
                <ChevronDown
                  size={18}
                  className={`text-slate-400 transition-transform duration-300 ${expandedOption === 'privacy' ? 'rotate-180 text-[#00668a]' : ''}`}
                />
              </div>
            </button>

            {/* Pop-Up Card Hidden Inside */}
            <AnimatePresence initial={false}>
              {expandedOption === 'privacy' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="p-4 sm:p-5 pt-1 bg-[#f8faff] border-t border-[#e5efff] space-y-4">
                    <div className="p-4 rounded-2xl bg-[#e6f4ea] border border-[#a8dab5] text-[#137333]">
                      <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider mb-1">
                        <ShieldCheck size={16} /> End-to-End Encrypted Data
                      </div>
                      <p className="text-xs text-[#137333]/90 leading-relaxed font-medium">
                        MilkGuard stores spectral testing records and device telemetry securely on Supabase. Your family testing data is completely private and never sold to commercial advertisers.
                      </p>
                    </div>

                    <div className="space-y-3 bg-white p-4 rounded-2xl border border-[#d1e4ff] shadow-sm">
                      <h4 className="font-black text-sm text-[#001d36]">Account Security Credentials</h4>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 block">Registered Email</label>
                        <input
                          readOnly
                          value={user.email}
                          className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-600 text-sm font-medium focus:outline-none"
                        />
                      </div>

                      <button
                        onClick={handleResetPassword}
                        disabled={isResettingPassword}
                        className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#00668a] text-white font-bold text-xs hover:bg-[#004c69] transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
                      >
                        {isResettingPassword ? (
                          <>
                            <Loader2 size={14} className="animate-spin" />
                            <span>Sending Reset Link...</span>
                          </>
                        ) : (
                          <>
                            <Lock size={14} />
                            <span>Send Password Reset Email</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>

          {/* ── 4. FSSAI Safety Standards Card ── */}
          <Card className="rounded-2xl border border-[#d1e4ff] bg-white overflow-hidden ambient-shadow transition-all">
            <button
              onClick={() => toggleOption('fssai')}
              className="w-full flex items-center justify-between p-4 sm:p-5 text-left hover:bg-[#f8faff] transition-colors"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0 border border-teal-100">
                  <BookOpen size={19} />
                </div>
                <div>
                  <span className="font-extrabold text-sm text-[#001d36] block">{t('fssai_standards', 'FSSAI Safety Standards')}</span>
                  <span className="text-xs text-slate-500 font-medium">{t('fssai_sub', 'Official permissible limits for common adulterants')}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200 hidden sm:inline">
                  2025-26 Rules
                </span>
                <ChevronDown
                  size={18}
                  className={`text-slate-400 transition-transform duration-300 ${expandedOption === 'fssai' ? 'rotate-180 text-[#00668a]' : ''}`}
                />
              </div>
            </button>

            {/* Pop-Up Card Hidden Inside */}
            <AnimatePresence initial={false}>
              {expandedOption === 'fssai' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="p-4 sm:p-5 pt-1 bg-[#f8faff] border-t border-[#e5efff] space-y-4">
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Permissible regulatory limits defined by the Food Safety and Standards Authority of India (FSSAI) for milk adulterants:
                    </p>

                    <div className="overflow-x-auto rounded-2xl border border-[#d1e4ff] bg-white shadow-sm">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-[#f8f9ff] text-slate-600 font-extrabold border-b border-[#d1e4ff]">
                          <tr>
                            <th className="p-3">Adulterant</th>
                            <th className="p-3">Permissible Limit</th>
                            <th className="p-3">Health Risk Level</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-800 font-medium">
                          <tr>
                            <td className="p-3 font-semibold">Added Water</td>
                            <td className="p-3">&lt; 3.0% dilution</td>
                            <td className="p-3 text-amber-600 font-bold">Substandard Quality</td>
                          </tr>
                          <tr>
                            <td className="p-3 font-semibold">Urea</td>
                            <td className="p-3">&lt; 0.07% (Naturally occurring)</td>
                            <td className="p-3 text-rose-600 font-bold">Kidney Damage</td>
                          </tr>
                          <tr>
                            <td className="p-3 font-semibold">Detergent / Soap</td>
                            <td className="p-3">Zero (0%) Tolerance</td>
                            <td className="p-3 text-red-600 font-bold">Severe Gastric Distress</td>
                          </tr>
                          <tr>
                            <td className="p-3 font-semibold">Formalin</td>
                            <td className="p-3">Zero (0%) Tolerance</td>
                            <td className="p-3 text-red-700 font-bold">Classified Carcinogen</td>
                          </tr>
                          <tr>
                            <td className="p-3 font-semibold">Starch / Flour</td>
                            <td className="p-3">Zero (0%) Tolerance</td>
                            <td className="p-3 text-slate-600 font-bold">Misbranded Product</td>
                          </tr>
                          <tr>
                            <td className="p-3 font-semibold">Neutralizers</td>
                            <td className="p-3">&lt; 0.05%</td>
                            <td className="p-3 text-rose-600 font-bold">Digestive Hazard</td>
                          </tr>
                          <tr>
                            <td className="p-3 font-semibold">Fat Content</td>
                            <td className="p-3">&ge; 3.5% Cow / &ge; 6.5% Buffalo</td>
                            <td className="p-3 text-amber-600 font-bold">Nutritional Deficit</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <div className="p-3.5 rounded-xl bg-white border border-[#d1e4ff] text-center shadow-sm">
                      <span className="text-[11px] text-slate-500 font-medium block">
                        National Food Safety Helpline:
                      </span>
                      <span className="text-xs font-black text-[#00668a]">
                        Toll-Free 1800-112-100 · FSSAI Food Safety Connect
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>

          {/* ── 5. About MilkGuard Card ── */}
          <Card className="rounded-2xl border border-[#d1e4ff] bg-white overflow-hidden ambient-shadow transition-all">
            <button
              onClick={() => toggleOption('about')}
              className="w-full flex items-center justify-between p-4 sm:p-5 text-left hover:bg-[#f8faff] transition-colors"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100">
                  <Info size={19} />
                </div>
                <div>
                  <span className="font-extrabold text-sm text-[#001d36] block">{t('about_milkguard', 'About MilkGuard AI')}</span>
                  <span className="text-xs text-slate-500 font-medium">{t('about_sub', 'Platform architecture, NIR sensors, and team credits')}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200 hidden sm:inline">
                  v1.0.0
                </span>
                <ChevronDown
                  size={18}
                  className={`text-slate-400 transition-transform duration-300 ${expandedOption === 'about' ? 'rotate-180 text-[#00668a]' : ''}`}
                />
              </div>
            </button>

            {/* Pop-Up Card Hidden Inside */}
            <AnimatePresence initial={false}>
              {expandedOption === 'about' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="p-4 sm:p-5 pt-1 bg-[#f8faff] border-t border-[#e5efff] space-y-4">
                    <p className="text-xs text-[#51666d] leading-relaxed">
                      MilkGuard is an instant, contactless milk purity detection platform using near-infrared (NIR) optical spectroscopy and AI to identify adulterants in under 8 seconds.
                    </p>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                      <div className="p-3 rounded-xl bg-white border border-[#d1e4ff] shadow-sm">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Hardware</span>
                        <span className="text-xs font-black text-[#001d36]">14-Channel NIR</span>
                      </div>
                      <div className="p-3 rounded-xl bg-white border border-[#d1e4ff] shadow-sm">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">AI Engine</span>
                        <span className="text-xs font-black text-[#001d36]">Groq LLaMA-3.3</span>
                      </div>
                      <div className="p-3 rounded-xl bg-white border border-[#d1e4ff] shadow-sm">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Cloud Data</span>
                        <span className="text-xs font-black text-[#001d36]">Supabase Postgres</span>
                      </div>
                      <div className="p-3 rounded-xl bg-white border border-[#d1e4ff] shadow-sm">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Standards</span>
                        <span className="text-xs font-black text-[#001d36]">FSSAI 2026 Compliant</span>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-white border border-[#d1e4ff] text-center shadow-sm">
                      <p className="text-xs font-bold text-[#00668a]">
                        Built by Team API Avengers 🇮🇳 · Protecting families from milk adulteration
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>

        </div>
      </section>

      {/* ── Sign Out Button ── */}
      <div className="pt-2">
        <SignOutButton />
      </div>

    </div>
  )
}
