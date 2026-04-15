'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Cpu, X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'

type ScanStage = 'idle' | 'connecting' | 'reading' | 'processing' | 'input' | 'submitting'

interface PrototypeScannerModalProps {
  isOpen: boolean
  onClose: () => void
}

// ─── Analysis engine (mirrors the Supabase edge function logic) ──────────────

const BASELINE = [
  0.81, 0.80, 0.75, 0.71, 0.68, 0.64,
  0.61, 0.57, 0.55, 0.51, 0.47, 0.44,
  0.41, 0.68, 0.35, 0.31, 0.29, 0.27
]

const WAVELENGTHS = [
  410, 435, 460, 485, 510, 535, 560, 585,
  610, 645, 680, 705, 730, 760, 810, 860, 900, 940
]

const RULES: Record<string, {
  name: string; channels: number[]; threshold: number; limit: number
  unit: string; maxConc: number; type: 'max' | 'min' | 'zero_tolerance'; minConc?: number
}> = {
  waterAddition: { name: 'Water Addition', channels: [13], threshold: 0.08, limit: 3.0, unit: '%', maxConc: 15.0, type: 'max' },
  urea: { name: 'Urea', channels: [4, 5], threshold: 0.12, limit: 0.07, unit: '%', maxConc: 0.5, type: 'max' },
  detergent: { name: 'Detergent', channels: [3, 4, 5], threshold: 0.20, limit: 0.0, unit: '%', maxConc: 1.0, type: 'zero_tolerance' },
  starch: { name: 'Starch', channels: [8, 9], threshold: 0.15, limit: 0.0, unit: '%', maxConc: 2.0, type: 'zero_tolerance' },
  formalin: { name: 'Formalin', channels: [16], threshold: 0.30, limit: 0.0, unit: '%', maxConc: 0.05, type: 'zero_tolerance' },
  neutralizers: { name: 'Neutralizers', channels: [0, 1, 2], threshold: 0.10, limit: 0.05, unit: '%', maxConc: 0.3, type: 'max' },
  fatContent: { name: 'Fat Content', channels: [15, 16], threshold: 0.12, limit: 3.5, unit: '%', maxConc: 3.5, minConc: 0.5, type: 'min' }
}

function noise() { return (Math.random() - 0.5) * 0.06 }

function nirToWavelengths(nirReading: number): number[] {
  // Map NIR reading to spike intensities:
  // 1–40 → heavily adulterated (detergent + formalin spikes)
  // 41–65 → suspicious (urea + water spikes)
  // 66–85 → borderline (mild urea + water)
  // 86–100 → pure (no spikes)
  const spikes: Record<number, number> = {}

  if (nirReading <= 40) {
    // Hazardous: detergent + formalin
    spikes[3] = +0.18; spikes[4] = +0.28; spikes[5] = +0.25; spikes[16] = +0.52
  } else if (nirReading <= 65) {
    // Adulterated: urea + water
    spikes[4] = +0.22; spikes[5] = +0.20; spikes[13] = +0.09
  } else if (nirReading <= 85) {
    // Borderline: mild urea
    spikes[4] = +0.13; spikes[5] = +0.12
  }
  // 86–100: pure → no spikes

  return BASELINE.map((base, i) => {
    const spike = spikes[i] ?? 0
    const value = base + spike + noise()
    return Math.round(Math.max(0.01, Math.min(0.99, value)) * 1000) / 1000
  })
}

function detectAdulterant(key: string, rule: typeof RULES[string], readings: number[]) {
  const deviations = rule.channels.map(ch => ({
    deviation: Math.abs(readings[ch] - BASELINE[ch]) / BASELINE[ch],
  }))
  const avgDeviation = deviations.reduce((s, d) => s + d.deviation, 0) / deviations.length
  const detected = avgDeviation > rule.threshold

  if (!detected) {
    return { name: rule.name, detected: false, detectedValue: 0, safeLimit: rule.limit, unit: rule.unit, status: 'clear', quantity500ml: 0, analogy: 'Not detected' }
  }

  let estimatedConc: number
  if (rule.type === 'min') {
    estimatedConc = Math.max(rule.minConc ?? 0.5, rule.limit - (avgDeviation * rule.limit * 2.5))
  } else {
    estimatedConc = Math.min(rule.maxConc, Math.max(0.001, (avgDeviation / rule.threshold) * rule.limit * 1.8))
  }

  let status: string
  if (rule.type === 'zero_tolerance') status = 'hazard'
  else if (rule.type === 'min') status = estimatedConc < rule.limit * 0.7 ? 'danger' : estimatedConc < rule.limit * 0.9 ? 'warning' : 'safe'
  else status = estimatedConc > rule.limit * 2 ? 'hazard' : estimatedConc > rule.limit ? 'danger' : estimatedConc > rule.limit * 0.75 ? 'warning' : 'safe'

  const quantity = estimatedConc * 5
  let analogy = ''
  if (key === 'waterAddition') {
    const tsp = Math.round((quantity / 5) * 10) / 10
    analogy = tsp < 1 ? `About ${Math.round(quantity)}ml — less than 1 teaspoon` : `About ${tsp} teaspoons of water added`
  } else if (key === 'urea') {
    analogy = quantity < 0.5 ? 'Barely detectable — a few grains' : `About ${Math.round(quantity * 1000)}mg — a small pinch`
  } else if (key === 'detergent' || key === 'formalin') {
    analogy = 'TOXIC AT ANY LEVEL — do not consume'
  } else if (key === 'starch') {
    analogy = `About ${Math.round(quantity * 100) / 100}g — fraction of a teaspoon`
  } else if (key === 'neutralizers') {
    analogy = `About ${Math.round(quantity * 100) / 100}g of chemical neutralizer`
  } else if (key === 'fatContent') {
    const missing = rule.limit - estimatedConc
    analogy = `Missing about ${Math.round(missing * 5 * 10) / 10}g of natural fat`
  } else {
    analogy = `Approximately ${Math.round(quantity * 100) / 100}ml per 500ml`
  }

  return { name: rule.name, detected: true, detectedValue: Math.round(estimatedConc * 1000) / 1000, safeLimit: rule.limit, unit: rule.unit, status, quantity500ml: Math.round(quantity * 100) / 100, analogy }
}

