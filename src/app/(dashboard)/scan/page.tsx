'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Shield,
  Zap,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Bluetooth,
  Sparkles,
  Sliders,
  Radio,
  Cpu,
  RefreshCw,
  Activity,
  Check,
  ChevronRight,
  Play,
  Layers,
} from 'lucide-react'
import { useUserStore } from '@/store/useUserStore'
import { runScan, recordScanOnChain } from '@/lib/ai/scanEngine'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { useDeviceStore } from '@/store/useDeviceStore'
import { useBleHardwareStore } from '@/store/useBleHardwareStore'
import Link from 'next/link'
import { trackTestInitiation } from '@/components/analytics/GoogleAnalytics'
import BlockchainConfirmation from '@/components/BlockchainConfirmation'
import { PrototypeScannerModal } from '@/components/scanner/PrototypeScannerModal'
import { useTranslation } from '@/lib/i18n/useTranslation'

const SCAN_DURATION = 7500 // 7.5 seconds

export default function ScanPage() {
  const router = useRouter()
  const { user } = useUserStore()
  const { t } = useTranslation()
  const [isScanning, setIsScanning] = useState(false)
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState<'idle' | 'scanning' | 'analyzing' | 'error'>('idle')
  const [currentPhase, setCurrentPhase] = useState('Initializing Sensors...')
  const [error, setError] = useState<string | null>(null)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [pendingScanId, setPendingScanId] = useState<string | null>(null)
  const [showPrototypeModal, setShowPrototypeModal] = useState(false)

  // Holds the live blockchain promise so the overlay can await it
  const blockchainPromiseRef = useRef<Promise<string | null>>(Promise.resolve(null))

  // Stores
  const legacyConnState = useDeviceStore((s) => s.connState)
  const bleState = useBleHardwareStore((s) => s.connectionState)
  const bleDevice = useBleHardwareStore((s) => s.deviceInfo)
  const isSimulationMode = useBleHardwareStore((s) => s.isSimulationMode)
  const setSimulationMode = useBleHardwareStore((s) => s.setSimulationMode)
  const connectDevice = useBleHardwareStore((s) => s.connectDevice)

  // Connected if BLE is connected OR legacy WebSocket is connected
  const isConnected = bleState === 'connected' || legacyConnState === 'connected'

  // Dynamic Scan Phase description
  useEffect(() => {
    if (!isScanning) return
    if (progress < 22) {
      setCurrentPhase(t('phase_calibrating', 'Calibrating NIR Optical Array (410nm - 940nm)...'))
    } else if (progress < 50) {
      setCurrentPhase(t('phase_sampling', 'Sampling 14 Spectroscopy Channels...'))
    } else if (progress < 80) {
      setCurrentPhase(t('phase_computing', 'AI Computing Adulterant Fingerprint (Groq LLaMA)...'))
    } else {
      setCurrentPhase(t('phase_validating', 'Validating FSSAI Safety Standards...'))
    }
  }, [isScanning, progress, t])

  // Progress Bar Animation
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isScanning && progress < 100) {
      interval = setInterval(() => {
        setProgress((prev) => {
          const next = prev + (100 / (SCAN_DURATION / 100))
          return next > 100 ? 100 : next
        })
      }, 100)
    }
    return () => clearInterval(interval)
  }, [isScanning, progress])

  const handleStartScan = async () => {
    if (!user) return

    // Track conversion event for Google Analytics
    trackTestInitiation('hardware')

    // Haptic feedback if supported
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate([40, 60, 40])
    }

    setIsScanning(true)
    setStatus('scanning')
    setProgress(0)
    setError(null)

    setTimeout(async () => {
      setStatus('analyzing')
      try {
        const result = await runScan({ userId: user.id })
        if (result.success) {
          blockchainPromiseRef.current = recordScanOnChain(
            result.scanId,
            null,
            result.safetyScore,
            result.resultTier
          )

          setPendingScanId(result.scanId)
          setShowConfirmation(true)
          setIsScanning(false)
          setStatus('idle')
        } else {
          throw new Error(result.error || 'Spectroscopy analysis failed.')
        }
      } catch (err: any) {
        setError(err.message || 'Scan error occurred.')
        setStatus('error')
        setIsScanning(false)
      }
    }, SCAN_DURATION)
  }

  // Quick Simulation launcher for users without hardware on hand
  const handleQuickSimulationScan = async () => {
    setSimulationMode(true)
    await connectDevice()
    handleStartScan()
  }

  return (
    <div className="flex flex-col items-center justify-between min-h-[85vh] p-4 sm:p-6 py-6 sm:py-8 bg-gradient-to-b from-white via-[#f8f9ff] to-[#eef5fc] rounded-3xl ambient-shadow border border-[#d1e4ff] relative overflow-hidden max-w-2xl mx-auto">
      
      {/* Background Radial Glow */}
      <div className="absolute -top-24 -left-24 w-80 h-80 bg-[#38bdf8]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-[#30c5b3]/15 rounded-full blur-3xl pointer-events-none" />

      {/* Legacy Prototype Modal */}
      <PrototypeScannerModal isOpen={showPrototypeModal} onClose={() => setShowPrototypeModal(false)} />

      {/* Blockchain Confirmation Overlay */}
      <AnimatePresence>
        {showConfirmation && pendingScanId && (
          <BlockchainConfirmation
            blockchainPromise={blockchainPromiseRef.current}
            onComplete={(txHash) => {
              setShowConfirmation(false)
              router.push(`/history/${pendingScanId}`)
            }}
          />
        )}
      </AnimatePresence>

      {/* ── Top Bar: Hardware Status & Advanced Controls ── */}
      <div className="w-full flex items-center justify-between gap-2 z-20 pb-2">
        {/* Hardware Status Pill */}
        <Link
          href="/hardware"
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all border shadow-sm",
            isConnected
              ? "bg-[#e6f4ea] text-[#137333] border-[#a8dab5] hover:bg-[#d4edd9]"
              : "bg-[#fff8e1] text-[#b06000] border-[#ffe082] hover:bg-[#fef0cd]"
          )}
        >
          <span className="relative flex h-2.5 w-2.5">
            {isConnected && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#1e8e3e] opacity-75" />
            )}
            <span
              className={cn(
                "relative inline-flex rounded-full h-2.5 w-2.5",
                isConnected ? "bg-[#1e8e3e]" : "bg-[#f59e0b]"
              )}
            />
          </span>

          <span className="flex items-center gap-1">
            <Bluetooth size={13} />
            <span>
              {isConnected
                ? (bleDevice?.name || t('pod_online', 'MilkGuard-ESP32 Online'))
                : t('pod_offline', 'Pod Offline · Connect BLE')}
            </span>
          </span>
          <ChevronRight size={12} className="opacity-60" />
        </Link>

        {/* Prototype / Simulator Toggle */}
        <button
          onClick={() => setShowPrototypeModal(true)}
          className="text-xs font-bold text-[#00668a] hover:bg-[#e5efff] px-3 py-1.5 bg-[#e5efff]/80 rounded-full border border-[#c4e7ff] transition-all flex items-center gap-1.5 shadow-sm"
        >
          <Sliders size={13} />
          <span className="hidden sm:inline">{t('sim_btn', 'Hardware Sim')}</span>
          <span className="sm:hidden">Sim</span>
        </button>
      </div>

      {/* ── Header Section ── */}
      <div className="w-full text-center space-y-1.5 mt-2 z-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#e5efff] border border-[#c4e7ff] text-xs font-bold text-[#00668a] shadow-sm">
          <Activity size={13} className="text-[#30c5b3] animate-pulse" />
          <span>14-Channel NIR Multispectral Array</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-black text-[#001d36] tracking-tight">
          {status === 'idle'
            ? t('scanner_title', 'Milk Purity Scanner')
            : status === 'scanning'
            ? t('scanner_scanning', 'Scanning Milk Sample...')
            : t('scanner_analyzing', 'AI Computing Fingerprint...')}
        </h1>

        <p className="text-xs sm:text-sm font-medium text-[#51666d] max-w-md mx-auto">
          {status === 'idle'
            ? t('scanner_idle_desc', 'Insert the MilkGuard sensor pod into your milk sample and initiate scan')
            : currentPhase}
        </p>
      </div>

      {/* ── Center Animated Spectroscopy Scanner ── */}
      <div className="relative flex items-center justify-center w-72 h-72 sm:w-80 sm:h-80 my-4 sm:my-6 z-10">
        
        {/* Animated Rotating Radar Crosshairs & Rings */}
        <div className="absolute inset-0 rounded-full border border-[#00668a]/15 pointer-events-none" />
        <div className="absolute inset-4 rounded-full border border-dashed border-[#00668a]/20 pointer-events-none animate-[spin_60s_linear_infinite]" />
        
        <AnimatePresence>
          {isScanning && (
            <>
              {/* Outer Pulse Waves */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1.45, opacity: 0.3 }}
                exit={{ scale: 1.8, opacity: 0 }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
                className="absolute w-full h-full border-4 border-[#38bdf8] rounded-full"
              />
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1.25, opacity: 0.4 }}
                exit={{ scale: 1.6, opacity: 0 }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeOut", delay: 0.5 }}
                className="absolute w-full h-full border-2 border-[#30c5b3] rounded-full"
              />

              {/* High-Tech Rotating Scanner Ray */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="absolute w-full h-full rounded-full border-t-2 border-[#30c5b3] pointer-events-none"
              />
            </>
          )}
        </AnimatePresence>

        {/* Core Glowing Button/Dial */}
        <motion.div
          animate={isScanning ? { scale: [1, 1.04, 1] } : {}}
          transition={{ duration: 1.5, repeat: Infinity }}
          className={cn(
            "z-10 w-44 h-44 sm:w-48 sm:h-48 rounded-full flex flex-col items-center justify-center shadow-2xl transition-all duration-500 border-4 border-white/80 backdrop-blur-md relative overflow-hidden",
            status === 'error'
              ? "bg-gradient-to-br from-[#ba1a1a] to-[#7f0000] text-white shadow-red-200"
              : isScanning
              ? "bg-gradient-to-br from-[#004c69] via-[#00668a] to-[#0284c7] text-white shadow-cyan-200"
              : isConnected
              ? "bg-gradient-to-br from-[#00668a] via-[#0284c7] to-[#38bdf8] text-white shadow-sky-200 hover:scale-[1.02]"
              : "bg-gradient-to-br from-[#475569] via-[#64748b] to-[#94a3b8] text-white shadow-slate-200"
          )}
        >
          {/* Inner ambient light overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-white/20 pointer-events-none" />

          {status === 'error' ? (
            <AlertCircle size={56} className="text-white animate-bounce" />
          ) : isScanning ? (
            <div className="flex flex-col items-center gap-1.5 z-10">
              <Zap size={44} className="text-[#30c5b3] animate-bounce" fill="#30c5b3" />
              <span className="text-[11px] font-black tracking-widest uppercase text-cyan-200">
                Spectrometry
              </span>
              <span className="text-xs font-mono font-bold text-white/90">
                {Math.round(progress)}%
              </span>
            </div>
          ) : isConnected ? (
            <div className="flex flex-col items-center gap-1.5 z-10">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center shadow-inner">
                <Shield size={32} className="text-white" />
              </div>
              <span className="text-[11px] font-extrabold tracking-wider uppercase text-white/90">
                {t('sensor_ready', 'Sensor Ready')}
              </span>
              <span className="text-[10px] font-mono text-cyan-200 bg-white/10 px-2 py-0.5 rounded-full">
                14 Bands
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1.5 z-10">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                <Bluetooth size={28} className="text-white/80" />
              </div>
              <span className="text-[11px] font-black tracking-wider uppercase text-white/90">
                {t('pod_standby', 'Pod Standby')}
              </span>
              <span className="text-[10px] text-slate-200">{t('connect_to_test', 'Connect to Test')}</span>
            </div>
          )}
        </motion.div>

        {/* Progress % Label Floating Badge */}
        {isScanning && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute -bottom-8 px-4 py-1 rounded-full bg-white border border-[#c4e7ff] font-extrabold text-sm text-[#00668a] shadow-md flex items-center gap-1.5"
          >
            <Loader2 size={13} className="animate-spin text-[#00668a]" />
            <span>Analyzing Spectral Fingerprint</span>
          </motion.div>
        )}
      </div>

      {/* ── Bottom Controls & Actions ── */}
      <div className="w-full space-y-4 z-10 max-w-md">
        {status === 'idle' ? (
          !isConnected ? (
            <div className="space-y-3">
              {/* Disconnected State Call to Actions */}
              <div className="p-4 rounded-2xl bg-white/90 border border-[#fed7aa] shadow-sm flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#9a3412]">
                    <Bluetooth size={16} />
                    <span>{t('hardware_not_linked', 'Hardware Sensor Pod Not Linked')}</span>
                  </div>
                  <span className="text-[10px] font-mono text-[#c2410c] bg-amber-100 px-2 py-0.5 rounded-md font-bold">
                    BLE V1
                  </span>
                </div>
                
                <p className="text-xs text-[#51666d]">
                  {t('hardware_not_linked_desc', 'Connect your MilkGuard ESP32 device over Web Bluetooth or test using the hardware simulation engine.')}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  <Button
                    asChild
                    className="h-12 bg-[#00668a] hover:bg-[#004c69] text-white font-extrabold text-xs rounded-xl shadow-md uppercase tracking-tight flex items-center justify-center gap-1.5"
                  >
                    <Link href="/hardware">
                      <Bluetooth size={15} />
                      <span>{t('pair_device', 'Pair Device (BLE)')}</span>
                    </Link>
                  </Button>

                  <Button
                    onClick={handleQuickSimulationScan}
                    variant="outline"
                    className="h-12 border-[#c4e7ff] text-[#00668a] hover:bg-[#e5efff] font-bold text-xs rounded-xl flex items-center justify-center gap-1.5"
                  >
                    <Sparkles size={14} className="text-amber-500" />
                    <span>{t('test_sim_scan', 'Test Sim Scan')}</span>
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <Button
                onClick={handleStartScan}
                className="w-full h-16 bg-gradient-to-r from-[#00668a] via-[#004c69] to-[#0284c7] hover:from-[#004c69] hover:to-[#003448] text-white font-black text-lg rounded-2xl shadow-xl hover:shadow-2xl transition-all uppercase tracking-tight flex items-center justify-center gap-2.5 active:scale-98"
              >
                <Play size={22} fill="white" />
                <span>{t('btn_start_scan', 'Start Pure Analysis')}</span>
              </Button>

              <p className="text-[11px] text-center text-[#51666d] font-medium">
                Testing against FSSAI NIR spectroscopy calibration standards
              </p>
            </div>
          )
        ) : status === 'error' ? (
          <div className="space-y-3 p-4 bg-white rounded-2xl border border-red-200">
            <p className="text-[#ba1a1a] text-center font-bold text-xs flex items-center justify-center gap-1.5">
              <AlertCircle size={15} />
              <span>{error}</span>
            </p>
            <Button
              onClick={() => {
                setStatus('idle')
                setIsScanning(false)
              }}
              variant="outline"
              className="w-full h-12 border-[#ffdad6] text-[#ba1a1a] font-bold rounded-xl text-xs"
            >
              Try Again
            </Button>
          </div>
        ) : (
          <div className="space-y-3 p-4 bg-white/90 rounded-2xl border border-[#c4e7ff] shadow-sm">
            <div className="flex justify-between text-xs font-bold text-[#001d36]">
              <span className="flex items-center gap-1.5">
                <Loader2 size={13} className="animate-spin text-[#00668a]" />
                <span>{status === 'scanning' ? 'Optical Sampling' : 'AI Inference'}</span>
              </span>
              <span className="font-mono text-[#00668a]">{Math.round(progress)}%</span>
            </div>
            
            <Progress value={progress} className="h-3 bg-[#e5efff]" />
            
            <p className="text-[11px] text-center font-semibold text-[#51666d] truncate">
              {currentPhase}
            </p>
          </div>
        )}

        {/* ── Footer Trust Badges ── */}
        <div className="flex items-center justify-center gap-6 text-[#51666d] pt-3 border-t border-[#d1e4ff]/80">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#006b5f]">
            <CheckCircle2 size={15} />
            <span>{t('fssai_standards_badge', 'FSSAI Standards')}</span>
          </div>

          <div className="w-1 h-1 rounded-full bg-slate-300" />

          <div className="flex items-center gap-1.5 text-xs font-bold text-[#00668a]">
            <Shield size={14} />
            <span>{t('polygon_onchain_badge', 'Polygon On-Chain')}</span>
          </div>

          <div className="w-1 h-1 rounded-full bg-slate-300" />

          <div className="flex items-center gap-1.5 text-xs font-bold text-[#0284c7]">
            <Layers size={14} />
            <span>{t('channels_badge', '14 Channels')}</span>
          </div>
        </div>
      </div>

    </div>
  )
}
