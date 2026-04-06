'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDeviceStore, ConnectionState } from '@/store/useDeviceStore'
import { Wifi, WifiOff, Loader2, RefreshCw } from 'lucide-react'

const CONFIG: Record<ConnectionState, {
  bg: string; text: string; dot: string; label: string; icon: React.ReactNode; pulse: boolean
}> = {
  idle:         { bg: 'bg-slate-100',  text: 'text-slate-500',  dot: 'bg-slate-400',  label: 'No Device',     icon: <WifiOff size={11} />,                               pulse: false },
  connecting:   { bg: 'bg-amber-50',   text: 'text-amber-700',  dot: 'bg-amber-400',  label: 'Connecting…',   icon: <Loader2 size={11} className="animate-spin" />,      pulse: true  },
  connected:    { bg: 'bg-green-50',   text: 'text-green-700',  dot: 'bg-green-500',  label: 'Connected',     icon: <Wifi size={11} />,                                  pulse: false },
  reconnecting: { bg: 'bg-orange-50',  text: 'text-orange-700', dot: 'bg-orange-400', label: 'Reconnecting…', icon: <RefreshCw size={11} className="animate-spin" />,    pulse: true  },
  disconnected: { bg: 'bg-slate-100',  text: 'text-slate-500',  dot: 'bg-slate-400',  label: 'Disconnected',  icon: <WifiOff size={11} />,                               pulse: false },
  failed:       { bg: 'bg-red-50',     text: 'text-red-600',    dot: 'bg-red-500',    label: 'Failed',        icon: <WifiOff size={11} />,                               pulse: false },
}

interface ConnectionStatusProps {
  className?: string
  showLabel?: boolean
}

export function ConnectionStatus({ className = '', showLabel = true }: ConnectionStatusProps) {
  const connState    = useDeviceStore((s) => s.connState)
  const pairedDevice = useDeviceStore((s) => s.pairedDevice)
  const cfg = CONFIG[connState]

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={connState}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${cfg.bg} ${cfg.text} ${className}`}
      >
        {/* Animated dot */}
        <span className="relative flex h-2 w-2">
          {cfg.pulse && (
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${cfg.dot} opacity-75`} />
          )}
          <span className={`relative inline-flex rounded-full h-2 w-2 ${cfg.dot}`} />
        </span>
        {cfg.icon}
        {showLabel && (
          <span>
            {connState === 'connected' && pairedDevice
              ? (pairedDevice.display_name ?? pairedDevice.device_id)
              : cfg.label}
          </span>
        )}
      </motion.div>
    </AnimatePresence>
  )
}
