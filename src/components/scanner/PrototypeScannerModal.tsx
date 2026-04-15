'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Cpu, X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { createClient } from '@/lib/supabase/client'
import { generateWavelengths } from '@/lib/ai/wavegen'

type ScanStage = 'idle' | 'connecting' | 'reading' | 'processing' | 'input' | 'submitting'

interface PrototypeScannerModalProps {
  isOpen: boolean
  onClose: () => void
}

// Map a 1-100 NIR reading to a wavegen profile
function nirToProfile(reading: number): 'pure' | 'adulterated' | 'hazardous' {
  if (reading <= 40) return 'hazardous'
  if (reading <= 85) return 'adulterated'
  return 'pure'
}

export function PrototypeScannerModal({ isOpen, onClose }: PrototypeScannerModalProps) {
  const router = useRouter()
  const [scanStage, setScanStage] = useState<ScanStage>('idle')
  const [progress, setProgress] = useState(0)
  const [nirReading, setNirReading] = useState<string>('')
  const [error, setError] = useState<string | null>(null)

  // --- Stage progression animations ---
  useEffect(() => {
    if (scanStage === 'connecting') {
      let val = 0
      const iv = setInterval(() => {
        val += 5
        setProgress(val)
        if (val >= 100) { clearInterval(iv); setScanStage('reading'); setProgress(0) }
      }, 50) // ~1 s
      return () => clearInterval(iv)
    }
    if (scanStage === 'reading') {
      let val = 0
      const iv = setInterval(() => {
        val += 2
        setProgress(val)
        if (val >= 100) { clearInterval(iv); setScanStage('processing'); setProgress(0) }
      }, 40) // ~2 s
      return () => clearInterval(iv)
    }
    if (scanStage === 'processing') {
      let val = 0
      const iv = setInterval(() => {
        val += 10
        setProgress(val)
        if (val >= 100) { clearInterval(iv); setScanStage('input') }
      }, 100) // ~1 s
      return () => clearInterval(iv)
    }
  }, [scanStage])

  const handleStartScan = () => {
    setError(null)
    setNirReading('')
    setScanStage('connecting')
    setProgress(0)
  }

  const handleGenerateReport = async () => {
    const reading = parseInt(nirReading, 10)
    if (isNaN(reading) || reading < 1 || reading > 100) {
      setError('Please enter a whole number between 1 and 100.')
      return
    }
    setError(null)
    setScanStage('submitting')

    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('You must be logged in to run a prototype scan.')

      // Build a wavelength payload seeded from the NIR reading
      const profile = nirToProfile(reading)
      const wavelengths = generateWavelengths(profile)

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/analyze-milk`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            wavelengths,
            userId: session.user.id,
            vendorId: null,
            // Pass the NIR override so the edge function can pin the safety_score
            nirOverride: reading,
          }),
        }
      )

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? 'Prototype scan failed')
      }

      const result = await res.json()
      const scanId: string = result.scanId

      if (!scanId) throw new Error('No scan ID returned from server.')

      // Navigate to the same detailed report page the real scan uses
      router.push(`/history/${scanId}`)
      onClose()
    } catch (err: any) {
      setError(err.message ?? 'Something went wrong.')
      setScanStage('input')
    }
  }

  const handleClose = () => {
    setScanStage('idle')
    setProgress(0)
    setNirReading('')
    setError(null)
    onClose()
  }

  if (!isOpen) return null

  const stageLabel: Record<string, string> = {
    connecting: 'Connecting to MilkGuard-ESP32-001...',
    reading: 'Reading NIR Sensor Data...',
    processing: 'Processing Spectral Fingerprint...',
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-3xl w-full max-w-md p-6 relative shadow-2xl overflow-hidden"
      >
        {/* Close */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X size={22} />
        </button>

        <h2 className="text-xl font-black text-slate-800 uppercase tracking-tighter mb-6 flex items-center gap-2">
          <Cpu className="text-indigo-500" size={20} />
          Prototype Scanner
        </h2>

        {/* ── IDLE ── */}
        <AnimatePresence mode="wait">
          {scanStage === 'idle' && (
            <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="text-center space-y-6 py-4"
            >
              <div className="flex justify-center">
                <div className="p-6 bg-indigo-50 rounded-full">
                  <Cpu className="w-14 h-14 text-indigo-400" />
                </div>
              </div>
              <p className="text-slate-500 font-medium text-sm">
                Simulate an ESP32 hardware scan and get the <span className="font-bold text-indigo-600">actual detailed report</span> — same as a real device scan.
              </p>
              <Button
                onClick={handleStartScan}
                className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-lg rounded-full shadow-lg"
              >
                Start Scan
              </Button>
            </motion.div>
          )}

          {/* ── ANIMATING STAGES ── */}
          {(scanStage === 'connecting' || scanStage === 'reading' || scanStage === 'processing') && (
            <motion.div key="scanning" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="text-center space-y-8 py-4"
            >
              <div className="relative flex items-center justify-center w-32 h-32 mx-auto">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-0 border-4 border-dashed border-indigo-200 rounded-full"
                />
                <motion.div
                  animate={{ scale: [1, 1.08, 1] }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                  className="bg-indigo-50 p-4 rounded-full z-10"
                >
                  <Cpu className="w-12 h-12 text-indigo-600" />
                </motion.div>
              </div>
              <div className="space-y-3">
                <p className="font-bold text-indigo-600 uppercase tracking-widest text-xs">
                  {stageLabel[scanStage]}
                </p>
                <Progress value={progress} className="h-2 bg-indigo-100" />
              </div>
            </motion.div>
          )}

          {/* ── INPUT ── */}
          {scanStage === 'input' && (
            <motion.div key="input" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="space-y-5 py-2"
            >
              <div className="text-center">
                <p className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-1">Device Ready</p>
                <h3 className="font-bold text-slate-700 text-lg">Enter NIR Reading (1–100):</h3>
              </div>
              <Input
                type="number"
                min="1"
                max="100"
                value={nirReading}
                onChange={(e) => setNirReading(e.target.value)}
                className="text-center text-4xl font-black h-24 bg-slate-50 border-2 border-slate-200 focus-visible:ring-indigo-500 rounded-2xl"
                placeholder="—"
                autoFocus
              />
              {/* Visual tier legend */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-red-50 text-red-700 rounded-xl p-2 font-semibold text-center">❌ 1–40: Adulterated</div>
                <div className="bg-orange-50 text-orange-700 rounded-xl p-2 font-semibold text-center">⚠️ 41–65: Suspicious</div>
                <div className="bg-yellow-50 text-yellow-700 rounded-xl p-2 font-semibold text-center">🟡 66–85: Borderline</div>
                <div className="bg-green-50 text-green-700 rounded-xl p-2 font-semibold text-center">✅ 86–100: Pure</div>
              </div>
              {error && <p className="text-red-500 text-sm text-center font-medium">{error}</p>}
              <Button
                onClick={handleGenerateReport}
                disabled={!nirReading}
                className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-lg rounded-full shadow-lg disabled:opacity-50"
              >
                Generate Report
              </Button>
            </motion.div>
          )}

          {/* ── SUBMITTING ── */}
          {scanStage === 'submitting' && (
            <motion.div key="submitting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="text-center space-y-6 py-10"
            >
              <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mx-auto" />
              <div>
                <p className="font-bold text-slate-700">Generating your report...</p>
                <p className="text-xs text-slate-400 mt-1">Running AI analysis on NIR data</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
