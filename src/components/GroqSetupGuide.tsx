'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ExternalLink,
  Copy,
  Check,
  Key,
  Terminal,
  Sparkles,
  ChevronDown,
  ChevronUp,
  X,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────
export type GroqKeyReason = 'missing' | 'bad_format' | 'invalid_key' | 'connection_error' | null

interface GroqSetupGuideProps {
  reason: GroqKeyReason
  /** If true, renders as a full-page overlay modal */
  asModal?: boolean
  /** Called when the user dismisses (only shown in non-modal mode) */
  onDismiss?: () => void
  /** Called when the user clicks "I've set it up – check again" */
  onRecheck?: () => void
}

// ─── Env template ─────────────────────────────────────────────────────────────
const ENV_TEMPLATE = `# Add this to your .env.local file
GROQ_API_KEY=gsk_YOUR_KEY_HERE`

// ─── Step data ────────────────────────────────────────────────────────────────
const STEPS = [
  {
    number: 1,
    icon: '🌐',
    title: 'Go to Groq Console',
    description: 'Create a free account at console.groq.com',
    action: {
      label: 'Open Groq Console',
      href: 'https://console.groq.com',
      external: true,
    },
  },
  {
    number: 2,
    icon: '🔑',
    title: 'Create an API Key',
    description: 'Click "API Keys" in the left sidebar → "Create API Key"',
    action: null,
  },
  {
    number: 3,
    icon: '📋',
    title: 'Add it to .env.local',
    description: 'Paste the template below into your project root .env.local file',
    action: null,
    template: ENV_TEMPLATE,
  },
  {
    number: 4,
    icon: '🚀',
    title: 'Restart the Dev Server',
    description: 'Stop and restart `npm run dev` so Next.js picks up the new key',
    action: null,
    command: 'npm run dev',
  },
]

// ─── Reason Messages ─────────────────────────────────────────────────────────
const REASON_INFO: Record<
  Exclude<GroqKeyReason, null>,
  { color: string; bg: string; border: string; icon: React.ReactNode; headline: string; sub: string }
> = {
  missing: {
    color: 'text-amber-700',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    icon: <Key size={18} className="text-amber-500" />,
    headline: 'Groq API Key Not Set',
    sub: 'Add your free Groq key to unlock AI features.',
  },
  bad_format: {
    color: 'text-orange-700',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    icon: <AlertTriangle size={18} className="text-orange-500" />,
    headline: 'Invalid Key Format',
    sub: 'Your GROQ_API_KEY should start with "gsk_". Double-check what you copied.',
  },
  invalid_key: {
    color: 'text-red-700',
    bg: 'bg-red-50',
    border: 'border-red-200',
    icon: <AlertTriangle size={18} className="text-red-500" />,
    headline: 'API Key Rejected',
    sub: 'Groq rejected this key (401). It may be expired or deleted — generate a new one.',
  },
  connection_error: {
    color: 'text-slate-700',
    bg: 'bg-slate-50',
    border: 'border-slate-200',
    icon: <RefreshCw size={18} className="text-slate-500" />,
    headline: 'Connection Error',
    sub: 'Could not reach Groq servers. Check your internet connection and try again.',
  },
}

// ─── Copy Button ──────────────────────────────────────────────────────────────
function CopyBtn({ text, label = 'Copy' }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button
      onClick={copy}
      className="flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-[#60A5FA]/40 hover:text-[#60A5FA] transition-all text-slate-500 shadow-sm"
    >
      {copied ? <Check size={12} className="text-blue-400" /> : <Copy size={12} />}
      {copied ? 'Copied!' : label}
    </button>
  )
}

