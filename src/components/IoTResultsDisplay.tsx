'use client'

/**
 * IoTResultsDisplay — shows completed test results from ESP device.
 *
 * Renders: safety score, colour-coded adulterant cards, save to Supabase,
 * and launches ExplainWithAI with the result data.
 */

import React, { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Shield, AlertTriangle, XCircle, Skull,
  UploadCloud, Loader2, Check, RefreshCw, Sparkles,
} from 'lucide-react'
import { useDeviceStore, TestResult } from '@/store/useDeviceStore'
import { useUserStore } from '@/store/useUserStore'
import { createClient } from '@/lib/supabase/client'
import ExplainWithAI from '@/components/ExplainWithAI'

// ─── Safety tier helpers ──────────────────────────────────────────────────────
function getTier(score: number): 'safe' | 'warning' | 'danger' | 'hazard' {
  if (score >= 80) return 'safe'
  if (score >= 55) return 'warning'
  if (score >= 30) return 'danger'
  return 'hazard'
}

const TIER_CONFIG = {
  safe:    { label: 'Safe',    bg: 'bg-blue-400',  ring: 'ring-green-200',  text: 'text-green-700',  light: 'bg-blue-50',  icon: <Shield    size={32} className="text-white" /> },
  warning: { label: 'Caution', bg: 'bg-amber-500',  ring: 'ring-amber-200',  text: 'text-amber-700',  light: 'bg-amber-50',  icon: <AlertTriangle size={32} className="text-white" /> },
  danger:  { label: 'Danger',  bg: 'bg-red-500',    ring: 'ring-red-200',    text: 'text-red-700',    light: 'bg-red-50',    icon: <XCircle   size={32} className="text-white" /> },
  hazard:  { label: 'Hazard',  bg: 'bg-rose-700',   ring: 'ring-rose-300',   text: 'text-rose-800',   light: 'bg-rose-50',   icon: <Skull     size={32} className="text-white" /> },
}

const ADULTERANT_LABELS: Record<string, { label: string; safeLimit: number; unit: string }> = {
  soap:      { label: 'Soap',      safeLimit: 1.0, unit: '%' },
  urea:      { label: 'Urea',      safeLimit: 0.5, unit: '%' },
  starch:    { label: 'Starch',    safeLimit: 0.5, unit: '%' },
  detergent: { label: 'Detergent', safeLimit: 0.3, unit: '%' },
}

