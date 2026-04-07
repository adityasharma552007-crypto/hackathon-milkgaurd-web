'use client'

/**
 * /hardware — IoT Device Management Page
 *
 * Sections:
 *  1. Connected device panel (if paired)
 *  2. Network scanner → discovered device cards
 *  3. Settings (IP range, timeout)
 *  4. Live test controls (start test, progress, results)
 */

import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Cpu, Wifi, ScanLine, Settings2, ChevronLeft,
  Loader2, AlertCircle, RefreshCw, Play, Zap,
  PlugZap, Info, ClipboardList,
} from 'lucide-react'
import Link from 'next/link'
import { useDeviceStore, DiscoveredDevice } from '@/store/useDeviceStore'
import { useDeviceSocket } from '@/hooks/useDeviceSocket'
import { ConnectionStatus } from '@/components/ConnectionStatus'
import { DeviceCard } from '@/components/DeviceCard'
import { TestProgress } from '@/components/TestProgress'
import { IoTResultsDisplay } from '@/components/IoTResultsDisplay'

// ─── Tabs ─────────────────────────────────────────────────────────────────────
type Tab = 'device' | 'scanner' | 'settings'

// ─── Settings defaults ────────────────────────────────────────────────────────
function useSettings() {
  const [prefix,  setPrefix]  = useState(
    process.env.NEXT_PUBLIC_DEVICE_IP_PREFIX ?? '192.168.1'
  )
  const [start,   setStart]   = useState(
    Number(process.env.NEXT_PUBLIC_DEVICE_IP_START ?? 1)
  )
  const [end,     setEnd]     = useState(
    Math.min(50, Number(process.env.NEXT_PUBLIC_DEVICE_IP_END ?? 50))
  )
  const [port,    setPort]    = useState(
    Number(process.env.NEXT_PUBLIC_DEVICE_PORT     ?? 8080)
  )

  // Persist to localStorage
  useEffect(() => {
    const raw = localStorage.getItem('mg-device-settings')
    if (raw) {
      try {
        const s = JSON.parse(raw)
        if (s.prefix) setPrefix(s.prefix)
        if (s.start)  setStart(s.start)
        if (s.end)    setEnd(s.end)
        if (s.port)   setPort(s.port)
      } catch { /* ignore */ }
    }
  }, [])

  const save = () =>
    localStorage.setItem('mg-device-settings', JSON.stringify({ prefix, start, end, port }))

  return { prefix, setPrefix, start, setStart, end, setEnd, port, setPort, save }
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function HardwarePage() {
  const [tab,         setTab]         = useState<Tab>('device')
  const [scanLoading, setScanLoading] = useState(false)
  const [scanError,   setScanError]   = useState<string | null>(null)

  const {
    pairedDevice, connState, discovered,
    testPhase, testError,
    setDiscovered, setScanning, setScanError: storeSetScanError,
    resetTest,
  } = useDeviceStore()

  const { startTest } = useDeviceSocket()
  const settings = useSettings()

  const isConnected  = connState === 'connected'
  const isConnecting = connState === 'connecting' || connState === 'reconnecting'

  // ─── Scan network ──────────────────────────────────────────────────────────
  const scanNetwork = useCallback(async () => {
    setScanLoading(true)
    setScanError(null)
    setScanning(true)

    const params = new URLSearchParams({
      prefix: settings.prefix,
      start:  String(settings.start),
      end:    String(settings.end),
      port:   String(settings.port),
    })

    try {
      const res  = await fetch(`/api/devices/scan?${params}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Scan failed')
      setDiscovered(data.devices ?? [])
    } catch (e: any) {
      setScanError(e.message)
      storeSetScanError(e.message)
    } finally {
      setScanLoading(false)
      setScanning(false)
    }
  }, [settings, setDiscovered, setScanning, storeSetScanError])

  // Auto-scan once on mount when on scanner tab
  useEffect(() => {
    if (tab === 'scanner' && discovered.length === 0) {
      scanNetwork()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab])

  // ─── Save / forget helpers ─────────────────────────────────────────────────
  const handleSave = useCallback(async (device: DiscoveredDevice) => {
    await fetch('/api/devices/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...device,
        ip_address: device.ip,   // API expects ip_address, store has ip
      }),
    })
  }, [])

  const handleForget = useCallback(async (device: DiscoveredDevice) => {
    await fetch('/api/devices/save', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ip_address: device.ip }),
    })
  }, [])

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col min-h-screen bg-white">

      {/* ── Header ── */}
      <header className="px-5 pt-12 pb-4 bg-white">
        <div className="flex items-center justify-between mb-1">
          <Link href="/home" className="p-2 bg-slate-100 rounded-full">
            <ChevronLeft size={20} className="text-[#60A5FA]" />
          </Link>
          <h1 className="text-xl font-black text-[#60A5FA] uppercase tracking-tighter">Device</h1>
          <ConnectionStatus showLabel={false} />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mt-4 bg-slate-100 p-1 rounded-2xl">
          {([
            { id: 'device',  label: 'Device',  icon: Cpu       },
            { id: 'scanner', label: 'Scanner', icon: ScanLine  },
            { id: 'settings',label: 'Settings',icon: Settings2 },
          ] as { id: Tab; label: string; icon: any }[]).map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all ${
                tab === t.id
                  ? 'bg-white text-[#60A5FA] shadow-sm'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <t.icon size={13} />
              {t.label}
            </button>
          ))}
        </div>
      </header>

      {/* ── Body ── */}
      <main className="flex-1 px-5 py-4 pb-28 space-y-4">
        <AnimatePresence mode="wait">

          {/* ════ DEVICE TAB ════ */}
          {tab === 'device' && (
            <motion.div
              key="device"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-4"
            >
              {!pairedDevice ? (
                /* No device paired */
                <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
                  <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center">
                    <Cpu size={32} className="text-slate-300" />
                  </div>
                  <div>
                    <p className="font-black text-slate-700 tracking-tight">No Device Connected</p>
                    <p className="text-slate-400 text-xs mt-1 max-w-[220px] leading-relaxed">
                      Go to the <strong>Scanner</strong> tab to find your MilkGuard Pod on the network.
                    </p>
                  </div>
                  <button
                    onClick={() => setTab('scanner')}
                    className="flex items-center gap-2 px-5 py-3 bg-[#60A5FA] text-white text-sm font-black rounded-2xl hover:bg-[#3B82F6] transition-colors"
                  >
                    <ScanLine size={15} /> Scan for Devices
                  </button>
                </div>
              ) : (
                <>
                  {/* Paired device info */}
                  <div className="rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                    {/* Coloured header */}
                    <div className={`px-5 py-4 flex items-center justify-between ${
                      isConnected ? 'bg-[#60A5FA]' : 'bg-slate-700'
                    }`}>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center">
                          <Cpu size={20} className="text-white" />
                        </div>
                        <div>
                          <p className="text-white font-black text-base tracking-tight leading-none">
                            {pairedDevice.display_name ?? pairedDevice.device_id ?? 'MilkGuard Pod'}
                          </p>
                          <p className="text-white/60 text-[10px] font-bold mt-0.5 uppercase tracking-widest">
                            {pairedDevice.ip}:{pairedDevice.port}
                          </p>
                        </div>
                      </div>
                      <ConnectionStatus showLabel={false} className="!bg-white/20 !text-white" />
                    </div>

                    {/* Device metadata */}
                    <div className="px-5 py-4 grid grid-cols-2 gap-3">
                      {[
                        { label: 'Firmware', value: pairedDevice.firmware ?? 'Unknown' },
                        { label: 'Model',    value: pairedDevice.model    ?? 'Unknown' },
                        { label: 'IP',       value: pairedDevice.ip },
                        { label: 'Port',     value: String(pairedDevice.port) },
                      ].map((row) => (
                        <div key={row.label} className="bg-slate-50 rounded-xl px-3 py-2">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{row.label}</p>
                          <p className="text-sm font-black text-slate-700 mt-0.5 truncate">{row.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* ── Test controls ── */}
                  {testPhase === 'idle' && (
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={startTest}
                      disabled={!isConnected}
                      className="w-full flex items-center justify-center gap-2.5 py-5 bg-[#60A5FA] disabled:bg-slate-200 text-white disabled:text-slate-400 rounded-2xl font-black text-base tracking-tight hover:bg-[#3B82F6] transition-colors shadow-lg shadow-green-900/20"
                    >
                      {isConnecting ? (
                        <><Loader2 size={20} className="animate-spin" /> Connecting…</>
                      ) : isConnected ? (
                        <><Play size={20} fill="white" /> Start Test</>
                      ) : (
                        <><PlugZap size={20} /> Connect Device First</>
                      )}
                    </motion.button>
                  )}

                  {/* Live test progress */}
                  {(testPhase === 'running') && <TestProgress />}

                  {/* Test error */}
                  {testPhase === 'error' && (
                    <div className="rounded-2xl bg-red-50 border border-red-100 p-4 space-y-3">
                      <div className="flex items-center gap-2 text-red-600">
                        <AlertCircle size={18} />
                        <p className="font-bold text-sm">{testError}</p>
                      </div>
                      <button
                        onClick={resetTest}
                        className="text-xs text-red-500 font-bold hover:underline flex items-center gap-1"
                      >
                        <RefreshCw size={12} /> Try again
                      </button>
                    </div>
                  )}

                  {/* Results */}
                  {testPhase === 'done' && <IoTResultsDisplay />}
                </>
              )}
            </motion.div>
          )}

          {/* ════ SCANNER TAB ════ */}
          {tab === 'scanner' && (
            <motion.div
              key="scanner"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-4"
            >
              {/* Scan button */}
              <button
                onClick={scanNetwork}
                disabled={scanLoading}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl border-2 border-dashed border-[#60A5FA]/30 text-[#60A5FA] font-black text-sm hover:bg-[#60A5FA]/5 transition-colors disabled:opacity-60"
              >
                {scanLoading ? (
                  <><Loader2 size={16} className="animate-spin" /> Scanning {settings.prefix}.{settings.start}–{settings.end}…</>
                ) : (
                  <><ScanLine size={16} /> Scan Network</>
                )}
              </button>

              {/* Scan error */}
              {scanError && (
                <div className="flex items-center gap-2 text-red-500 text-xs font-bold bg-red-50 px-3 py-2 rounded-xl">
                  <AlertCircle size={14} /> {scanError}
                </div>
              )}

              {/* Hint */}
              <div className="flex items-start gap-2 bg-blue-50 px-3 py-2 rounded-xl">
                <Info size={14} className="text-blue-400 shrink-0 mt-0.5" />
                <p className="text-[10px] text-blue-400 font-medium leading-relaxed">
                  Your ESP device and this phone must be on the same Wi-Fi network.
                  Scanning range: <strong>{settings.prefix}.{settings.start}–{settings.end}</strong>
                </p>
              </div>

              {/* Found devices */}
              {!scanLoading && discovered.length > 0 && (
                <div className="space-y-3">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                    Found {discovered.length} device{discovered.length !== 1 ? 's' : ''}
                  </p>
                  {discovered.map((device) => (
                    <DeviceCard
                      key={device.ip}
                      device={device}
                      onSave={handleSave}
                      onForget={handleForget}
                    />
                  ))}
                </div>
              )}

              {/* No devices found */}
              {!scanLoading && discovered.length === 0 && !scanError && (
                <div className="flex flex-col items-center py-12 text-center gap-3">
                  <Wifi size={32} className="text-slate-200" />
                  <p className="text-slate-400 text-sm font-bold">No devices found</p>
                  <p className="text-slate-300 text-xs max-w-[220px] leading-relaxed">
                    Make sure your ESP device is powered on and connected to the same network.
                    Tap "Scan Network" to try again.
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {/* ════ SETTINGS TAB ════ */}
          {tab === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-5"
            >
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                Network Settings
              </p>

              {/* IP Prefix */}
              <div className="space-y-1">
                <label className="text-xs font-black text-slate-600 uppercase tracking-wider">
                  IP Prefix
                </label>
                <input
                  type="text"
                  value={settings.prefix}
                  onChange={(e) => settings.setPrefix(e.target.value)}
                  placeholder="192.168.1"
                  className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-3 text-sm font-bold focus:outline-none focus:border-[#60A5FA]"
                />
                <p className="text-[10px] text-slate-400">e.g. 192.168.1 or 192.168.0</p>
              </div>

              {/* Range */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-600 uppercase tracking-wider">
                    Range Start
                  </label>
                  <input
                    type="number" min={1} max={254}
                    value={settings.start}
                    onChange={(e) => settings.setStart(Number(e.target.value))}
                    className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-3 text-sm font-bold focus:outline-none focus:border-[#60A5FA]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-600 uppercase tracking-wider">
                    Range End
                  </label>
                  <input
                    type="number" min={1} max={254}
                    value={settings.end}
                    onChange={(e) => settings.setEnd(Number(e.target.value))}
                    className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-3 text-sm font-bold focus:outline-none focus:border-[#60A5FA]"
                  />
                </div>
              </div>

              {/* Port */}
              <div className="space-y-1">
                <label className="text-xs font-black text-slate-600 uppercase tracking-wider">
                  Device Port
                </label>
                <input
                  type="number" min={1} max={65535}
                  value={settings.port}
                  onChange={(e) => settings.setPort(Number(e.target.value))}
                  placeholder="8080"
                  className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-3 text-sm font-bold focus:outline-none focus:border-[#60A5FA]"
                />
              </div>

              {/* Save */}
              <button
                onClick={() => { settings.save(); setTab('scanner') }}
                className="w-full py-3 bg-[#60A5FA] text-white rounded-xl font-black text-sm hover:bg-[#3B82F6] transition-colors"
              >
                Save & Scan
              </button>

              {/* Protocol info */}
              <div className="rounded-2xl border border-slate-100 p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <ClipboardList size={14} className="text-slate-400" />
                  <p className="text-xs font-black text-slate-600 uppercase tracking-wider">
                    ESP Protocol Reference
                  </p>
                </div>
                <div className="bg-slate-900 rounded-xl p-3 text-[10px] font-mono text-green-400 space-y-1 overflow-x-auto">
                  <p>{`// HTTP info endpoint`}</p>
                  <p className="text-slate-400">{`GET http://<ip>:${settings.port}/info`}</p>
                  <p className="mt-2">{`// WebSocket endpoint`}</p>
                  <p className="text-slate-400">{`ws://<ip>:${settings.port}/ws`}</p>
                  <p className="mt-2">{`// Start test command`}</p>
                  <p className="text-slate-400">{`{ "cmd": "start_test" }`}</p>
                  <p className="mt-2">{`// Result frame`}</p>
                  <p className="text-slate-400">{`{ "type": "result", "safetyScore": 87, ... }`}</p>
                </div>
              </div>

              {/* Demo mode info */}
              <div className="flex items-start gap-2 bg-[#60A5FA]/5 px-3 py-2.5 rounded-xl">
                <Zap size={14} className="text-[#60A5FA] shrink-0 mt-0.5" />
                <p className="text-[10px] text-[#60A5FA] font-medium leading-relaxed">
                  <strong>No device yet?</strong> The scan will still show the UI. Connect a real ESP or add a demo device via the scanner to preview the test flow.
                </p>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>
    </div>
  )
}
