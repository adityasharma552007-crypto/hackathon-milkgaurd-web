'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Cpu, Loader2, Check, Trash2, Battery,
  Wifi, PlugZap, Unplug,
} from 'lucide-react'
import { useDeviceStore, DiscoveredDevice } from '@/store/useDeviceStore'
import { useDeviceSocket } from '@/hooks/useDeviceSocket'

interface DeviceCardProps {
  device: DiscoveredDevice
  isSaved?: boolean
  onSave?:   (device: DiscoveredDevice) => Promise<void>
  onForget?: (device: DiscoveredDevice) => Promise<void>
  animate?: boolean
}

function BatteryBadge({ level }: { level: number }) {
  const color = level > 50 ? 'text-blue-400' : level > 20 ? 'text-amber-500' : 'text-red-500'
  return (
    <span className={`flex items-center gap-0.5 text-[10px] font-bold ${color}`}>
      <Battery size={12} />
      {level}%
    </span>
  )
}

export function DeviceCard({
  device,
  isSaved = false,
  onSave,
  onForget,
  animate = true,
}: DeviceCardProps) {
  const { connect, disconnect } = useDeviceSocket()
  const pairedDevice = useDeviceStore((s) => s.pairedDevice)
  const connState    = useDeviceStore((s) => s.connState)
  const setPaired    = useDeviceStore((s) => s.setPaired)
  const lastError    = useDeviceStore((s) => s.lastError)

  const isThisDevice  = pairedDevice?.ip === device.ip
  const isConnected   = isThisDevice && connState === 'connected'
  const isConnecting  = isThisDevice && (connState === 'connecting' || connState === 'reconnecting')

  const [saving,     setSaving]     = useState(false)
  const [forgetting, setForgetting] = useState(false)
  const [savedDone,  setSavedDone]  = useState(isSaved)

  const handleConnect = () => {
    setPaired(device)
    connect(device)
  }

  const handleSave = async () => {
    if (!onSave) return
    setSaving(true)
    await onSave(device)
    setSaving(false)
    setSavedDone(true)
  }

  const handleForget = async () => {
    if (!onForget) return
    setForgetting(true)
    if (isThisDevice) disconnect()
    await onForget(device)
    setForgetting(false)
  }

  const Wrapper     = animate ? motion.div : ('div' as any)
  const wrapperProps = animate
    ? { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 }, layout: true }
    : {}

  return (
    <Wrapper
      {...wrapperProps}
      className={`rounded-2xl border p-4 bg-white transition-all duration-300 ${
        isConnected
          ? 'border-green-200 shadow-md shadow-blue-50'
          : isConnecting
          ? 'border-amber-200'
          : 'border-slate-100 shadow-sm'
      }`}
    >
      {/* Header row */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
            isConnected ? 'bg-blue-50' : 'bg-slate-50'
          }`}>
            <Cpu size={20} className={isConnected ? 'text-blue-400' : 'text-slate-400'} />
          </div>
          <div>
            <p className="font-black text-slate-800 text-sm tracking-tight leading-none">
              {device.display_name ?? device.device_id ?? device.ip}
            </p>
            <p className="text-[10px] text-slate-400 font-bold mt-0.5">
              {device.ip}:{device.port}
            </p>
          </div>
        </div>

        {/* Online dot */}
        <div className={`w-2.5 h-2.5 rounded-full mt-1 ${
          isConnected  ? 'bg-blue-400 shadow-sm shadow-green-400' :
          isConnecting ? 'bg-amber-400 animate-pulse' :
          'bg-slate-200'
        }`} />
      </div>

      {/* Meta pills */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        {device.firmware && (
          <span className="text-[9px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-black uppercase tracking-wider">
            fw {device.firmware}
          </span>
        )}
        {device.model && (
          <span className="text-[9px] bg-blue-50 text-blue-400 px-2 py-0.5 rounded-full font-black uppercase tracking-wider">
            {device.model}
          </span>
        )}
        {device.battery !== undefined && <BatteryBadge level={device.battery} />}
        {isConnected && (
          <span className="text-[9px] bg-blue-50 text-blue-400 px-2 py-0.5 rounded-full font-black uppercase tracking-wider flex items-center gap-1">
            <Wifi size={9} /> Live
          </span>
        )}
      </div>

      {/* Error for this device */}
      {isThisDevice && lastError && !isConnected && (
        <p className="text-[10px] text-red-500 font-medium mb-2 leading-relaxed bg-red-50 px-2 py-1 rounded-lg">
          {lastError}
        </p>
      )}

      {/* CTA row */}
      <div className="flex items-center gap-2">
        {isConnected ? (
          <button
            onClick={disconnect}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-red-50 text-red-500 text-xs font-black hover:bg-red-100 transition-colors"
          >
            <Unplug size={13} /> Disconnect
          </button>
        ) : isConnecting ? (
          <button disabled className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-amber-50 text-amber-600 text-xs font-black cursor-not-allowed">
            <Loader2 size={13} className="animate-spin" /> Connecting…
          </button>
        ) : (
          <button
            onClick={handleConnect}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-[#60A5FA] text-white text-xs font-black hover:bg-[#3B82F6] transition-colors active:scale-95"
          >
            <PlugZap size={13} />
            {isThisDevice && connState === 'failed' ? 'Retry' : 'Connect'}
          </button>
        )}

        {/* Save (pair) button */}
        {!savedDone && onSave && (
          <button
            onClick={handleSave}
            disabled={saving}
            title="Save device"
            className="py-2.5 px-3 rounded-xl bg-slate-50 text-slate-500 text-xs font-black hover:bg-slate-100 transition-colors disabled:opacity-50"
          >
            {saving ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
          </button>
        )}

        {/* Forget button */}
        {(isSaved || savedDone) && onForget && (
          <button
            onClick={handleForget}
            disabled={forgetting}
            title="Forget device"
            className="py-2.5 px-3 rounded-xl bg-red-50 text-red-400 text-xs font-black hover:bg-red-100 transition-colors disabled:opacity-50"
          >
            {forgetting ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
          </button>
        )}
      </div>
    </Wrapper>
  )
}
