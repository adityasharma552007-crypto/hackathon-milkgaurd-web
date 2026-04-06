'use client'

import React, { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Copy, Check, RefreshCw, Loader2, ChevronDown, ChevronUp } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { Button } from '@/components/ui/button'
import GroqSetupGuide, { type GroqKeyReason } from '@/components/GroqSetupGuide'

// ─── Types ────────────────────────────────────────────────────────────────────
interface AdulterantResult {
  name: string
  detected: boolean
  detected_value?: number
  unit?: string
  status: string
}

interface ExplainWithAIProps {
  safetyScore: number
  resultTier: string
  recommendation: string
  vendorName?: string
  aiConfidence: number
  adulterantResults: AdulterantResult[]
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function buildContext(props: ExplainWithAIProps): string {
  const detected = props.adulterantResults.filter((r) => r.detected)
  const lines = [
    `Safety Score: ${props.safetyScore}%`,
    `Result Tier: ${props.resultTier.toUpperCase()}`,
    `AI Confidence: ${props.aiConfidence}%`,
    `Vendor: ${props.vendorName || 'Unknown/Unlisted'}`,
    `Recommendation: ${props.recommendation}`,
    '',
    'Adulterant Analysis:',
    ...props.adulterantResults.map((r) =>
      r.detected
        ? `  • ${r.name}: DETECTED (${r.detected_value}${r.unit})`
        : `  • ${r.name}: Clear`
    ),
    '',
    detected.length > 0
      ? `Summary: ${detected.length} adulterant(s) found — ${detected.map((r) => r.name).join(', ')}.`
      : 'Summary: No adulterants detected. Milk appears pure.',
  ]
  return lines.join('\n')
}

async function streamExplain(
  context: string,
  messages: { role: string; content: string }[],
  onChunk: (text: string) => void,
  signal?: AbortSignal
): Promise<void> {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages,
      context,
    }),
    signal,
  })

  if (!res.ok) {
    const { error } = await res.json().catch(() => ({ error: 'Request failed' }))
    throw new Error(error || `HTTP ${res.status}`)
  }

  const reader = res.body!.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop()!

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue
      const payload = line.slice(6).trim()
      if (payload === '[DONE]') return
      try {
        const { text, error } = JSON.parse(payload)
        if (error) throw new Error(error)
        if (text) onChunk(text)
      } catch {
        // skip malformed
      }
    }
  }
}

