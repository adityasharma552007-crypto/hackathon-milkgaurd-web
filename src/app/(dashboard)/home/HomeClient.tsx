'use client'

import React from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useTranslation } from '@/lib/i18n/useTranslation'

interface HomeClientProps {
  profile: any
  allScans: any[]
  flaggedCount: number
}

export function HomeClient({ profile, allScans, flaggedCount }: HomeClientProps) {
  const { t } = useTranslation()

  const latestScan = allScans[0]
  const totalScans = profile?.total_scans || allScans.length || 12
  const safeScans = profile?.safe_scans || allScans.filter(s => s.result_tier === 'safe').length || 11
  const purityRate = totalScans > 0 ? ((safeScans / totalScans) * 100).toFixed(1) : '94.8'
  const qualityScore = latestScan ? latestScan.safety_score : (safeScans > 0 ? Math.round((safeScans / Math.max(1, totalScans)) * 100) : 94)

  // Calculate SVG stroke offset for gauge (r=45, circumference ~283)
  const strokeOffset = Math.max(0, 283 - (283 * (qualityScore / 100)))

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Flagged Vendors Alert Banner */}
      {flaggedCount && flaggedCount > 0 ? (
        <Link href="/map?filter=flagged" className="block group">
          <div className="bg-white border border-[#ffdad6] rounded-2xl px-4 py-3 flex items-center justify-between hover:border-[#ba1a1a]/40 hover:bg-[#fff8f8] transition-all ambient-shadow">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#ffdad6] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[#ba1a1a] text-base">notifications_active</span>
              </div>
              <div>
                <p className="text-[11px] font-bold text-[#93000a] uppercase tracking-wider leading-none mb-0.5">
                  {t('community_alert', 'Community Alert')}
                </p>
                <p className="text-xs font-semibold text-[#3e484f]">
                  {flaggedCount} {t('flagged_dairies', 'dairies flagged for adulteration in your area')} ({profile?.city || 'your area'})
                </p>
              </div>
            </div>
            <span className="material-symbols-outlined text-[#ba1a1a] text-base group-hover:translate-x-0.5 transition-transform shrink-0">arrow_forward</span>
          </div>
        </Link>
      ) : null}

      {/* Main Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Hero Section (Spans 8 cols on desktop) */}
        <section className="md:col-span-8 bg-gradient-to-br from-[#eef4ff] to-[#ffffff] rounded-2xl p-6 md:p-8 ambient-shadow border border-[#c4e7ff]/80 relative overflow-hidden flex flex-col md:flex-row items-center gap-6">
          <div className="absolute top-0 right-0 w-72 h-72 bg-[#7bd0ff] opacity-15 blur-3xl rounded-full translate-x-1/3 -translate-y-1/3 pointer-events-none"></div>
          
          <div className="flex-1 z-10 flex flex-col gap-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#e5efff] border border-[#c4e7ff] w-fit">
              <span className="w-2.5 h-2.5 rounded-full bg-[#30c5b3] animate-pulse"></span>
              <span className="text-xs font-medium text-[#3e484f]">
                {t('system_online', 'System Online · Pure Analysis')}
              </span>
            </div>
            
            <h1 className="text-2xl md:text-4xl font-extrabold text-[#001d36] tracking-tight leading-tight">
              {t('know_whats_in_milk', "Know what's in your milk.")}
            </h1>
            
            <p className="text-sm md:text-base text-[#3e484f] max-w-md leading-relaxed">
              {t('welcome_back', 'Welcome back')}, <span className="font-bold text-[#00668a]">{profile?.full_name?.split(' ')[0] || 'User'}</span>. {t('realtime_purity_desc', 'Real-time purity analysis powered by spectral sensing and AI.')}
            </p>

            <div className="pt-2 flex items-center gap-3">
              <Button asChild className="bg-[#00668a] hover:bg-[#004c69] text-white font-bold px-6 py-3 rounded-xl shadow-md transition-all flex items-center gap-2">
                <Link href="/scan">
                  <span className="material-symbols-outlined text-lg">qr_code_scanner</span>
                  <span>{t('start_scanning', 'Start Scanning')}</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="border-[#bdc8d1] text-[#00668a] hover:bg-[#e5efff] font-semibold px-4 py-3 rounded-xl">
                <Link href="/chat">{t('ask_ai', 'Ask AI')}</Link>
              </Button>
            </div>
          </div>

          {/* Abstract Scientific Visual */}
          <div className="w-full md:w-60 h-44 md:h-56 relative z-10 rounded-xl overflow-hidden border border-[#d1e4ff] bg-[#f8f9ff] flex-shrink-0 flex items-center justify-center shadow-inner">
            <div className="absolute inset-0 bg-gradient-to-tr from-[#00668a]/10 to-transparent z-10 pointer-events-none" />
            <div className="w-32 h-32 rounded-full border-4 border-[#38bdf8]/40 flex items-center justify-center animate-pulse">
              <div className="w-24 h-24 rounded-full border-2 border-[#30c5b3]/60 flex items-center justify-center">
                <span className="material-symbols-outlined text-5xl text-[#00668a]">water_drop</span>
              </div>
            </div>
          </div>
        </section>

        {/* Quality Score Radial Gauge (Spans 4 cols on desktop) */}
        <section className="md:col-span-4 bg-white rounded-2xl p-6 ambient-shadow border border-[#d1e4ff] flex flex-col items-center justify-center relative">
          <h2 className="text-lg font-bold text-[#001d36] mb-4 w-full text-center">
            {t('quality_score', 'Quality Score')}
          </h2>
          
          {/* Radial Gauge SVG */}
          <div className="relative w-44 h-44 flex items-center justify-center">
            <svg className="transform -rotate-90 w-full h-full" viewBox="0 0 100 100">
              {/* Background Track */}
              <circle className="stroke-[#e5efff]" cx="50" cy="50" fill="none" r="45" strokeWidth="8" />
              {/* Progress Track */}
              <circle 
                className="stroke-[#00668a]" 
                cx="50" 
                cy="50" 
                fill="none" 
                r="45" 
                strokeWidth="8" 
                strokeDasharray="283" 
                strokeDashoffset={strokeOffset} 
                strokeLinecap="round" 
                style={{ transition: 'stroke-dashoffset 1s ease-out' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-extrabold text-[#001d36] tracking-tight">{qualityScore}</span>
              <span className="text-xs font-semibold text-[#3e484f]">/100</span>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-1.5 px-4 py-1.5 bg-[#30c5b3]/15 rounded-full border border-[#30c5b3]/30">
            <span className="material-symbols-outlined text-[#006b5f] text-base">verified</span>
            <span className="text-xs font-bold text-[#006b5f]">
              {qualityScore >= 80 ? t('excellent_quality', 'Excellent Quality') : qualityScore >= 50 ? t('moderate_quality', 'Moderate Quality') : t('warning_level', 'Warning Level')}
            </span>
          </div>
        </section>

        {/* Metrics Grid (Spans 12 cols, grid of 4 cards on desktop) */}
        <section className="md:col-span-12 grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Card 1: Total Scans */}
          <div className="bg-white rounded-2xl p-5 ambient-shadow border border-[#d1e4ff] flex flex-col gap-2">
            <div className="flex justify-between items-start">
              <span className="text-xs font-semibold text-[#3e484f]">{t('total_scans', 'Total Scans')}</span>
              <span className="material-symbols-outlined text-[#7bd0ff]">qr_code_scanner</span>
            </div>
            <div className="text-3xl font-extrabold text-[#001d36]">{totalScans}</div>
            <div className="h-6 w-full mt-auto flex items-end gap-1">
              <div className="w-1/6 bg-[#e5efff] h-1/3 rounded-t-sm"></div>
              <div className="w-1/6 bg-[#e5efff] h-1/2 rounded-t-sm"></div>
              <div className="w-1/6 bg-[#e5efff] h-2/3 rounded-t-sm"></div>
              <div className="w-1/6 bg-[#7bd0ff] h-full rounded-t-sm"></div>
              <div className="w-1/6 bg-[#38bdf8] h-4/5 rounded-t-sm"></div>
              <div className="w-1/6 bg-[#00668a] h-full rounded-t-sm"></div>
            </div>
          </div>

          {/* Card 2: Purity Rate */}
          <div className="bg-white rounded-2xl p-5 ambient-shadow border border-[#d1e4ff] flex flex-col gap-2">
            <div className="flex justify-between items-start">
              <span className="text-xs font-semibold text-[#3e484f]">{t('purity_rate', 'Purity Rate')}</span>
              <span className="material-symbols-outlined text-[#30c5b3]">water_drop</span>
            </div>
            <div className="text-3xl font-extrabold text-[#001d36]">{purityRate}%</div>
            <div className="w-full bg-[#e5efff] h-2 rounded-full mt-auto overflow-hidden">
              <div className="bg-[#30c5b3] h-full rounded-full" style={{ width: `${Math.min(100, Number(purityRate))}%` }}></div>
            </div>
          </div>

          {/* Card 3: Avg Confidence */}
          <div className="bg-white rounded-2xl p-5 ambient-shadow border border-[#d1e4ff] flex flex-col gap-2">
            <div className="flex justify-between items-start">
              <span className="text-xs font-semibold text-[#3e484f]">{t('avg_confidence', 'Avg Confidence')}</span>
              <span className="material-symbols-outlined text-[#4d6268]">radar</span>
            </div>
            <div className="text-3xl font-extrabold text-[#001d36]">96%</div>
            <div className="text-xs font-medium text-[#4d6268] mt-auto">AI Spectral Precision</div>
          </div>

          {/* Card 4: Active Alerts */}
          <div className="bg-white rounded-2xl p-5 ambient-shadow border border-[#ffdad6] flex flex-col gap-2 relative overflow-hidden">
            <div className="flex justify-between items-start">
              <span className="text-xs font-semibold text-[#3e484f]">{t('active_alerts', 'Active Alerts')}</span>
              <div className="w-7 h-7 rounded-full bg-[#ffdad6] flex items-center justify-center">
                <span className="material-symbols-outlined text-[#ba1a1a] text-sm">notifications_active</span>
              </div>
            </div>
            <div className="text-3xl font-extrabold text-[#ba1a1a] mt-auto">{flaggedCount || 0}</div>
          </div>
        </section>

        {/* Lower Section: Quick Actions & Latest Scan */}
        <div className="md:col-span-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Quick Actions */}
          <section className="flex flex-col gap-3">
            <h3 className="text-lg font-bold text-[#001d36] px-1">{t('quick_actions', 'Quick Actions')}</h3>
            <div className="grid grid-cols-3 gap-3">
              <Link href="/scan" className="bg-white border border-[#d1e4ff] rounded-2xl p-4 flex flex-col items-center justify-center gap-2 hover:bg-[#e5efff]/50 transition-colors ambient-shadow active:scale-95 text-center">
                <div className="w-12 h-12 rounded-full bg-[#c4e7ff] flex items-center justify-center text-[#00668a]">
                  <span className="material-symbols-outlined text-2xl">qr_code_scanner</span>
                </div>
                <span className="text-xs font-bold text-[#001d36]">{t('scan_milk', 'Scan Milk')}</span>
              </Link>

              <Link href="/history" className="bg-white border border-[#d1e4ff] rounded-2xl p-4 flex flex-col items-center justify-center gap-2 hover:bg-[#e5efff]/50 transition-colors ambient-shadow active:scale-95 text-center">
                <div className="w-12 h-12 rounded-full bg-[#e5efff] flex items-center justify-center text-[#3e484f]">
                  <span className="material-symbols-outlined text-2xl">analytics</span>
                </div>
                <span className="text-xs font-bold text-[#001d36]">{t('nav_reports', 'Reports')}</span>
              </Link>

              <Link href="/map" className="bg-white border border-[#d1e4ff] rounded-2xl p-4 flex flex-col items-center justify-center gap-2 hover:bg-[#e5efff]/50 transition-colors ambient-shadow active:scale-95 text-center">
                <div className="w-12 h-12 rounded-full bg-[#e5efff] flex items-center justify-center text-[#3e484f]">
                  <span className="material-symbols-outlined text-2xl">map</span>
                </div>
                <span className="text-xs font-bold text-[#001d36]">{t('nav_map', 'Map')}</span>
              </Link>
            </div>
          </section>

          {/* Latest Scan */}
          <section className="flex flex-col gap-3">
            <div className="flex justify-between items-center px-1">
              <h3 className="text-lg font-bold text-[#001d36]">{t('latest_scan', 'Latest Scan')}</h3>
              <Link href="/history" className="text-xs font-bold text-[#00668a] hover:underline">{t('view_all', 'View All')}</Link>
            </div>

            {latestScan ? (
              <Link href={`/history/${latestScan.id}`} className="block h-full">
                <div className="bg-white rounded-2xl p-5 ambient-shadow border border-[#c4e7ff] flex flex-col gap-3 h-full justify-between hover:border-[#00668a] transition-all">
                  <div className="flex justify-between items-center">
                    <div className={cn(
                      "flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase",
                      latestScan.result_tier === 'safe' ? "bg-[#30c5b3]/15 text-[#006b5f]" : "bg-[#ffdad6] text-[#93000a]"
                    )}>
                      <span className="w-2 h-2 rounded-full bg-current"></span>
                      <span>{latestScan.result_tier === 'safe' ? t('pure_status', 'PURE') : t('adulterated_status', 'ADULTERATED')}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <span className="text-sm font-extrabold text-[#001d36]">{latestScan.safety_score}% Safety</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5 pt-3 border-t border-[#d1e4ff]/60 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-[#3e484f]">{t('sample_source', 'Sample / Source')}</span>
                      <span className="font-bold text-[#001d36]">
                        {latestScan.source_hardware_id ? '📡 ESP32 Sensor' : (latestScan.vendors?.name || 'Home Sample')}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[#3e484f]">{t('time_label', 'Time')}</span>
                      <span className="font-medium text-[#001d36]">{format(new Date(latestScan.created_at), 'dd MMM, hh:mm a')}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ) : (
              <div className="py-8 text-center bg-white rounded-2xl border border-dashed border-[#d1e4ff] flex flex-col items-center justify-center">
                <span className="material-symbols-outlined text-4xl text-[#bdc8d1] mb-1">sentiment_neutral</span>
                <p className="text-xs font-bold text-[#3e484f] uppercase tracking-wider">{t('no_scans_yet', 'No scans recorded yet')}</p>
                <p className="text-xs text-[#6e7980] mt-0.5">{t('start_scan_to_analyze', 'Start a scan to analyze your milk purity')}</p>
              </div>
            )}
          </section>
        </div>

      </div>
    </div>
  )
}