// ─── Step Card ────────────────────────────────────────────────────────────────
function StepCard({
  step,
  index,
  total,
}: {
  step: (typeof STEPS)[number]
  index: number
  total: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.07 }}
      className="flex gap-3"
    >
      {/* Timeline */}
      <div className="flex flex-col items-center shrink-0">
        <div className="w-8 h-8 rounded-full bg-[#60A5FA]/10 border-2 border-[#60A5FA]/20 flex items-center justify-center text-base">
          {step.icon}
        </div>
        {index < total - 1 && <div className="w-px flex-1 bg-slate-200 mt-1 mb-1 min-h-[16px]" />}
      </div>

      {/* Content */}
      <div className="pb-4 flex-1 min-w-0">
        <p className="text-sm font-black text-slate-800 tracking-tight">
          <span className="text-[#60A5FA] mr-1">Step {step.number}.</span>
          {step.title}
        </p>
        <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{step.description}</p>

        {step.action && (
          <a
            href={step.action.href}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-white bg-[#60A5FA] px-3 py-1.5 rounded-lg hover:bg-[#3B82F6] transition-colors"
          >
            {step.action.label}
            {step.action.external && <ExternalLink size={11} />}
          </a>
        )}

        {step.template && (
          <div className="mt-2 relative">
            <pre className="text-[10px] leading-relaxed bg-slate-900 text-green-400 rounded-xl p-3 overflow-x-auto font-mono">
              {step.template}
            </pre>
            <div className="absolute top-2 right-2">
              <CopyBtn text={step.template} label="Copy template" />
            </div>
          </div>
        )}

        {step.command && (
          <div className="mt-2 flex items-center gap-2 bg-slate-900 px-3 py-2 rounded-xl">
            <Terminal size={12} className="text-slate-400 shrink-0" />
            <code className="text-[11px] text-green-400 font-mono">{step.command}</code>
            <div className="ml-auto">
              <CopyBtn text={step.command} label="Copy" />
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function GroqSetupGuide({
  reason,
  asModal = false,
  onDismiss,
  onRecheck,
}: GroqSetupGuideProps) {
  const [open, setOpen] = useState(true)
  const [stepsOpen, setStepsOpen] = useState(true)

  if (!reason || !open) return null

  const info = REASON_INFO[reason]

  const card = (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 320, damping: 28 }}
      className="w-full max-w-md rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-slate-200/60 overflow-hidden"
    >
      {/* ── Top banner ── */}
      <div className={`px-5 py-4 ${info.bg} border-b ${info.border} flex items-start gap-3`}>
        <div className="mt-0.5 shrink-0">{info.icon}</div>
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-black ${info.color} tracking-tight`}>{info.headline}</p>
          <p className={`text-xs mt-0.5 ${info.color} opacity-80 leading-relaxed`}>{info.sub}</p>
        </div>
        {onDismiss && (
          <button
            onClick={() => { setOpen(false); onDismiss() }}
            className="p-1 rounded-full hover:bg-black/10 transition-colors shrink-0"
          >
            <X size={14} className="text-slate-500" />
          </button>
        )}
      </div>

      {/* ── Feature callout ── */}
      <div className="px-5 pt-4 pb-2 flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#60A5FA] to-[#27ae70] flex items-center justify-center shrink-0">
          <Sparkles size={15} className="text-[#F5A623]" />
        </div>
        <div>
          <p className="text-xs font-black text-slate-800 tracking-tight">Why do we need this?</p>
          <p className="text-[11px] text-slate-400 leading-snug">
            Groq powers real-time AI explanations of your milk scan results. It's{' '}
            <span className="font-bold text-[#60A5FA]">free to use</span> — no credit card required.
          </p>
        </div>
      </div>

      {/* ── Collapsible steps ── */}
      <div className="px-5 pb-5">
        <button
          onClick={() => setStepsOpen((v) => !v)}
          className="w-full flex items-center justify-between py-2.5 text-xs font-black text-slate-500 uppercase tracking-widest hover:text-slate-700 transition-colors"
        >
          Setup Guide (4 steps)
          {stepsOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        <AnimatePresence>
          {stepsOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22 }}
              className="overflow-hidden"
            >
              <div className="pt-1 space-y-0">
                {STEPS.map((step, i) => (
                  <StepCard key={step.number} step={step} index={i} total={STEPS.length} />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Recheck button ── */}
        {onRecheck && (
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={onRecheck}
            className="w-full mt-2 flex items-center justify-center gap-2 py-3 bg-[#60A5FA] text-white rounded-2xl font-black text-sm tracking-tight hover:bg-[#3B82F6] transition-colors shadow-lg shadow-green-900/20"
          >
            <RefreshCw size={15} />
            I've set it up — check again
          </motion.button>
        )}

        <p className="text-center text-[10px] text-slate-300 mt-3 uppercase tracking-widest font-bold">
          Groq is free · No credit card needed
        </p>
      </div>
    </motion.div>
  )

  if (asModal) {
    return (
      <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
        {card}
      </div>
    )
  }

  return card
}
