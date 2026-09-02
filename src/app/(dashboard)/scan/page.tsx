'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, Zap, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'
import { useUserStore } from '@/store/useUserStore'
import { runScan, recordScanOnChain } from '@/lib/ai/scanEngine'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { useDeviceStore } from '@/store/useDeviceStore'
import Link from 'next/link'
import { trackTestInitiation } from '@/components/analytics/GoogleAnalytics'
import BlockchainConfirmation from '@/components/BlockchainConfirmation'
import { PrototypeScannerModal } from '@/components/scanner/PrototypeScannerModal'

const SCAN_DURATION = 8000 // 8 seconds

export default function ScanPage() {
  const router = useRouter()
  const { user } = useUserStore()
  const [isScanning, setIsScanning] = useState(false)
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState<'idle' | 'scanning' | 'analyzing' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [pendingScanId, setPendingScanId] = useState<string | null>(null)
  const [showPrototypeModal, setShowPrototypeModal] = useState(false)
  // Holds the live blockchain promise so the overlay can await it
  const blockchainPromiseRef = useRef<Promise<string | null>>(Promise.resolve(null))
  
  const connState = useDeviceStore((s) => s.connState)
  const isConnected = connState === 'connected'

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

    setIsScanning(true)
    setStatus('scanning')
    setProgress(0)
    setError(null)

    // Simulate the physical scan time
    setTimeout(async () => {
      setStatus('analyzing')
      try {
        const result = await runScan({ userId: user.id })
        if (result.success) {
          // Start blockchain recording immediately (non-blocking) —
          // the promise is passed to the overlay which awaits it in step 2.
          blockchainPromiseRef.current = recordScanOnChain(
            result.scanId,
            null,           // vendorId not available from scan page (no vendor selected here)
            result.safetyScore,
            result.resultTier
          )

          setPendingScanId(result.scanId)
          setShowConfirmation(true)
          setIsScanning(false)
          setStatus('idle')
        } else {
          throw new Error(result.error || 'Scan failed')
        }
      } catch (err: any) {
        setError(err.message)
        setStatus('error')
        setIsScanning(false)
      }
    }, SCAN_DURATION)
  }

  return (
    <div className="flex flex-col items-center justify-between min-h-[80vh] p-6 py-8 bg-white rounded-3xl ambient-shadow border border-[#d1e4ff] relative overflow-hidden max-w-2xl mx-auto">
      <PrototypeScannerModal isOpen={showPrototypeModal} onClose={() => setShowPrototypeModal(false)} />
      
      {/* Prototype Toggle */}
      <button 
        onClick={() => setShowPrototypeModal(true)} 
        className="absolute top-4 right-4 text-xs font-bold text-[#00668a] hover:bg-[#e5efff] px-3.5 py-1.5 bg-[#e5efff]/60 rounded-full border border-[#c4e7ff] transition-all flex items-center gap-1 z-20"
      >
        <span className="material-symbols-outlined text-sm">settings_input_component</span>
        <span>Hardware Mock</span>
      </button>

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

      {/* Top Header */}
      <div className="w-full text-center space-y-1 mt-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#e5efff] border border-[#c4e7ff] text-xs font-semibold text-[#00668a] mb-2">
          <span className="w-2 h-2 rounded-full bg-[#30c5b3] animate-pulse"></span>
          <span>NIR Spectroscopy Active</span>
        </div>

        <h1 className="text-3xl font-extrabold text-[#001d36] tracking-tight">
          {status === 'idle' ? 'Ready to Scan' : status === 'scanning' ? 'Scanning Milk...' : 'AI Computing...'}
        </h1>

        <p className="text-sm font-medium text-[#3e484f]">
          {status === 'idle' ? 'Submerge pod in milk sample and press start' : 'Keep device submerged during analysis'}
        </p>
      </div>

      {/* Center Animated Scanner */}
      <div className="relative flex items-center justify-center w-72 h-72 my-8">
        {/* Pulsing Outer Rings */}
        <AnimatePresence>
          {isScanning && (
            <>
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1.4, opacity: 0.25 }}
                exit={{ scale: 1.8, opacity: 0 }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
                className="absolute w-full h-full border-4 border-[#00668a] rounded-full"
              />
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1.25, opacity: 0.35 }}
                exit={{ scale: 1.6, opacity: 0 }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeOut", delay: 0.5 }}
                className="absolute w-full h-full border-2 border-[#30c5b3] rounded-full"
              />
            </>
          )}
        </AnimatePresence>

        {/* Core Animated Button/Icon */}
        <motion.div
          animate={isScanning ? { scale: [1, 1.05, 1] } : {}}
          transition={{ duration: 1.5, repeat: Infinity }}
          className={cn(
            "z-10 w-44 h-44 rounded-full flex flex-col items-center justify-center shadow-2xl transition-colors duration-500 border-4 border-white/40",
            status === 'error' 
              ? "bg-[#ba1a1a] text-white" 
              : isScanning 
              ? "bg-gradient-to-br from-[#00668a] to-[#004c69] text-white" 
              : "bg-gradient-to-br from-[#00668a] to-[#38bdf8] text-white"
          )}
        >
          {status === 'error' ? (
            <AlertCircle size={56} />
          ) : isScanning ? (
            <div className="flex flex-col items-center gap-1">
              <Zap size={48} className="text-[#30c5b3] animate-bounce" fill="#30c5b3" />
              <span className="text-xs font-bold tracking-wider uppercase opacity-90">Analyzing</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1">
              <Shield size={56} />
              <span className="text-xs font-bold tracking-wider uppercase opacity-90">Sensor Ready</span>
            </div>
          )}
        </motion.div>

        {/* Progress % Display */}
        {isScanning && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute -bottom-10 font-extrabold text-2xl text-[#00668a]"
          >
            {Math.round(progress)}%
          </motion.div>
        )}
      </div>

      {/* Bottom Controls & Info */}
      <div className="w-full space-y-5">
        {status === 'idle' ? (
          !isConnected ? (
            <div className="space-y-3 text-center">
              <p className="text-xs font-bold text-[#ba1a1a] uppercase tracking-wider">Hardware Pod Disconnected</p>
              <Button 
                asChild
                className="w-full h-14 bg-[#f59e0b] hover:bg-[#d97706] text-white font-bold text-lg rounded-2xl shadow-md uppercase tracking-tight"
              >
                <Link href="/hardware">Connect Sensor Pod</Link>
              </Button>
            </div>
          ) : (
            <Button 
              onClick={handleStartScan}
              className="w-full h-16 bg-[#00668a] hover:bg-[#004c69] text-white font-extrabold text-xl rounded-2xl shadow-xl hover:shadow-2xl transition-all uppercase tracking-tight flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-2xl">play_arrow</span>
              <span>Start Pure Analysis</span>
            </Button>
          )
        ) : status === 'error' ? (
          <div className="space-y-3">
            <p className="text-[#ba1a1a] text-center font-semibold text-sm">{error}</p>
            <Button 
              onClick={() => { setStatus('idle'); setIsScanning(false); }}
              variant="outline"
              className="w-full h-12 border-[#ffdad6] text-[#ba1a1a] font-bold rounded-2xl"
            >
              Try Again
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <Progress value={progress} className="h-3 bg-[#e5efff]" />
            <p className="text-xs text-center font-bold text-[#3e484f] uppercase tracking-wider flex items-center justify-center gap-2">
              <Loader2 size={14} className="animate-spin text-[#00668a]" />
              {status === 'scanning' ? 'Connecting to spectral pod...' : 'AI computing adulterant fingerprint...'}
            </p>
          </div>
        )}

        <div className="flex items-center justify-center gap-6 text-[#6e7980] pt-2 border-t border-[#d1e4ff]/60">
          <div className="flex items-center gap-1 text-xs font-semibold text-[#006b5f]">
            <CheckCircle2 size={16} />
            <span>FSSAI Compliant</span>
          </div>
          <div className="flex items-center gap-1 text-xs font-semibold text-[#00668a]">
            <CheckCircle2 size={16} />
            <span>Polygon On-Chain</span>
          </div>
        </div>
      </div>
    </div>
  )
}
