'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bot,
  Send,
  Loader2,
  Copy,
  Check,
  RefreshCw,
  Sparkles,
  Trash2,
  WifiOff,
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import GroqSetupGuide, { type GroqKeyReason } from '@/components/GroqSetupGuide'

// ─── Types ───────────────────────────────────────────────────────────────────
type Role = 'user' | 'assistant'
interface Message {
  id: string
  role: Role
  content: string
  error?: boolean
}

function uid() {
  return Math.random().toString(36).slice(2)
}

// ─── Groq status check ────────────────────────────────────────────────────────
async function checkGroqStatus(): Promise<{ ok: boolean; reason: GroqKeyReason }> {
  try {
    const res = await fetch('/api/groq-status')
    const data = await res.json()
    return data as { ok: boolean; reason: GroqKeyReason }
  } catch {
    return { ok: false, reason: 'connection_error' }
  }
}

async function streamChat(
  messages: { role: Role; content: string }[],
  onChunk: (text: string) => void,
  signal?: AbortSignal
): Promise<void> {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages }),
    signal,
  })

  if (!res.ok) {
    const data = await res.json().catch(() => ({ error: 'Request failed' }))
    throw new Error(data.error || `HTTP ${res.status}`)
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
      } catch { /* skip malformed */ }
    }
  }
}

// ─── Copy Button ─────────────────────────────────────────────────────────────
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-slate-200"
      title="Copy"
    >
      {copied ? <Check size={11} className="text-blue-500" /> : <Copy size={11} className="text-slate-400" />}
    </button>
  )
}

// ─── Typing Indicator ─────────────────────────────────────────────────────────
function TypingDots() {
  return (
    <div className="flex items-center gap-1 py-1">
      {[0, 1, 2].map(i => (
        <motion.div
          key={i}
          className="w-2 h-2 rounded-full bg-[#1C75E8]"
          animate={{ y: [0, -5, 0], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.2 }}
        />
      ))}
    </div>
  )
}

