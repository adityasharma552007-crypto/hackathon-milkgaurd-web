'use client'

import React, { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface BlockchainConfirmationProps {
  /**
   * Promise that resolves when the blockchain transaction is confirmed.
   * Resolves to the txHash string (or null if it failed).
   * Step 2 ("Recording on blockchain") will wait for this promise.
   */
  blockchainPromise: Promise<string | null>
  onComplete: (txHash: string | null) => void
}

const STEPS = [
  { label: 'Saving to database',      key: 'db'         },
  { label: 'Recording on blockchain', key: 'blockchain'  },
  { label: 'Verification complete',   key: 'verify'      },
]

type StepStatus = 'pending' | 'active' | 'done'

export default function BlockchainConfirmation({
  blockchainPromise,
  onComplete,
}: BlockchainConfirmationProps) {
  const [stepStatuses, setStepStatuses] = useState<StepStatus[]>(['active', 'pending', 'pending'])
  const [allDone, setAllDone] = useState(false)
  const [resolvedTxHash, setResolvedTxHash] = useState<string | null>(null)
  // Track whether the blockchain promise resolved
  const txHashRef = useRef<string | null>(null)

  useEffect(() => {
    let cancelled = false

    const run = async () => {
      // ── Step 1: Saving to database (1.4s fixed — DB save already happened) ─
      await delay(1400)
      if (cancelled) return
      markDone(0)
      await delay(350)

      // ── Step 2: Recording on blockchain (wait for real promise) ────────────
      if (cancelled) return
      setStepStatuses((prev) => set(prev, 1, 'active'))

      // Race the blockchain promise alongside a minimum display time (1.5s)
      const [txHash] = await Promise.all([
        blockchainPromise,
        delay(1500),   // always show step 2 for at least 1.5s for good UX
      ])

      if (cancelled) return
      txHashRef.current = txHash ?? null
      setResolvedTxHash(txHash ?? null)
      markDone(1)
      await delay(350)

      // ── Step 3: Verification complete (0.9s) ──────────────────────────────
      if (cancelled) return
      setStepStatuses((prev) => set(prev, 2, 'active'))
      await delay(900)
      if (cancelled) return
      markDone(2)
      await delay(400)

      if (!cancelled) setAllDone(true)
    }

    run()
    return () => { cancelled = true }
  }, [blockchainPromise])

  function delay(ms: number) {
    return new Promise<void>((r) => setTimeout(r, ms))
  }

  function set(prev: StepStatus[], idx: number, val: StepStatus): StepStatus[] {
    const next = [...prev] as StepStatus[]
    next[idx] = val
    return next
  }

  function markDone(idx: number) {
    setStepStatuses((prev) => set(prev, idx, 'done'))
  }

  const doneCount = stepStatuses.filter((s) => s === 'done').length

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(15,23,42,0.87)', backdropFilter: 'blur(10px)' }}
    >
      <motion.div
        initial={{ scale: 0.90, opacity: 0, y: 24 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 22 }}
        className="bg-white rounded-3xl p-8 mx-6 w-full max-w-sm shadow-2xl"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-[#8247E5]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⛓️</span>
          </div>
          <h2 className="text-lg font-black text-slate-800 uppercase tracking-tighter">
            Blockchain Recording
          </h2>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
            Securing your result on Polygon
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-4">
          {STEPS.map((step, index) => {
            const status = stepStatuses[index]
            return (
              <div key={step.key} className="flex items-center gap-4">
                {/* Icon */}
                <div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all duration-300',
                    status === 'done'    ? 'bg-emerald-100'
                    : status === 'active' ? 'bg-[#60A5FA]/10'
                    : 'bg-slate-100'
                  )}
                >
                  <AnimatePresence mode="wait">
                    {status === 'done' ? (
                      <motion.div
                        key="check"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 18 }}
                      >
                        <CheckCircle2 size={18} className="text-emerald-500" />
                      </motion.div>
                    ) : status === 'active' ? (
                      <motion.div key="spin" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <Loader2 size={18} className="text-[#60A5FA] animate-spin" />
                      </motion.div>
                    ) : (
                      <motion.span
                        key="num"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-xs font-black text-slate-300"
                      >
                        {index + 1}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>

                {/* Label */}
                <p
                  className={cn(
                    'flex-1 text-sm font-bold transition-colors duration-300',
                    status === 'done'    ? 'text-emerald-600'
                    : status === 'active' ? 'text-slate-800'
                    : 'text-slate-300'
                  )}
                >
                  {step.label}
                </p>

                {/* Pulse dot when active */}
                {status === 'active' && (
                  <motion.div
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 1.2, repeat: Infinity }}
                    className="w-1.5 h-1.5 rounded-full bg-[#60A5FA]"
                  />
                )}
              </div>
            )
          })}
        </div>

        {/* Progress bar */}
        <div className="mt-6 h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-[#60A5FA] to-[#8247E5] rounded-full"
            animate={{ width: `${(doneCount / STEPS.length) * 100}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>

        {/* txHash preview when blockchain step done */}
        <AnimatePresence>
          {stepStatuses[1] === 'done' && resolvedTxHash && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-4 bg-emerald-50 border border-emerald-100 rounded-2xl px-4 py-2.5 flex items-center gap-2"
            >
              <span className="text-[10px]">✅</span>
              <span className="font-mono text-[10px] text-emerald-700 font-bold truncate">
                {resolvedTxHash.slice(0, 10)}...{resolvedTxHash.slice(-6)}
              </span>
            </motion.div>
          )}
          {stepStatuses[1] === 'done' && !resolvedTxHash && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-4 bg-amber-50 border border-amber-100 rounded-2xl px-4 py-2.5"
            >
              <p className="text-[10px] text-amber-600 font-bold uppercase tracking-wider">
                ⏳ Blockchain pending — result saved to cloud
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* CTA — appears after all steps done */}
        <AnimatePresence>
          {allDone && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-6"
            >
              <Button
                onClick={() => onComplete(resolvedTxHash)}
                className="w-full h-12 bg-[#60A5FA] hover:bg-[#3B82F6] text-white font-black text-sm rounded-2xl shadow-lg shadow-blue-100 uppercase tracking-tighter"
              >
                View Result →
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Polygon branding */}
        <p className="text-center text-[9px] text-slate-300 font-bold uppercase tracking-widest mt-4">
          Powered by <span className="text-[#8247E5]">Polygon</span> · Amoy Testnet
        </p>
      </motion.div>
    </motion.div>
  )
}
