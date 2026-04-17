'use client'

/**
 * ScanCard — displays a single AS7343 hardware scan from milk_data.
 *
 * Shows:
 *  • Quality badge (Pure ✅ / Adulterated ❌ / Uncertain ⚠️) 
 *  • Spectral bar visualisation (F1–F8 visible channels)
 *  • NIR + Clear as secondary info
 *  • Blockchain tx_hash badge when available
 */

import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, AlertTriangle, HelpCircle, ExternalLink } from 'lucide-react'
import { ScanRow, getStatusFromQuality } from '@/hooks/useRealtimeScans'

// ─── Channel colour palette (wavelength-inspired) ────────────────────────────
const F_COLORS = [
  '#8B5CF6', // F1 ~415 nm  violet
  '#6366F1', // F2 ~445 nm  indigo
  '#3B82F6', // F3 ~480 nm  blue
  '#06B6D4', // F4 ~515 nm  cyan
  '#10B981', // F5 ~555 nm  green
  '#84CC16', // F6 ~590 nm  lime
  '#F59E0B', // F7 ~630 nm  amber
  '#EF4444', // F8 ~680 nm  red
]

// ─── Status config ─────────────────────────────────────────────────────────────
type StatusKey = 'Pure' | 'Adulterated' | 'Uncertain'

const STATUS_CONFIG: Record<
  StatusKey,
  { icon: React.ReactNode; badge: string; bg: string; border: string; label: string; emoji: string }
> = {
  Pure: {
    icon: <CheckCircle2 size={20} className="text-emerald-500" />,
    badge: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    label: 'Pure Milk',
    emoji: '✅',
  },
  Adulterated: {
    icon: <AlertTriangle size={20} className="text-red-500" />,
    badge: 'bg-red-100 text-red-700 border-red-200',
    bg: 'bg-red-50',
    border: 'border-red-200',
    label: 'Adulterated',
    emoji: '❌',
  },
  Uncertain: {
    icon: <HelpCircle size={20} className="text-amber-500" />,
    badge: 'bg-amber-100 text-amber-700 border-amber-200',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    label: 'Uncertain',
    emoji: '⚠️',
  },
}

// ─── Spectral bar ─────────────────────────────────────────────────────────────
function SpectralBar({ scan }: { scan: ScanRow }) {
  const channels = [scan.f1, scan.f2, scan.f3, scan.f4, scan.f5, scan.f6, scan.f7, scan.f8].map(
    (v) => v ?? 0
  )
  const max = Math.max(...channels, 1)

  return (
    <div>
      <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1.5">
        Spectral Profile — F1→F8
      </p>
      <div className="flex items-end gap-0.5 h-10">
        {channels.map((val, i) => {
          const pct = (val / max) * 100
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${pct}%` }}
                transition={{ duration: 0.6, delay: i * 0.04, ease: 'easeOut' }}
                className="w-full rounded-t-sm"
                style={{ backgroundColor: F_COLORS[i], minHeight: 2 }}
              />
            </div>
          )
        })}
      </div>
      <div className="flex gap-0.5 mt-0.5">
        {channels.map((_, i) => (
          <div key={i} className="flex-1 text-center text-[7px] font-bold text-slate-400">
            F{i + 1}
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Main Card ────────────────────────────────────────────────────────────────
interface ScanCardProps {
  scan: ScanRow
  index?: number
}

export function ScanCard({ scan, index = 0 }: ScanCardProps) {
  const statusKey = (scan.status ?? getStatusFromQuality(scan.quality)) as StatusKey
  const cfg = STATUS_CONFIG[statusKey] ?? STATUS_CONFIG['Uncertain']

  const qualityPct = useMemo(() => Math.round(scan.quality * 100), [scan.quality])

  const shortHash = scan.tx_hash
    ? `${scan.tx_hash.slice(0, 6)}…${scan.tx_hash.slice(-4)}`
    : null

  const shortChannelHash = scan.channel_hash
    ? scan.channel_hash.slice(0, 12)
    : null

  const timeStr = new Date(scan.created_at).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })
  const dateStr = new Date(scan.created_at).toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
  })

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06 }}
      className={`rounded-3xl p-4 border ${cfg.bg} ${cfg.border} space-y-3`}
    >
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {cfg.icon}
          <div>
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black border ${cfg.badge}`}
            >
              {cfg.emoji} {cfg.label}
            </span>
          </div>
        </div>
        {/* Quality score */}
        <div className="text-right">
          <p className="text-2xl font-black text-slate-700 leading-none">{qualityPct}%</p>
          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Quality</p>
        </div>
      </div>

      {/* Spectral bar */}
      <SpectralBar scan={scan} />

      {/* NIR + Clear secondary row */}
      <div className="flex gap-2">
        <div className="flex-1 rounded-2xl bg-white/80 border border-slate-100 px-3 py-1.5 text-center">
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">NIR</p>
          <p className="text-sm font-black text-slate-700">
            {scan.nir != null ? scan.nir.toFixed(0) : '—'}
          </p>
        </div>
        <div className="flex-1 rounded-2xl bg-white/80 border border-slate-100 px-3 py-1.5 text-center">
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Clear</p>
          <p className="text-sm font-black text-slate-700">
            {scan.clear != null ? scan.clear.toFixed(0) : '—'}
          </p>
        </div>
        <div className="flex-1 rounded-2xl bg-white/80 border border-slate-100 px-3 py-1.5 text-center">
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Time</p>
          <p className="text-[10px] font-black text-slate-700 leading-tight">
            {timeStr}
            <br />
            <span className="font-bold text-slate-400">{dateStr}</span>
          </p>
        </div>
      </div>

      {/* Blockchain / hash footer */}
      <div className="flex items-center gap-2 pt-0.5">
        {shortHash ? (
          <a
            href={`https://amoy.polygonscan.com/tx/${scan.tx_hash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[9px] font-bold text-indigo-500 hover:text-indigo-700 transition-colors"
          >
            <ExternalLink size={10} />
            Chain: {shortHash}
          </a>
        ) : (
          <span className="text-[9px] font-bold text-slate-300">
            {shortChannelHash ? `Channel hash: ${shortChannelHash}…` : 'Pending chain log…'}
          </span>
        )}
      </div>
    </motion.div>
  )
}
