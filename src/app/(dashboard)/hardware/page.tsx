'use client'

/**
 * /hardware — MilkGuard Hardware Connectivity V1: Scan from Hardware
 * 
 * Provides direct Bluetooth Low Energy (BLE) connectivity to the MilkGuard ESP32
 * multispectral pod, receiving and strictly validating 14 spectroscopy signals.
 */

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bluetooth,
  BluetoothOff,
  BluetoothSearching,
  Cpu,
  Play,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Sliders,
  ShieldCheck,
  Zap,
  Info,
  Layers,
  Code2,
  Copy,
  Check,
  ChevronRight,
  Radio,
  BarChart3,
  Terminal,
} from 'lucide-react'
import Link from 'next/link'
import { useBleHardwareStore } from '@/store/useBleHardwareStore'
import { SPECTROSCOPY_CHANNELS } from '@/lib/hardware/hardwareTypes'
import { Button } from '@/components/ui/button'

export default function HardwareScanPage() {
  const {
    connectionState,
    deviceInfo,
    errorMessage,
    scanStatus,
    readings,
    lastPayload,
    lastRawString,
    validationErrors,
    isSimulationMode,
    compatibility,
    checkCompatibility,
    setSimulationMode,
    connectDevice,
    startHardwareScan,
    disconnectDevice,
    clearErrors,
    resetScan,
  } = useBleHardwareStore()

  const [activeTab, setActiveTab] = useState<'scan' | 'telemetry' | 'firmware'>('scan')
  const [copiedCode, setCopiedCode] = useState(false)
  const [showRawPayload, setShowRawPayload] = useState(false)

  // Re-check compatibility on mount
  useEffect(() => {
    checkCompatibility()
  }, [checkCompatibility])

  const isConnected = connectionState === 'connected'
  const isConnecting = connectionState === 'connecting' || connectionState === 'requesting'

  const copyFirmwareCode = () => {
    const code = `// MilkGuard ESP32 BLE Firmware V1 Reference
#include <BLEDevice.h>
#include <BLEServer.h>
#include <ArduinoJson.h>

#define SERVICE_UUID      "4fafc201-1fb5-459e-8fcc-c5c9c331914b"
#define DATA_CHAR_UUID    "beb5483e-36e1-4688-b7f5-ea07361b26a8"
#define COMMAND_CHAR_UUID "d290e653-94c0-42b2-b362-09d2458b40e1"
#define DEVICE_NAME       "MilkGuard-ESP32"
#define DEVICE_UID        "MG-DEVICE-001"
// Flash sketch from docs/ESP32_BLE_FIRMWARE_SPEC.md`

    navigator.clipboard?.writeText(code)
    setCopiedCode(true)
    setTimeout(() => setCopiedCode(false), 2000)
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#f8f9ff] text-[#001d36] pb-24 md:pb-12 max-w-4xl mx-auto px-4 md:px-6">
      
      {/* ── Top Header & Title ── */}
      <div className="pt-6 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#d1e4ff]">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-gradient-to-br from-[#00668a] to-[#004c69] text-white shadow-sm">
              <Cpu size={20} />
            </span>
            <div>
              <h1 className="text-2xl font-black text-[#001d36] tracking-tight">Scan from Hardware</h1>
              <p className="text-xs font-semibold text-[#51666d]">
                ESP32 Multispectral Sensor Pod · Bluetooth Low Energy (V1)
              </p>
            </div>
          </div>
        </div>

        {/* Global Connection Badge & Mode Switch */}
        <div className="flex items-center gap-2.5">
          {/* Simulation Mode Toggle Button */}
          <button
            onClick={() => setSimulationMode(!isSimulationMode)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
              isSimulationMode
                ? 'bg-[#fef3c7] text-[#92400e] border-[#fde68a] shadow-sm'
                : 'bg-white text-[#51666d] border-[#d1e4ff] hover:bg-[#e5efff]'
            }`}
          >
            <Sliders size={13} />
            <span>{isSimulationMode ? 'Simulation: ACTIVE' : 'Simulation: OFF'}</span>
          </button>

          {/* Connection Status Indicator */}
          <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider border shadow-sm ${
            isConnected
              ? 'bg-[#e6f4ea] text-[#137333] border-[#a8dab5]'
              : isConnecting
              ? 'bg-[#fef7e0] text-[#b06000] border-[#fce8b2] animate-pulse'
              : 'bg-[#f1f3f4] text-[#5f6368] border-[#dadce0]'
          }`}>
            <span className={`w-2.5 h-2.5 rounded-full ${
              isConnected
                ? 'bg-[#1e8e3e] shadow-[0_0_8px_#1e8e3e]'
                : isConnecting
                ? 'bg-[#f9ab00]'
                : 'bg-[#80868b]'
            }`} />
            <span>{isConnected ? '● CONNECTED' : isConnecting ? 'SCANNING...' : '● DISCONNECTED'}</span>
          </div>
        </div>
      </div>

      {/* ── Mode Navigation Tabs ── */}
      <div className="flex gap-2 mt-4 bg-white p-1 rounded-2xl border border-[#d1e4ff] ambient-shadow">
        {[
          { id: 'scan', label: 'Hardware Workflow', icon: Radio },
          { id: 'telemetry', label: '14-Signal Telemetry', icon: BarChart3 },
          { id: 'firmware', label: 'ESP32 Firmware Code', icon: Code2 },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === tab.id
                ? 'bg-[#00668a] text-white shadow-sm'
                : 'text-[#51666d] hover:bg-[#e5efff]/60'
            }`}
          >
            <tab.icon size={15} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ── Browser Compatibility Warning Banner (If unsupported) ── */}
      {!compatibility.isSupported && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-4 rounded-2xl bg-[#fff8e1] border border-[#ffe082] flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="text-[#b06000] shrink-0 mt-0.5" size={18} />
            <div>
              <p className="font-extrabold text-[#78350f]">Web Bluetooth Limited in Current Environment</p>
              <p className="text-[#92400e] mt-0.5">
                {compatibility.errorReason} {compatibility.browserRecommendation}
              </p>
            </div>
          </div>
          <Button
            size="sm"
            onClick={() => setSimulationMode(true)}
            className="bg-[#b06000] hover:bg-[#92400e] text-white font-bold rounded-xl shrink-0"
          >
            Enable Test Mode
          </Button>
        </motion.div>
      )}

      {/* ── Simulation Mode Banner Notice ── */}
      {isSimulationMode && (
        <div className="mt-4 p-3 rounded-2xl bg-[#eff6ff] border border-[#bfdbfe] flex items-center justify-between text-xs text-[#1e40af]">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md bg-[#3b82f6] text-white font-black uppercase text-[10px] tracking-wider">
              SIMULATION / TEST MODE
            </span>
            <span className="font-semibold">
              Testing UI without physical ESP32. Sensor readings are generated as clearly labeled test telemetry.
            </span>
          </div>
          <button
            onClick={() => setSimulationMode(false)}
            className="text-[11px] font-bold text-[#2563eb] hover:underline"
          >
            Disable
          </button>
        </div>
      )}

      {/* ── Global Error / Validation Alert Banner ── */}
      {errorMessage && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-4 p-4 rounded-2xl bg-[#fdf2f2] border border-[#f8b4b4] flex items-center justify-between gap-3 text-xs text-[#9b1c1c]"
        >
          <div className="flex items-center gap-2">
            <AlertTriangle size={18} className="shrink-0" />
            <span className="font-bold">{errorMessage}</span>
          </div>
          <button onClick={clearErrors} className="font-bold hover:underline text-[11px]">
            Dismiss
          </button>
        </motion.div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* ── TAB 1: HARDWARE WORKFLOW ── */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'scan' && (
        <div className="mt-5 space-y-5">
          
          {/* Connection Card State Machine */}
          <div className="bg-white rounded-3xl p-6 border border-[#d1e4ff] ambient-shadow relative overflow-hidden">
            
            {/* Top Device Identity */}
            <div className="flex items-center justify-between pb-5 border-b border-[#e5efff]">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                  isConnected
                    ? 'bg-[#30c5b3]/15 text-[#006b5f]'
                    : isConnecting
                    ? 'bg-[#fef7e0] text-[#b06000]'
                    : 'bg-[#f1f5f9] text-[#64748b]'
                }`}>
                  {isConnecting ? (
                    <BluetoothSearching size={26} className="animate-spin text-[#00668a]" />
                  ) : isConnected ? (
                    <Bluetooth size={26} className="text-[#006b5f]" />
                  ) : (
                    <BluetoothOff size={26} className="text-[#94a3b8]" />
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-black text-[#001d36]">
                      {isConnected ? (deviceInfo?.name || 'MilkGuard-ESP32') : 'MilkGuard Spectral Pod'}
                    </h2>
                    {deviceInfo?.isSimulated && (
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                        TEST DATA
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-mono text-[#64748b] mt-0.5">
                    Device ID: <strong className="text-[#001d36]">{deviceInfo?.deviceUid || 'MG-DEVICE-001 (Ready)'}</strong>
                  </p>
                </div>
              </div>

              {/* RSSI or Firmware tag */}
              {isConnected && (
                <div className="hidden sm:flex flex-col items-end text-xs">
                  <span className="font-bold text-[#006b5f] flex items-center gap-1">
                    <CheckCircle2 size={13} /> GATT Paired
                  </span>
                  <span className="text-[10px] text-[#64748b]">BLE 2.4 GHz</span>
                </div>
              )}
            </div>

            {/* Middle Workflow State Display */}
            <div className="py-6 flex flex-col items-center justify-center text-center">
              
              {/* STATE 1: DISCONNECTED */}
              {!isConnected && !isConnecting && (
                <div className="space-y-4 max-w-md">
                  <div className="w-16 h-16 rounded-full bg-[#e5efff] text-[#00668a] flex items-center justify-center mx-auto shadow-inner">
                    <Bluetooth size={32} />
                  </div>
                  <div>
                    <p className="text-xl font-extrabold text-[#001d36]">DISCONNECTED</p>
                    <p className="text-xs text-[#51666d] mt-1 leading-relaxed">
                      Power on your MilkGuard ESP32 device. Ensure it is advertising as{' '}
                      <code className="font-mono bg-[#e5efff] text-[#00668a] px-1 py-0.5 rounded text-[11px]">
                        MilkGuard-ESP32
                      </code>
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2.5 justify-center pt-2">
                    <Button
                      onClick={connectDevice}
                      size="lg"
                      className="bg-[#00668a] hover:bg-[#004c69] text-white font-extrabold rounded-2xl px-6 h-12 shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                    >
                      <Bluetooth size={18} />
                      <span>Connect MilkGuard Device</span>
                    </Button>

                    {!isSimulationMode && (
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSimulationMode(true)
                          connectDevice()
                        }}
                        className="border-[#c4e7ff] text-[#00668a] hover:bg-[#e5efff] font-bold rounded-2xl h-12"
                      >
                        <Zap size={16} className="text-amber-500 mr-1" />
                        <span>Test Hardware Connection</span>
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {/* STATE 2: SCANNING FOR DEVICES */}
              {isConnecting && (
                <div className="space-y-4 max-w-md">
                  <div className="relative w-20 h-20 flex items-center justify-center mx-auto">
                    <span className="absolute w-20 h-20 rounded-full bg-[#00668a]/10 animate-ping" />
                    <span className="absolute w-14 h-14 rounded-full bg-[#00668a]/20 animate-ping [animation-delay:0.4s]" />
                    <div className="relative z-10 w-12 h-12 rounded-full bg-[#00668a] text-white flex items-center justify-center shadow-md">
                      <BluetoothSearching size={24} className="animate-pulse" />
                    </div>
                  </div>
                  <div>
                    <p className="text-lg font-black text-[#001d36] tracking-tight">SCANNING FOR DEVICES...</p>
                    <p className="text-xs text-[#51666d] mt-1">
                      Looking for BLE devices matching <strong>MilkGuard-ESP32</strong> in range…
                    </p>
                  </div>
                </div>
              )}

              {/* STATE 3: CONNECTED */}
              {isConnected && (
                <div className="w-full space-y-6">
                  {/* Status Banner */}
                  <div className="bg-[#f8f9ff] border border-[#d1e4ff] rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
                    <div className="flex items-center gap-3">
                      <span className="w-3 h-3 rounded-full bg-[#1e8e3e] animate-ping" />
                      <div>
                        <p className="text-xs font-black uppercase tracking-wider text-[#006b5f]">
                          {scanStatus === 'idle' && 'Connected · Waiting for measurement...'}
                          {scanStatus === 'waiting' && 'Connected · Triggered sensor measurement...'}
                          {scanStatus === 'receiving' && 'Receiving measurement...'}
                          {scanStatus === 'received' && 'Measurement received ✓'}
                          {scanStatus === 'invalid' && 'Invalid sensor data received.'}
                        </p>
                        <p className="text-xs text-[#51666d]">
                          {scanStatus === 'received'
                            ? 'All 14 spectroscopy channels successfully validated.'
                            : 'Ready to perform multispectral milk sample inspection.'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => startHardwareScan()}
                        disabled={scanStatus === 'waiting' || scanStatus === 'receiving'}
                        className="bg-[#00668a] hover:bg-[#004c69] text-white font-extrabold rounded-xl px-5 h-11 shadow-md transition-all flex items-center gap-2"
                      >
                        <Play size={16} fill="white" />
                        <span>{scanStatus === 'received' ? 'Scan Again' : 'Start Scan'}</span>
                      </Button>

                      <Button
                        variant="ghost"
                        onClick={disconnectDevice}
                        className="text-[#ba1a1a] hover:bg-[#ffdad6]/40 font-bold rounded-xl h-11 text-xs"
                      >
                        Disconnect
                      </Button>
                    </div>
                  </div>

                  {/* Validation Error Details (If invalid) */}
                  {scanStatus === 'invalid' && validationErrors.length > 0 && (
                    <div className="p-4 rounded-2xl bg-[#fff5f5] border border-[#fed7d7] text-left space-y-2">
                      <div className="flex items-center gap-2 text-[#c53030] font-extrabold text-xs uppercase tracking-wider">
                        <AlertTriangle size={16} />
                        <span>Invalid Sensor Data Received</span>
                      </div>
                      <ul className="list-disc pl-5 text-xs text-[#742a2a] space-y-1 font-mono">
                        {validationErrors.map((err, idx) => (
                          <li key={idx}>{err}</li>
                        ))}
                      </ul>
                      <p className="text-[11px] text-[#742a2a] font-sans">
                        Ensure your ESP32 sends all 14 signals (<code className="bg-red-100 px-1 rounded">signal_01</code> to <code className="bg-red-100 px-1 rounded">signal_14</code>) as finite numbers.
                      </p>
                    </div>
                  )}

                  {/* 14 RECEIVED VALUES PREVIEW */}
                  {readings && (
                    <div className="text-left space-y-4 pt-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 size={18} className="text-[#006b5f]" />
                          <h3 className="text-base font-extrabold text-[#001d36]">
                            Received Spectroscopy Signals (14 Channels)
                          </h3>
                        </div>
                        {isSimulationMode && (
                          <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                            TEST DATA
                          </span>
                        )}
                      </div>

                      {/* 14 Signals Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5">
                        {SPECTROSCOPY_CHANNELS.map((ch, idx) => {
                          const val = readings[ch]
                          const pct = Math.min(100, Math.max(0, Math.round(val * 100)))
                          return (
                            <div
                              key={ch}
                              className="bg-white rounded-xl p-2.5 border border-[#d1e4ff] flex flex-col justify-between shadow-sm hover:border-[#00668a] transition-all"
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-mono font-bold text-[#51666d]">
                                  CH{idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
                                </span>
                                <span className="text-[9px] font-mono text-[#00668a] font-bold">
                                  {val.toFixed(3)}
                                </span>
                              </div>

                              {/* Visual Intensity Bar */}
                              <div className="w-full bg-[#e5efff] h-2 rounded-full overflow-hidden my-1.5">
                                <div
                                  className="h-full bg-gradient-to-r from-[#30c5b3] to-[#00668a] rounded-full transition-all duration-500"
                                  style={{ width: `${pct}%` }}
                                />
                              </div>

                              <span className="text-[9px] text-[#64748b] truncate">
                                {ch}
                              </span>
                            </div>
                          )
                        })}
                      </div>

                      {/* Ready for Database Submission Badge (No save in V1) */}
                      <div className="p-3 rounded-xl bg-[#e6f4ea] border border-[#a8dab5] flex items-center justify-between text-xs text-[#137333]">
                        <div className="flex items-center gap-2">
                          <ShieldCheck size={16} />
                          <span className="font-bold">
                            Payload verified · 14/14 signals valid (V1 Hardware Milestone complete)
                          </span>
                        </div>
                        <span className="text-[11px] font-mono text-[#137333]/80">
                          Ready for V2 Database Pipeline
                        </span>
                      </div>
                    </div>
                  )}

                </div>
              )}

            </div>

            {/* Bottom Technical Telemetry Bar */}
            <div className="pt-4 border-t border-[#e5efff] flex flex-wrap items-center justify-between gap-3 text-xs text-[#64748b]">
              <div className="flex items-center gap-4">
                <span>Protocol: <strong>BLE GATT UTF-8</strong></span>
                <span>UUID: <code className="font-mono text-[10px] text-[#00668a]">4fafc201-...</code></span>
              </div>
              
              {isConnected && (
                <button
                  onClick={() => setShowRawPayload(!showRawPayload)}
                  className="flex items-center gap-1 text-[11px] font-bold text-[#00668a] hover:underline"
                >
                  <Terminal size={12} />
                  <span>{showRawPayload ? 'Hide Raw Packet' : 'Inspect Raw Packet'}</span>
                </button>
              )}
            </div>

            {/* Raw Packet Inspector */}
            {showRawPayload && lastRawString && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-3 p-3 rounded-xl bg-[#0f172a] text-[#38bdf8] font-mono text-[11px] overflow-x-auto"
              >
                <p className="text-slate-400 mb-1 text-[10px] uppercase font-bold">// Raw BLE Characteristic String</p>
                <pre>{lastRawString}</pre>
              </motion.div>
            )}

          </div>

          {/* Diagnostic & Simulation Testing Tools */}
          {isSimulationMode && isConnected && (
            <div className="bg-white rounded-2xl p-5 border border-[#d1e4ff] ambient-shadow space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-[#00668a] flex items-center gap-1.5">
                <Sliders size={14} />
                <span>Simulation Test Harness</span>
              </h3>
              <p className="text-xs text-[#51666d]">
                Use these buttons to verify application response to valid vs. malformed hardware packets:
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => startHardwareScan({ forceInvalid: false })}
                  className="border-[#c4e7ff] text-[#00668a] text-xs font-bold"
                >
                  <CheckCircle2 size={13} className="text-[#006b5f] mr-1" />
                  Emit Valid 14 Signals
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => startHardwareScan({ forceInvalid: true })}
                  className="border-[#fed7d7] text-[#c53030] hover:bg-red-50 text-xs font-bold"
                >
                  <AlertTriangle size={13} className="text-red-500 mr-1" />
                  Simulate Malformed Sensor Packet
                </Button>

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={disconnectDevice}
                  className="text-xs text-slate-500"
                >
                  Simulate Connection Drop
                </Button>
              </div>
            </div>
          )}

        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* ── TAB 2: 14-SIGNAL TELEMETRY ── */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'telemetry' && (
        <div className="mt-5 space-y-4">
          <div className="bg-white rounded-3xl p-6 border border-[#d1e4ff] ambient-shadow space-y-5">
            <div>
              <h3 className="text-lg font-black text-[#001d36]">Spectroscopy Telemetry Engine</h3>
              <p className="text-xs text-[#51666d]">
                The MilkGuard multispectral hardware captures 14 discrete optical absorption bands across visible and near-infrared (NIR) wavelengths.
              </p>
            </div>

            {readings ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {SPECTROSCOPY_CHANNELS.map((ch, idx) => {
                    const val = readings[ch]
                    const pct = Math.min(100, Math.max(0, Math.round(val * 100)))
                    return (
                      <div key={ch} className="p-3 rounded-2xl bg-[#f8f9ff] border border-[#d1e4ff] flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                          <span className="w-8 h-8 rounded-xl bg-[#00668a] text-white flex items-center justify-center font-mono font-bold text-xs">
                            {idx + 1}
                          </span>
                          <div>
                            <p className="text-xs font-bold text-[#001d36] font-mono">{ch}</p>
                            <p className="text-[10px] text-[#64748b]">Normalized Spectral Magnitude</p>
                          </div>
                        </div>

                        <div className="w-32 flex flex-col items-end">
                          <span className="font-mono font-black text-sm text-[#00668a]">{val.toFixed(4)}</span>
                          <div className="w-full bg-[#e5efff] h-2 rounded-full overflow-hidden mt-1">
                            <div
                              className="h-full bg-[#30c5b3] rounded-full"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-[#64748b] bg-[#f8f9ff] rounded-2xl border border-dashed border-[#d1e4ff]">
                <Layers size={36} className="mx-auto text-[#94a3b8] mb-2" />
                <p className="font-bold text-sm text-[#001d36]">No Telemetry Captured Yet</p>
                <p className="text-xs text-[#64748b] max-w-sm mx-auto mt-1">
                  Connect your MilkGuard ESP32 device and tap &quot;Start Scan&quot; to populate the 14-channel spectroscopy spectrum.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* ── TAB 3: ESP32 FIRMWARE CODE ── */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'firmware' && (
        <div className="mt-5 space-y-4">
          <div className="bg-white rounded-3xl p-6 border border-[#d1e4ff] ambient-shadow space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-[#001d36]">ESP32 Firmware Reference (Arduino C++)</h3>
                <p className="text-xs text-[#51666d]">
                  Flash this program onto your physical ESP32 to establish Web Bluetooth pairing with MilkGuard.
                </p>
              </div>

              <Button
                size="sm"
                onClick={copyFirmwareCode}
                className="bg-[#00668a] hover:bg-[#004c69] text-white text-xs font-bold rounded-xl flex items-center gap-1.5"
              >
                {copiedCode ? <Check size={14} /> : <Copy size={14} />}
                <span>{copiedCode ? 'Copied' : 'Copy Code'}</span>
              </Button>
            </div>

            <div className="rounded-2xl bg-[#0f172a] text-slate-100 p-4 font-mono text-xs overflow-x-auto max-h-[460px] border border-slate-800">
              <pre>{`// =========================================================================
// MilkGuard ESP32 BLE Firmware V1 Reference
// Service UUID:        4fafc201-1fb5-459e-8fcc-c5c9c331914b
// Data Char (Notify):  beb5483e-36e1-4688-b7f5-ea07361b26a8
// Command Char (Write):d290e653-94c0-42b2-b362-09d2458b40e1
// =========================================================================

#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>
#include <ArduinoJson.h>

#define SERVICE_UUID        "4fafc201-1fb5-459e-8fcc-c5c9c331914b"
#define DATA_CHAR_UUID      "beb5483e-36e1-4688-b7f5-ea07361b26a8"
#define COMMAND_CHAR_UUID   "d290e653-94c0-42b2-b362-09d2458b40e1"
#define DEVICE_NAME         "MilkGuard-ESP32"
#define DEVICE_UID          "MG-DEVICE-001"

BLEServer* pServer = NULL;
BLECharacteristic* pDataChar = NULL;
BLECharacteristic* pCmdChar = NULL;

void sendMeasurement() {
    StaticJsonDocument<512> doc;
    doc["device_uid"] = DEVICE_UID;
    doc["signal_01"]  = 0.823;
    doc["signal_02"]  = 0.791;
    doc["signal_03"]  = 0.754;
    doc["signal_04"]  = 0.718;
    doc["signal_05"]  = 0.682;
    doc["signal_06"]  = 0.645;
    doc["signal_07"]  = 0.612;
    doc["signal_08"]  = 0.578;
    doc["signal_09"]  = 0.542;
    doc["signal_10"]  = 0.510;
    doc["signal_11"]  = 0.476;
    doc["signal_12"]  = 0.439;
    doc["signal_13"]  = 0.398;
    doc["signal_14"]  = 0.291;

    char buffer[512];
    size_t len = serializeJson(doc, buffer);
    buffer[len] = '\\n';
    buffer[len + 1] = '\\0';

    pDataChar->setValue((uint8_t*)buffer, len + 1);
    pDataChar->notify();
    Serial.println("Emitted 14 spectroscopy signals via BLE.");
}`}</pre>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#e5efff] text-xs text-[#004c69] space-y-1">
              <p className="font-bold flex items-center gap-1">
                <Info size={14} /> Flashing Instructions
              </p>
              <p>
                1. Install the <strong>ArduinoJson</strong> library (by Benoît Blanchon) in Arduino IDE.
              </p>
              <p>
                2. Select <strong>ESP32 Dev Module</strong> and upload the sketch.
              </p>
              <p>
                3. Open the Serial Monitor at 115200 baud to see connection handshakes.
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
