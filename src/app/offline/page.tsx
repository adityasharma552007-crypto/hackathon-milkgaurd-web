'use client'

import React from 'react'
import Link from 'next/link'
import { WifiOff, RefreshCw, ArrowLeft, ShieldAlert, CheckCircle2 } from 'lucide-react'

export default function OfflinePage() {
  const handleRetry = () => {
    if (typeof window !== 'undefined') {
      window.location.reload()
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#f8f9ff] via-[#e5efff]/30 to-[#f8f9ff] flex flex-col items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-[#c4e7ff]/60 text-center">
        {/* Emblem / Offline Icon */}
        <div className="relative mx-auto w-20 h-20 mb-6 flex items-center justify-center">
          <div className="absolute inset-0 rounded-2xl bg-amber-100 animate-ping opacity-25" />
          <div className="w-20 h-20 rounded-2xl bg-amber-50 border-2 border-amber-200 flex items-center justify-center text-amber-600 shadow-sm relative z-10">
            <WifiOff size={36} />
          </div>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-xs font-bold text-amber-700 mb-3">
          <ShieldAlert size={14} />
          <span>App Shell Available Offline</span>
        </div>

        <h1 className="text-2xl font-extrabold text-[#001d36] tracking-tight mb-2">
          You're Offline
        </h1>

        <p className="text-sm text-[#3e484f] leading-relaxed mb-6">
          You're offline. Live scanning, AI analysis, cloud history and verification require an internet connection.
        </p>

        {/* Offline notice box */}
        <div className="p-4 rounded-2xl bg-[#f8f9ff] border border-[#e2eaf0] text-left text-xs text-[#52606d] space-y-2 mb-6">
          <div className="flex items-start gap-2 text-[#00668a] font-semibold">
            <CheckCircle2 size={15} className="shrink-0 mt-0.5" />
            <span>Installed PWA app shell is loaded and ready.</span>
          </div>
          <div className="flex items-start gap-2 text-amber-800 font-medium">
            <span className="font-bold">•</span>
            <span>Live spectral AI models & cloud records will resume once connectivity is restored.</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          <button
            onClick={handleRetry}
            className="w-full py-3 px-4 rounded-xl bg-[#00668a] hover:bg-[#004c69] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
          >
            <RefreshCw size={16} />
            <span>Retry Connection</span>
          </button>

          <Link
            href="/"
            className="w-full py-2.5 px-4 rounded-xl bg-[#f0f4f8] hover:bg-[#e2eaf0] text-[#00668a] font-bold text-sm transition-all flex items-center justify-center gap-2"
          >
            <ArrowLeft size={16} />
            <span>Back to Home</span>
          </Link>
        </div>
      </div>

      <p className="mt-6 text-xs text-[#8e9aa0] text-center">
        MilkGuard PWA · AI-Powered Food Safety
      </p>
    </main>
  )
}