function calcScore(adulterants: ReturnType<typeof detectAdulterant>[]) {
  let score = 100
  for (const a of adulterants) {
    if (!a.detected) continue
    score -= a.status === 'hazard' ? 50 : a.status === 'danger' ? 30 : a.status === 'warning' ? 15 : 5
  }
  return Math.max(0, Math.min(100, score))
}

function getTier(score: number): 'safe' | 'warning' | 'danger' | 'hazard' {
  return score >= 85 ? 'safe' : score >= 60 ? 'warning' : score >= 30 ? 'danger' : 'hazard'
}

function getRecommendation(tier: string, adulterants: ReturnType<typeof detectAdulterant>[]) {
  const hazardNames = adulterants.filter(a => a.status === 'hazard' && a.detected).map(a => a.name).join(' and ')
  switch (tier) {
    case 'safe': return 'This milk is safe to consume. No significant adulterants detected.'
    case 'warning': return 'This milk has minor quality issues. Not immediately dangerous but below FSSAI standards.'
    case 'danger': return 'This milk is adulterated above safe limits. Do not give to children. Report this vendor.'
    case 'hazard': return `DO NOT CONSUME. ${hazardNames} detected — classified as toxic under FSSAI regulations.`
    default: return 'Scan complete.'
  }
}

// ─── Component ───────────────────────────────────────────────────────────────