// ─── Message Bubble ───────────────────────────────────────────────────────────
function Bubble({ msg, onRetry }: { msg: Message; onRetry?: () => void }) {
  const isUser = msg.role === 'user'
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-end gap-2 ${isUser ? 'justify-end' : 'justify-start'} group`}
    >
      {!isUser && (
        <div className="w-7 h-7 rounded-full bg-[#1C75E8] flex items-center justify-center shrink-0 mb-1">
          <Bot size={14} className="text-white" />
        </div>
      )}

      <div className={`max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
        isUser
          ? 'bg-[#1C75E8] text-white rounded-br-sm'
          : msg.error
          ? 'bg-red-50 text-red-600 border border-red-100 rounded-bl-sm'
          : 'bg-slate-100 text-slate-800 rounded-bl-sm'
      }`}>
        {isUser ? (
          <p className="whitespace-pre-wrap">{msg.content}</p>
        ) : msg.content ? (
          <div className="group relative">
            <div className="prose prose-sm prose-slate max-w-none [&>p]:mb-2 [&>p:last-child]:mb-0 [&>ul]:mb-2 [&>ul>li]:mb-0.5 [&_strong]:font-bold [&_strong]:text-slate-900">
              <ReactMarkdown>{msg.content}</ReactMarkdown>
            </div>
            <div className="flex justify-end mt-1.5">
              <CopyButton text={msg.content} />
            </div>
          </div>
        ) : (
          <TypingDots />
        )}

        {msg.error && onRetry && (
          <button onClick={onRetry} className="mt-2 flex items-center gap-1 text-xs font-semibold text-red-500 hover:underline">
            <RefreshCw size={11} /> Retry
          </button>
        )}
      </div>
    </motion.div>
  )
}

// ─── Suggested Questions ──────────────────────────────────────────────────────
const suggestions = [
  'What does a 72% safety score mean?',
  'Is soap adulteration dangerous?',
  'How is urea detected in milk?',
  'What should I do if my milk is contaminated?',
]

// ─── Main Chat Page ───────────────────────────────────────────────────────────
export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const abortRef = useRef<AbortController | null>(null)

  // ─── Groq status state ────────────────────────────────────────────────────
  const [groqStatus, setGroqStatus] = useState<{ ok: boolean | null; reason: GroqKeyReason }>({
    ok: null, // null = checking
    reason: null,
  })
  const [showSetupModal, setShowSetupModal] = useState(false)
  const [recheckLoading, setRecheckLoading] = useState(false)

  // Check key on mount
  useEffect(() => {
    checkGroqStatus().then(({ ok, reason }) => {
      setGroqStatus({ ok, reason })
      if (!ok) setShowSetupModal(true)
    })
  }, [])

  const recheck = useCallback(async () => {
    setRecheckLoading(true)
    const { ok, reason } = await checkGroqStatus()
    setGroqStatus({ ok, reason })
    if (ok) setShowSetupModal(false)
    setRecheckLoading(false)
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 100)}px`
    }
  }, [input])

  const sendMessage = useCallback(async (text?: string) => {
    const content = (text ?? input).trim()
    if (!content || loading || groqStatus.ok === false) return

    const userMsg: Message = { id: uid(), role: 'user', content }
    const aiId = uid()
    const aiMsg: Message = { id: aiId, role: 'assistant', content: '' }

    setMessages(prev => [...prev, userMsg, aiMsg])
    setInput('')
    setLoading(true)

    const history = [...messages, userMsg]
      .filter(m => m.role === 'user' || (m.role === 'assistant' && m.content && !m.error))
      .slice(-10)
      .map(({ role, content }) => ({ role, content }))

    abortRef.current = new AbortController()
    try {
      await streamChat(history, chunk => {
        setMessages(prev => prev.map(m => m.id === aiId ? { ...m, content: m.content + chunk } : m))
      }, abortRef.current.signal)
    } catch (err: any) {
      if (err.name === 'AbortError') return
      setMessages(prev => prev.map(m => m.id === aiId
        ? { ...m, content: err.message || 'Something went wrong. Please try again.', error: true }
        : m
      ))
    } finally {
      setLoading(false)
      abortRef.current = null
    }
  }, [input, loading, messages, groqStatus.ok])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
  }

  const clearChat = () => {
    abortRef.current?.abort()
    setMessages([])
    setLoading(false)
  }

  const lastUserMsg = messages.filter(m => m.role === 'user').at(-1)
  const isChecking = groqStatus.ok === null
  const isDisabled = groqStatus.ok === false

  return (
    <div className="flex flex-col h-screen bg-white">

      {/* ── Header ── */}
      <div className="bg-[#1C75E8] text-white px-5 pt-14 pb-5 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center">
              <Bot size={20} />
            </div>
            <div>
              <h1 className="font-black text-lg tracking-tight leading-none">MilkGuard AI</h1>
              <p className="text-[10px] text-white/70 font-bold uppercase tracking-widest mt-0.5">
                {isChecking
                  ? '● Connecting…'
                  : isDisabled
                  ? '● Setup Required'
                  : loading
                  ? '● Thinking…'
                  : '● Online · Powered by Groq'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {isChecking ? (
              <span className="text-[9px] bg-white/20 text-white px-2 py-0.5 rounded-full font-black uppercase tracking-wider animate-pulse">
                Checking…
              </span>
            ) : isDisabled ? (
              <button
                onClick={() => setShowSetupModal(true)}
                className="text-[9px] bg-[#F5A623] text-white px-2 py-0.5 rounded-full font-black uppercase tracking-wider hover:bg-[#e09512] transition-colors"
              >
                Setup Key
              </button>
            ) : (
              <span className="text-[9px] bg-[#F5A623] text-white px-2 py-0.5 rounded-full font-black uppercase tracking-wider">
                Mixtral
              </span>
            )}
            {messages.length > 0 && !isDisabled && (
              <button onClick={clearChat} className="p-2 hover:bg-white/20 rounded-full transition-colors ml-1" title="Clear chat">
                <Trash2 size={16} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Setup Guide Modal ── */}
      <AnimatePresence>
        {showSetupModal && isDisabled && (
          <GroqSetupGuide
            reason={groqStatus.reason}
            asModal={true}
            onDismiss={() => setShowSetupModal(false)}
            onRecheck={recheckLoading ? undefined : recheck}
          />
        )}
      </AnimatePresence>

      {/* ── Messages ── */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 scroll-smooth">

        {/* Key checking state */}
        {isChecking && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center h-full pb-10 text-center"
          >
            <Loader2 size={28} className="animate-spin text-[#1C75E8]/40 mb-3" />
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Connecting to AI…</p>
          </motion.div>
        )}

        {/* Key missing / invalid — inline callout (when modal dismissed) */}
        {!isChecking && isDisabled && !showSetupModal && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center h-full pb-10 gap-5 px-2"
          >
            <div className="w-16 h-16 bg-amber-50 rounded-3xl flex items-center justify-center">
              <WifiOff size={28} className="text-amber-400" />
            </div>
            <div className="text-center">
              <p className="font-black text-slate-800 text-base tracking-tight mb-1">AI Not Connected</p>
              <p className="text-slate-400 text-xs leading-relaxed max-w-[240px]">
                Set up your free Groq API key to start chatting about milk safety.
              </p>
            </div>
            <button
              onClick={() => setShowSetupModal(true)}
              className="flex items-center gap-2 px-5 py-3 bg-[#1C75E8] text-white rounded-2xl font-black text-sm tracking-tight hover:bg-[#0A4BB5] transition-colors shadow-lg shadow-green-900/20"
            >
              <Sparkles size={15} className="text-[#F5A623]" />
              View Setup Guide
            </button>
          </motion.div>
        )}

        {/* Normal empty state */}
        {!isChecking && !isDisabled && messages.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center h-full pb-10 text-center"
          >
            <div className="w-16 h-16 bg-[#1C75E8]/10 rounded-3xl flex items-center justify-center mb-4">
              <Sparkles size={28} className="text-[#1C75E8]" />
            </div>
            <h2 className="font-black text-slate-800 text-lg tracking-tight mb-1">Ask MilkGuard AI</h2>
            <p className="text-slate-400 text-xs font-medium max-w-[240px] leading-relaxed mb-6">
              Ask anything about your scan results, milk safety, or adulteration standards.
            </p>
            <div className="w-full space-y-2">
              {suggestions.map(s => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="w-full text-left text-xs font-medium px-4 py-3 rounded-2xl bg-slate-50 hover:bg-[#1C75E8]/5 border border-slate-100 hover:border-[#1C75E8]/20 text-slate-600 hover:text-[#1C75E8] transition-all"
                >
                  {s}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        <AnimatePresence initial={false}>
          {messages.map(msg => (
            <Bubble
              key={msg.id}
              msg={msg}
              onRetry={msg.error && lastUserMsg
                ? () => { setMessages(p => p.filter(m => m.id !== msg.id)); sendMessage(lastUserMsg.content) }
                : undefined
              }
            />
          ))}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      {/* ── Input ── */}
      <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 shrink-0">
        {isDisabled ? (
          <button
            onClick={() => setShowSetupModal(true)}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl text-amber-700 text-xs font-black uppercase tracking-widest hover:from-amber-100 hover:to-orange-100 transition-all"
          >
            <Sparkles size={14} className="text-amber-500" />
            Setup Groq API Key to enable chat
          </button>
        ) : (
          <div className="flex items-end gap-2 bg-white rounded-2xl border border-slate-200 px-4 py-2.5 focus-within:border-[#1C75E8] transition-colors shadow-sm">
            <textarea
              ref={textareaRef}
              rows={1}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isChecking ? 'Connecting…' : 'Ask about your milk test results…'}
              disabled={loading || isChecking || isDisabled}
              className="flex-1 resize-none bg-transparent text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none disabled:opacity-40 leading-relaxed"
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading || isChecking || isDisabled}
              className="w-9 h-9 bg-[#1C75E8] disabled:bg-slate-200 text-white rounded-xl flex items-center justify-center shrink-0 transition-all hover:bg-[#0A4BB5] active:scale-95"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            </button>
          </div>
        )}
        {!isDisabled && (
          <p className="text-center text-[9px] text-slate-300 mt-1.5 tracking-widest font-medium uppercase">
            Enter to send · Shift+Enter for newline
          </p>
        )}
      </div>
    </div>
  )
}