// ─── Copy Button ──────────────────────────────────────────────────────────────
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }}
      className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 hover:text-[#1A6B4A] transition-colors uppercase tracking-widest"
    >
      {copied ? <Check size={11} className="text-green-500" /> : <Copy size={11} />}
      {copied ? 'Copied!' : 'Copy'}
    </button>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ExplainWithAI(props: ExplainWithAIProps) {
  const [phase, setPhase] = useState<'idle' | 'loading' | 'streaming' | 'done' | 'error'>('idle')
  const [explanation, setExplanation] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [groqErrorReason, setGroqErrorReason] = useState<GroqKeyReason>(null)
  const [expanded, setExpanded] = useState(true)
  const [followUp, setFollowUp] = useState('')
  const [chatHistory, setChatHistory] = useState<{ role: string; content: string }[]>([])
  const [followUpLoading, setFollowUpLoading] = useState(false)

  const context = buildContext(props)

  const explain = useCallback(async () => {
    setPhase('loading')
    setExplanation('')
    setErrorMsg('')
    setGroqErrorReason(null)
    setExpanded(true)

    const initialMessages = [
      {
        role: 'user',
        content: 'Please explain my milk scan results in simple terms and tell me what I should do next.',
      },
    ]
    setChatHistory(initialMessages)

    try {
      setPhase('streaming')
      let full = ''
      await streamExplain(
        context,
        initialMessages,
        (chunk) => {
          full += chunk
          setExplanation(full)
        }
      )
      setChatHistory((prev) => [
        ...prev,
        { role: 'assistant', content: full },
      ])
      setPhase('done')
    } catch (err: any) {
      const msg: string = err.message || ''
      // Detect key-related errors and show the setup guide
      if (msg.includes('not set up') || msg.includes('503') || msg.includes('key not')) {
        setGroqErrorReason('missing')
      } else if (msg.includes('Invalid Groq') || msg.includes('401')) {
        setGroqErrorReason('invalid_key')
      } else {
        setErrorMsg(msg || 'Failed to get AI explanation.')
      }
      setPhase('error')
    }
  }, [context])

  const sendFollowUp = useCallback(async () => {
    const q = followUp.trim()
    if (!q || followUpLoading) return
    setFollowUp('')
    setFollowUpLoading(true)

    const newHistory = [
      ...chatHistory,
      { role: 'user', content: q },
    ]
    setChatHistory(newHistory)

    // Append streaming assistant message
    let full = ''
    const assistantPlaceholder = { role: 'assistant', content: '' }
    setChatHistory([...newHistory, assistantPlaceholder])

    try {
      await streamExplain(
        context,
        newHistory,
        (chunk) => {
          full += chunk
          setChatHistory((prev) => {
            const updated = [...prev]
            updated[updated.length - 1] = { role: 'assistant', content: full }
            return updated
          })
        }
      )
    } catch (err: any) {
      setChatHistory((prev) => {
        const updated = [...prev]
        updated[updated.length - 1] = {
          role: 'assistant',
          content: `⚠️ ${err.message || 'Error getting response.'}`,
        }
        return updated
      })
    } finally {
      setFollowUpLoading(false)
    }
  }, [followUp, followUpLoading, chatHistory, context])

  if (phase === 'idle') {
    return (
      <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        onClick={explain}
        className="w-full flex items-center justify-center gap-3 py-4 px-5 bg-gradient-to-r from-[#1A6B4A] to-[#1e8259] text-white rounded-2xl shadow-lg shadow-green-900/20 font-bold text-sm tracking-tight"
      >
        <Sparkles size={18} className="text-[#F5A623]" />
        Explain with AI
        <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-black uppercase tracking-wider">
          Groq AI
        </span>
      </motion.button>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl border border-slate-100 bg-white shadow-lg overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-[#1A6B4A] to-[#1e8259] text-white">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-[#F5A623]" />
          <p className="font-black text-sm tracking-tight">AI Explanation</p>
          <span className="text-[9px] bg-white/20 px-2 py-0.5 rounded-full font-black uppercase tracking-wider">
            Groq · Mixtral
          </span>
        </div>
        <div className="flex items-center gap-2">
          {phase === 'done' && <CopyButton text={explanation} />}
          <button
            onClick={() => setExpanded((v) => !v)}
            className="p-1 hover:bg-white/20 rounded-full transition-colors"
          >
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="p-5">
              {/* Loading state */}
              {phase === 'loading' && (
                <div className="flex items-center gap-3 py-4">
                  <Loader2 size={20} className="animate-spin text-[#1A6B4A]" />
                  <p className="text-sm text-slate-500 font-medium">Analyzing your scan results…</p>
                </div>
              )}

              {/* Error state — Groq key issue → show setup guide */}
              {phase === 'error' && groqErrorReason && (
                <GroqSetupGuide
                  reason={groqErrorReason}
                  onRecheck={() => { setPhase('idle'); setGroqErrorReason(null) }}
                />
              )}

              {/* Error state — generic error */}
              {phase === 'error' && !groqErrorReason && (
                <div className="space-y-3">
                  <p className="text-sm text-red-500 font-medium">{errorMsg}</p>
                  <Button
                    onClick={explain}
                    variant="outline"
                    size="sm"
                    className="text-[#1A6B4A] border-[#1A6B4A]/30 font-bold rounded-xl"
                  >
                    <RefreshCw size={13} className="mr-1.5" /> Retry
                  </Button>
                </div>
              )}

              {/* Streaming / Done */}
              {(phase === 'streaming' || phase === 'done') && (
                <div className="space-y-4">
                  {/* Main explanation */}
                  <div className="prose prose-sm prose-slate max-w-none text-slate-700 [&>p]:mb-2 [&>ul]:mb-2 [&>ul>li]:mb-1 [&_strong]:text-slate-900 [&_strong]:font-bold">
                    <ReactMarkdown>{explanation}</ReactMarkdown>
                    {phase === 'streaming' && (
                      <span className="inline-block w-1 h-4 bg-[#1A6B4A] ml-0.5 animate-pulse rounded-sm align-text-bottom" />
                    )}
                  </div>

                  {/* Follow-up conversation */}
                  {chatHistory.length > 2 && (
                    <div className="space-y-3 border-t border-slate-100 pt-4">
                      {chatHistory.slice(2).map((msg, i) => (
                        <div
                          key={i}
                          className={`text-sm ${
                            msg.role === 'user'
                              ? 'text-right'
                              : 'text-left'
                          }`}
                        >
                          <span
                            className={`inline-block px-3 py-2 rounded-xl max-w-[85%] ${
                              msg.role === 'user'
                                ? 'bg-[#1A6B4A] text-white font-medium'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {msg.role === 'assistant' ? (
                              <div className="prose prose-sm prose-slate max-w-none [&>p]:mb-0">
                                <ReactMarkdown>{msg.content}</ReactMarkdown>
                                {followUpLoading && i === chatHistory.length - 3 && (
                                  <span className="inline-block w-1 h-4 bg-slate-400 animate-pulse rounded-sm" />
                                )}
                              </div>
                            ) : (
                              msg.content
                            )}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Follow-up input */}
                  {phase === 'done' && (
                    <div className="border-t border-slate-100 pt-3 flex gap-2">
                      <input
                        type="text"
                        value={followUp}
                        onChange={(e) => setFollowUp(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && sendFollowUp()}
                        placeholder="Ask a follow-up question…"
                        disabled={followUpLoading}
                        className="flex-1 text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-[#1A6B4A] bg-slate-50 placeholder:text-slate-300 disabled:opacity-50"
                      />
                      <button
                        onClick={sendFollowUp}
                        disabled={!followUp.trim() || followUpLoading}
                        className="px-3 py-2 bg-[#1A6B4A] disabled:bg-slate-200 text-white text-xs font-bold rounded-xl transition-colors"
                      >
                        {followUpLoading ? <Loader2 size={13} className="animate-spin" /> : 'Ask'}
                      </button>
                    </div>
                  )}

                  {/* Re-generate */}
                  {phase === 'done' && (
                    <button
                      onClick={explain}
                      className="flex items-center gap-1.5 text-[10px] text-slate-300 hover:text-slate-500 transition-colors font-medium uppercase tracking-widest"
                    >
                      <RefreshCw size={10} /> Regenerate
                    </button>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