// ─── Adulterant Card ──────────────────────────────────────────────────────────
function AdulterantCard({ name, value }: { name: string; value: number }) {
  const cfg      = ADULTERANT_LABELS[name] ?? { label: name, safeLimit: 1, unit: '%' }
  const detected  = value > cfg.safeLimit
  return (
    <div className={`rounded-2xl p-3 ${detected ? 'bg-red-50 border border-red-100' : 'bg-blue-50 border border-blue-100'}`}>
      <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">{cfg.label}</p>
      <p className={`text-xl font-black leading-tight ${detected ? 'text-red-600' : 'text-green-700'}`}>
        {value.toFixed(2)}
        <span className="text-xs ml-0.5">{cfg.unit}</span>
      </p>
      <p className={`text-[9px] font-bold mt-0.5 ${detected ? 'text-red-500' : 'text-blue-400'}`}>
        {detected ? '⚠ Detected' : '✓ Clear'}
      </p>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function IoTResultsDisplay() {
  const testResult  = useDeviceStore((s) => s.testResult)
  const resetTest   = useDeviceStore((s) => s.resetTest)
  const pairedDevice = useDeviceStore((s) => s.pairedDevice)
  const { user }    = useUserStore()

  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [savedScanId, setSavedScanId]   = useState<string | null>(null)
  const [showAI, setShowAI]              = useState(false)

  const handleSave = useCallback(async (result: TestResult) => {
    if (!user) return
    setSaveState('saving')

    try {
      const supabase = createClient()
      const tier     = getTier(result.safetyScore)

      // Build adulterant rows
      const adulterants = Object.entries(ADULTERANT_LABELS).map(([key, cfg]) => ({
        name:          cfg.label,
        detected:      (result as any)[key] > cfg.safeLimit,
        detected_value: (result as any)[key],
        safe_limit:    cfg.safeLimit,
        unit:          cfg.unit,
        status:        (result as any)[key] > cfg.safeLimit ? 'danger' : 'clear',
      }))

      // Insert scan row
      const { data: scan, error: scanErr } = await supabase.from('scans').insert({
        user_id:       user.id,
        safety_score:  result.safetyScore,
        result_tier:   tier,
        ai_confidence: 95,  // hardware reading = high confidence
        scan_duration: result.duration / 1000,
        adulterants:   JSON.stringify(adulterants),
        recommendation: tier === 'safe'
          ? 'Milk appears pure. Safe to consume.'
          : tier === 'warning'
          ? 'Minor adulteration detected. Consult your supplier.'
          : 'Significant adulteration detected. Do not consume.',
      }).select('id').single()

      if (scanErr) throw scanErr

      // Also persist the raw IoT test session
      await supabase.from('iot_test_sessions').insert({
        user_id:      user.id,
        device_id:    result.deviceId,
        scan_id:      scan.id,
        raw_payload:  result.raw ?? null,
        duration_ms:  result.duration,
        completed_at: new Date().toISOString(),
      })

      setSavedScanId(scan.id)
      setSaveState('saved')
    } catch (e: any) {
      console.error('Save failed:', e)
      setSaveState('error')
    }
  }, [user])

  if (!testResult) return null

  const tier = getTier(testResult.safetyScore)
  const cfg  = TIER_CONFIG[tier]
  const adulterants = Object.entries(ADULTERANT_LABELS).map(([key, meta]) => ({
    name:           meta.label,
    detected:       (testResult as any)[key] > meta.safeLimit,
    detected_value: (testResult as any)[key],
    safe_limit:     meta.safeLimit,
    unit:           meta.unit,
    status:         (testResult as any)[key] > meta.safeLimit ? 'danger' : 'clear',
  }))

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Score card */}
      <div className={`rounded-3xl p-6 ${cfg.light} ring-2 ${cfg.ring} text-center space-y-2`}>
        <div className={`w-20 h-20 ${cfg.bg} rounded-full flex items-center justify-center mx-auto shadow-lg`}>
          {cfg.icon}
        </div>
        <div>
          <p className={`text-5xl font-black leading-none ${cfg.text}`}>{testResult.safetyScore}</p>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Safety Score</p>
        </div>
        <span className={`inline-block px-4 py-1 rounded-full text-xs font-black uppercase tracking-wider ${cfg.bg} text-white`}>
          {cfg.label}
        </span>
        <p className="text-[10px] text-slate-400 font-bold">
          {pairedDevice?.display_name ?? pairedDevice?.device_id ?? 'IoT Device'} ·{' '}
          {new Date(testResult.timestamp).toLocaleTimeString()}
        </p>
      </div>

      {/* Adulterant grid */}
      <div className="grid grid-cols-2 gap-3">
        {Object.keys(ADULTERANT_LABELS).map((key) => (
          <AdulterantCard key={key} name={key} value={(testResult as any)[key] ?? 0} />
        ))}
      </div>

      {/* Save button */}
      {saveState !== 'saved' && (
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => handleSave(testResult)}
          disabled={saveState === 'saving'}
          className="w-full flex items-center justify-center gap-2 py-4 bg-[#60A5FA] text-white rounded-2xl font-black text-sm tracking-tight hover:bg-[#3B82F6] transition-colors disabled:opacity-60 shadow-lg shadow-green-900/20"
        >
          {saveState === 'saving' ? (
            <><Loader2 size={16} className="animate-spin" /> Saving to Cloud…</>
          ) : saveState === 'error' ? (
            <><RefreshCw size={16} /> Save Failed — Retry</>
          ) : (
            <><UploadCloud size={16} /> Save Result to Cloud</>
          )}
        </motion.button>
      )}

      {saveState === 'saved' && (
        <div className="flex items-center justify-center gap-2 py-3 bg-blue-50 rounded-2xl text-green-700 text-sm font-black">
          <Check size={16} /> Saved to your history
        </div>
      )}

      {/* Explain with AI */}
      <AnimatePresence>
        {!showAI ? (
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowAI(true)}
            className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-[#60A5FA] to-[#1e8259] text-white rounded-2xl font-black text-sm tracking-tight hover:opacity-90 transition-opacity shadow-lg shadow-green-900/20"
          >
            <Sparkles size={16} className="text-[#F5A623]" />
            Explain with AI
            <span className="text-[9px] bg-white/20 px-2 py-0.5 rounded-full font-black uppercase">Groq</span>
          </motion.button>
        ) : (
          <ExplainWithAI
            safetyScore={testResult.safetyScore}
            resultTier={tier}
            recommendation={
              tier === 'safe' ? 'Milk appears pure. Safe to consume.'
              : tier === 'warning' ? 'Minor adulteration detected. Consult your supplier.'
              : 'Significant adulteration detected. Do not consume.'
            }
            vendorName={pairedDevice?.display_name ?? pairedDevice?.device_id}
            aiConfidence={95}
            adulterantResults={adulterants}
          />
        )}
      </AnimatePresence>

      {/* Scan again */}
      <button
        onClick={resetTest}
        className="w-full py-3 text-xs text-slate-400 font-bold uppercase tracking-widest hover:text-slate-600 transition-colors"
      >
        ↩ Run Another Test
      </button>
    </motion.div>
  )
}