export function PrototypeScannerModal({ isOpen, onClose }: PrototypeScannerModalProps) {
  const router = useRouter()
  const [scanStage, setScanStage] = useState<ScanStage>('idle')
  const [progress, setProgress] = useState(0)
  const [nirReading, setNirReading] = useState<string>('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (scanStage === 'connecting') {
      let val = 0
      const iv = setInterval(() => { val += 5; setProgress(val); if (val >= 100) { clearInterval(iv); setScanStage('reading'); setProgress(0) } }, 50)
      return () => clearInterval(iv)
    }
    if (scanStage === 'reading') {
      let val = 0
      const iv = setInterval(() => { val += 2; setProgress(val); if (val >= 100) { clearInterval(iv); setScanStage('processing'); setProgress(0) } }, 40)
      return () => clearInterval(iv)
    }
    if (scanStage === 'processing') {
      let val = 0
      const iv = setInterval(() => { val += 10; setProgress(val); if (val >= 100) { clearInterval(iv); setScanStage('input') } }, 100)
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
      // 1. Build wavelengths from NIR reading
      const wavelengths = nirToWavelengths(reading)

      // 2. Run analysis fully client-side (same logic as edge function)
      const adulterants = Object.entries(RULES).map(([key, rule]) => detectAdulterant(key, rule, wavelengths))
      const safetyScore  = reading // Force result to exactly match the input
      const resultTier   = getTier(safetyScore)
      const aiConfidence = Math.round((94 + Math.random() * 5) * 10) / 10
      const scanDuration = 8.2
      const recommendation = getRecommendation(resultTier, adulterants)

      const wavelengthAnalysis = wavelengths.map((r, i) => ({
        channel: i + 1,
        wavelength: WAVELENGTHS[i],
        reading: Math.round(r * 1000) / 1000,
        baseline: Math.round(BASELINE[i] * 1000) / 1000,
        deviationPct: Math.round(Math.abs((r - BASELINE[i]) / BASELINE[i]) * 1000) / 10,
        status: Math.abs((r - BASELINE[i]) / BASELINE[i]) < 0.10 ? 'normal' : Math.abs((r - BASELINE[i]) / BASELINE[i]) < 0.25 ? 'elevated' : 'anomaly'
      }))

      // 3. Insert scan row
      // Call the API route (uses service role key — no schema cache issues)
      const res = await fetch('/api/prototype-scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          safetyScore,
          resultTier,
          aiConfidence,
          scanDuration,
          wavelengthAnalysis,
          baselineData: BASELINE,
          recommendation,
          adulterants,
        }),
      })

      const result = await res.json()
      if (!res.ok || !result.scanId) {
        throw new Error(result.error ?? 'Failed to save scan result.')
      }

      // Navigate to the real detailed report page
      router.push(`/history/${result.scanId}`)
      handleClose()
    } catch (err: any) {
      console.error('[PrototypeScanner]', err)
      setError(err.message ?? 'Something went wrong. Please try again.')
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

  const stageLabel: Partial<Record<ScanStage, string>> = {
    connecting: 'Connecting to MilkGuard-ESP32-001...',
    reading:    'Reading NIR Sensor Data...',
    processing: 'Processing Spectral Fingerprint...',
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-3xl w-full max-w-md p-6 relative shadow-2xl"
      >
        <button onClick={handleClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors">
          <X size={22} />
        </button>

        <h2 className="text-xl font-black text-slate-800 uppercase tracking-tighter mb-6 flex items-center gap-2">
          <Cpu className="text-indigo-500" size={20} />
          Prototype Scanner
        </h2>

        <AnimatePresence mode="wait">

          {/* IDLE */}
          {scanStage === 'idle' && (
            <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center space-y-6 py-4">
              <div className="flex justify-center">
                <div className="p-6 bg-indigo-50 rounded-full">
                  <Cpu className="w-14 h-14 text-indigo-400" />
                </div>
              </div>
              <p className="text-slate-500 font-medium text-sm">
                Simulate an ESP32 hardware scan and get the{' '}
                <span className="font-bold text-indigo-600">actual detailed report</span> — same as a real device scan.
              </p>
              <Button onClick={handleStartScan} className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-lg rounded-full shadow-lg">
                Start Scan
              </Button>
            </motion.div>
          )}

          {/* ANIMATING */}
          {(scanStage === 'connecting' || scanStage === 'reading' || scanStage === 'processing') && (
            <motion.div key="scanning" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center space-y-8 py-4">
              <div className="relative flex items-center justify-center w-32 h-32 mx-auto">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-0 border-4 border-dashed border-indigo-200 rounded-full" />
                <motion.div animate={{ scale: [1, 1.08, 1] }} transition={{ duration: 1.2, repeat: Infinity }} className="bg-indigo-50 p-4 rounded-full z-10">
                  <Cpu className="w-12 h-12 text-indigo-600" />
                </motion.div>
              </div>
              <div className="space-y-3">
                <p className="font-bold text-indigo-600 uppercase tracking-widest text-xs">{stageLabel[scanStage]}</p>
                <Progress value={progress} className="h-2 bg-indigo-100" />
              </div>
            </motion.div>
          )}

          {/* INPUT */}
          {scanStage === 'input' && (
            <motion.div key="input" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-5 py-2">
              <div className="text-center">
                <p className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-1">Device Ready — MilkGuard-ESP32-001</p>
                <h3 className="font-bold text-slate-700 text-lg">Enter NIR Reading (1–100):</h3>
              </div>
              <Input
                type="number" min="1" max="100"
                value={nirReading}
                onChange={(e) => setNirReading(e.target.value)}
                className="text-center text-4xl font-black h-24 bg-slate-50 border-2 border-slate-200 focus-visible:ring-indigo-500 rounded-2xl"
                placeholder="—"
                autoFocus
              />
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-red-50 text-red-700 rounded-xl p-2 font-semibold text-center">❌ 1–40: Adulterated</div>
                <div className="bg-orange-50 text-orange-700 rounded-xl p-2 font-semibold text-center">⚠️ 41–65: Suspicious</div>
                <div className="bg-yellow-50 text-yellow-700 rounded-xl p-2 font-semibold text-center">🟡 66–85: Borderline</div>
                <div className="bg-green-50 text-green-700 rounded-xl p-2 font-semibold text-center">✅ 86–100: Pure</div>
              </div>
              {error && <p className="text-red-500 text-sm text-center font-medium bg-red-50 p-2 rounded-xl">{error}</p>}
              <Button
                onClick={handleGenerateReport}
                disabled={!nirReading}
                className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-lg rounded-full shadow-lg disabled:opacity-50"
              >
                Generate Report
              </Button>
            </motion.div>
          )}

          {/* SUBMITTING */}
          {scanStage === 'submitting' && (
            <motion.div key="submitting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center space-y-6 py-10">
              <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mx-auto" />
              <div>
                <p className="font-bold text-slate-700">Generating your report...</p>
                <p className="text-xs text-slate-400 mt-1">Running AI analysis on NIR spectral data</p>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </motion.div>
    </div>
  )
}
