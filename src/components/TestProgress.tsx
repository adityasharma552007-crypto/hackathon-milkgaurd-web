'use client'

/**
 * TestProgress — real-time animated progress ring + live adulterant bars.
 * Reads data directly from useDeviceStore (set by useDeviceSocket).
 */

import React from 'react'
import { motion } from 'framer-motion'
import { useDeviceStore } from '@/store/useDeviceStore'
import { Loader2 } from 'lucide-react'

// ─── SVG Progress Ring ────────────────────────────────────────────────────────
function ProgressRing({ progress, size = 160 }: { progress: number; size?: number }) {
  const radius       = (size - 20) / 2
  const circumference = 2 * Math.PI * radius
  const offset       = circumference - (progress / 100) * circumference

  return (
    <svg width={size} height={size} className="rotate-[-90deg]">
      {/* Track */}
      <circle
        cx={size / 2} cy={size / 2} r={radius}
        fill="none" stroke="#f1f5f9" strokeWidth={12}
      />
      {/* Animated arc */}
      <motion.circle
        cx={size / 2} cy={size / 2} r={radius}
        fill="none" strokeWidth={12} strokeLinecap="round"
        stroke="#1C75E8"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      />
    </svg>
  )
}

// ─── Adulterant config ────────────────────────────────────────────────────────
const ADULTERANTS: {
  key: string; label: string; safeLimit: number; color: string
}[] = [
  { key: 'soap',      label: 'Soap',      safeLimit: 1.0, color: '#3b82f6' },
  { key: 'urea',      label: 'Urea',      safeLimit: 0.5, color: '#8b5cf6' },
  { key: 'starch',    label: 'Starch',    safeLimit: 0.5, color: '#f59e0b' },
  { key: 'detergent', label: 'Detergent', safeLimit: 0.3, color: '#06b6d4' },
]

// ─── Individual bar ───────────────────────────────────────────────────────────
function AdulterantBar({ cfg, value }: { cfg: typeof ADULTERANTS[number]; value: number }) {
  const isDanger = value > cfg.safeLimit
  // Scale: safeLimit maps to ~33% of bar width
  const pct      = Math.min((value / (cfg.safeLimit * 3)) * 100, 100)

  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-[10px] font-black text-slate-600 uppercase tracking-wider">
          {cfg.label}
        </span>
        <span className={`text-[10px] font-black ${isDanger ? 'text-red-500' : 'text-blue-600'}`}>
          {value.toFixed(2)}%{isDanger && ' ⚠'}
        </span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: isDanger ? '#ef4444' : cfg.color }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export function TestProgress() {
  const testPhase    = useDeviceStore((s) => s.testPhase)
  const liveReading  = useDeviceStore((s) => s.liveReading)
  const pairedDevice = useDeviceStore((s) => s.pairedDevice)

  const progress = liveReading?.progress ?? 0

  const statusLabel =
    progress < 30 ? 'Initializing sensors…' :
    progress < 60 ? 'Reading spectral data…' :
    progress < 90 ? 'Analyzing adulterants…' :
                    'Finalizing results…'

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl border border-slate-100 shadow-lg overflow-hidden"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1C75E8] to-[#1e8259] px-5 py-4 flex items-center justify-between">
        <div>
          <p className="text-white font-black text-sm tracking-tight">Live Test</p>
          <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest mt-0.5">
            {pairedDevice?.display_name ?? pairedDevice?.device_id ?? 'MilkGuard Pod'}
          </p>
        </div>
        <div className="flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-[#F5A623] animate-pulse" />
          <span className="text-white text-[9px] font-black uppercase tracking-widest">
            {testPhase === 'running' ? 'Scanning' : 'Processing'}
          </span>
        </div>
      </div>

      <div className="p-5 space-y-5">
        {/* Progress Ring */}
        <div className="flex flex-col items-center">
          <div className="relative">
            <ProgressRing progress={progress} size={160} />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              {testPhase === 'running' ? (
                <>
                  <span className="text-3xl font-black text-[#1C75E8] leading-none">
                    {Math.round(progress)}%
                  </span>
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                    Progress
                  </span>
                </>
              ) : (
                <Loader2 size={28} className="animate-spin text-[#1C75E8]" />
              )}
            </div>
          </div>
          <p className="text-xs text-slate-400 font-medium mt-2">{statusLabel}</p>
        </div>

        {/* Live adulterant bars */}
        {liveReading && (
          <div className="space-y-3">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
              Live Readings
            </p>
            {ADULTERANTS.map((cfg) => (
              <AdulterantBar
                key={cfg.key}
                cfg={cfg}
                value={(liveReading as unknown as Record<string, number>)[cfg.key] ?? 0}
              />
            ))}
            {liveReading.temp !== undefined && (
              <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
                  Temperature
                </span>
                <span className="text-[10px] font-bold text-slate-700">
                  {liveReading.temp.toFixed(1)} °C
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  )
}
