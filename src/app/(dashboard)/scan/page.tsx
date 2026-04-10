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
    <div className="flex flex-col items-center justify-between min-h-screen p-6 py-12 bg-white">
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
      {/* Top Section */}
      <div className="w-full text-center">
        <h1 className="text-2xl font-black text-[#60A5FA] uppercase tracking-tighter mb-2">
          {status === 'idle' ? 'Ready to Scan' : status === 'scanning' ? 'Scanning Milk...' : 'AI Analysis...'}
        </h1>
        <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">
          {status === 'idle' ? 'Place Pod in milk sample' : 'Keep device submerged'}
        </p>
      </div>

      {/* Middle Animation */}
      <div className="relative flex items-center justify-center w-64 h-64">
        {/* Pulsing Circles */}
        <AnimatePresence>
          {isScanning && (
            <>
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1.5, opacity: 0.2 }}
                exit={{ scale: 2, opacity: 0 }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
                className="absolute w-full h-full border-4 border-[#60A5FA] rounded-full"
              />
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1.3, opacity: 0.3 }}
                exit={{ scale: 1.8, opacity: 0 }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeOut", delay: 0.5 }}
                className="absolute w-full h-full border-2 border-[#F5A623] rounded-full"
              />
            </>
          )}
        </AnimatePresence>

        {/* Core Icon */}
        <motion.div
          animate={isScanning ? { scale: [1, 1.1, 1] } : {}}
          transition={{ duration: 1.5, repeat: Infinity }}
          className={cn(
            "z-10 w-40 h-40 rounded-full flex items-center justify-center shadow-2xl transition-colors duration-500",
            status === 'error' ? "bg-red-500" : "bg-[#60A5FA]"
          )}
        >
          {status === 'error' ? (
            <AlertCircle size={64} className="text-white" />
          ) : isScanning ? (
            <Zap size={64} className="text-[#F5A623]" fill="#F5A623" />
          ) : (
             <Shield size={64} className="text-white" />
          )}
        </motion.div>

        {/* Progress Text */}
        {isScanning && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute -bottom-12 font-black text-2xl text-[#60A5FA]"
          >
            {Math.round(progress)}%
          </motion.div>
        )}
      </div>

      {/* Bottom Controls */}
      <div className="w-full space-y-6">
        {status === 'idle' ? (
          !isConnected ? (
            <div className="space-y-4 text-center">
               <p className="text-red-500 font-bold uppercase tracking-widest text-sm">Hardware Disconnected</p>
               <Button 
                asChild
                className="w-full h-20 bg-amber-500 hover:bg-amber-600 text-white font-black text-xl rounded-full shadow-lg uppercase tracking-tighter"
               >
                 <Link href="/hardware">Connect Device</Link>
               </Button>
            </div>
          ) : (
            <Button 
              onClick={handleStartScan}
              className="w-full h-20 bg-[#60A5FA] hover:bg-[#3B82F6] text-white font-black text-xl rounded-full shadow-2xl shadow-blue-100 uppercase tracking-tighter"
            >
              Start Scan
            </Button>
          )
        ) : status === 'error' ? (
          <div className="space-y-4">
            <p className="text-red-500 text-center font-bold">{error}</p>
            <Button 
              onClick={() => { setStatus('idle'); setIsScanning(false); }}
              variant="outline"
              className="w-full h-14 border-red-200 text-red-500 font-bold rounded-full"
            >
              Try Again
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <Progress value={progress} className="h-3 bg-slate-100" />
            <p className="text-[10px] text-center font-bold text-slate-400 uppercase tracking-widest flex items-center justify-center gap-2">
              <Loader2 size={12} className="animate-spin text-[#60A5FA]" />
              {status === 'scanning' ? 'Connecting to spectral pod...' : 'AI computing adulterants...'}
            </p>
          </div>
        )}

        <div className="flex items-center justify-center gap-6 text-slate-400">
           <div className="flex items-center gap-1">
             <CheckCircle2 size={14} className="text-[#60A5FA]" />
             <span className="text-[10px] font-bold uppercase tracking-wider italic">FSSAI Compliant</span>
           </div>
           <div className="flex items-center gap-1">
             <CheckCircle2 size={14} className="text-[#60A5FA]" />
             <span className="text-[10px] font-bold uppercase tracking-wider italic">Cloud Verified</span>
           </div>
        </div>
      </div>
    </div>
  )
}
