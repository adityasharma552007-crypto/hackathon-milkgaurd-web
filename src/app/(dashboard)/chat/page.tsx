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
async function checkGroqStatus(): Promise<{ ok: boolean; reason: GroqKeyReason; model?: string }> {
  try {
    const res = await fetch('/api/groq-status')
    const data = await res.json()
    return data as { ok: boolean; reason: GroqKeyReason; model?: string }
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
      {copied ? <Check size={11} className="text-blue-400" /> : <Copy size={11} className="text-slate-400" />}
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
          className="w-2 h-2 rounded-full bg-[#60A5FA]"
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
        <div className="w-7 h-7 rounded-full bg-[#60A5FA] flex items-center justify-center shrink-0 mb-1">
          <Bot size={14} className="text-white" />
        </div>
      )}

      <div className={`max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
        isUser
          ? 'bg-[#60A5FA] text-white rounded-br-sm'
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
  const [groqStatus, setGroqStatus] = useState<{ ok: boolean | null; reason: GroqKeyReason; model?: string }>({
    ok: null, // null = checking
    reason: null,
  })
  const [showSetupModal, setShowSetupModal] = useState(false)
  const [recheckLoading, setRecheckLoading] = useState(false)

  // Check key on mount
  useEffect(() => {
    checkGroqStatus().then(({ ok, reason, model }) => {
      setGroqStatus({ ok, reason, model })
      if (!ok) setShowSetupModal(true)
    })
  }, [])

  const recheck = useCallback(async () => {
    setRecheckLoading(true)
    const { ok, reason, model } = await checkGroqStatus()
    setGroqStatus({ ok, reason, model })
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
    <div className="flex flex-col h-[calc(100vh-120px)] bg-white rounded-2xl border border-[#d1e4ff] ambient-shadow overflow-hidden max-w-4xl mx-auto">

      {/* ── Header ── */}
      <div className="bg-gradient-to-r from-[#00668a] to-[#004c69] text-white px-6 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/15 backdrop-blur-md rounded-xl flex items-center justify-center text-white">
            <span className="material-symbols-outlined text-2xl">smart_toy</span>
          </div>
          <div>
            <h1 className="font-extrabold text-base tracking-tight leading-tight">MilkGuard AI Assistant</h1>
            <p className="text-xs text-[#c4e7ff] font-medium mt-0.5">
              {isChecking
                ? '● Connecting to Groq…'
                : isDisabled
                ? '● Setup Required'
                : loading
                ? '● Computing spectral response…'
                : `● Online · Groq AI Analyst`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isChecking ? (
            <span className="text-[10px] bg-white/20 text-white px-2.5 py-1 rounded-full font-bold uppercase tracking-wider animate-pulse">
              Checking…
            </span>
          ) : isDisabled ? (
            <button
              onClick={() => setShowSetupModal(true)}
              className="text-[10px] bg-[#f59e0b] text-white px-3 py-1 rounded-full font-bold uppercase tracking-wider hover:bg-[#d97706] transition-colors"
            >
              Setup Key
            </button>
          ) : (
            <span className="text-[10px] bg-[#30c5b3] text-[#004d44] px-3 py-1 rounded-full font-bold uppercase tracking-wider">
              {groqStatus.model?.split('/').pop() || 'Groq AI'}
            </span>
          )}
          {messages.length > 0 && !isDisabled && (
            <button onClick={clearChat} className="p-2 hover:bg-white/20 rounded-full transition-colors text-white/80 hover:text-white" title="Clear chat">
              <Trash2 size={16} />
            </button>
          )}
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

      {/* ── Messages Container ── */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-[#f8f9ff]">

        {/* Key checking state */}
        {isChecking && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center h-full pb-10 text-center"
          >
            <Loader2 size={32} className="animate-spin text-[#00668a] mb-3" />
            <p className="text-xs text-[#3e484f] font-semibold uppercase tracking-wider">Connecting to AI Analyst Engine...</p>
          </motion.div>
        )}

        {/* Key missing / invalid */}
        {!isChecking && isDisabled && !showSetupModal && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center h-full pb-10 gap-4 text-center px-4"
          >
            <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500 border border-amber-200">
              <WifiOff size={28} />
            </div>
            <div>
              <p className="font-extrabold text-[#001d36] text-base mb-1">AI Service Disconnected</p>
              <p className="text-[#3e484f] text-xs max-w-xs leading-relaxed">
                Provide your Groq API key to unlock instant milk safety analysis and spectral breakdown explanations.
              </p>
            </div>
            <button
              onClick={() => setShowSetupModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#00668a] text-white rounded-xl font-bold text-xs hover:bg-[#004c69] transition-colors shadow-sm"
            >
              <Sparkles size={14} className="text-[#30c5b3]" />
              Open Setup Guide
            </button>
          </motion.div>
        )}

        {/* Normal empty state */}
        {!isChecking && !isDisabled && messages.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center h-full py-8 text-center max-w-lg mx-auto"
          >
            <div className="w-14 h-14 bg-[#e5efff] rounded-2xl flex items-center justify-center mb-3 text-[#00668a]">
              <span className="material-symbols-outlined text-3xl">psychology</span>
            </div>
            <h2 className="font-extrabold text-[#001d36] text-xl tracking-tight mb-1">Ask MilkGuard AI Analyst</h2>
            <p className="text-[#3e484f] text-xs max-w-sm leading-relaxed mb-6">
              Get instant scientific explanations about your milk purity tests, adulterants, FSSAI regulatory standards, or health risks.
            </p>

            <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
              {suggestions.map(s => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="p-3 rounded-xl bg-white hover:bg-[#e5efff]/60 border border-[#d1e4ff] text-xs font-semibold text-[#001d36] hover:text-[#00668a] transition-all ambient-shadow"
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

      {/* ── Input Bar ── */}
      <div className="p-4 bg-white border-t border-[#d1e4ff] shrink-0">
        {isDisabled ? (
          <button
            onClick={() => setShowSetupModal(true)}
            className="w-full flex items-center justify-center gap-2 py-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs font-bold hover:bg-amber-100 transition-all"
          >
            <Sparkles size={14} className="text-amber-600" />
            Configure Groq API Key to chat
          </button>
        ) : (
          <div className="flex items-end gap-2 bg-[#f8f9ff] rounded-xl border border-[#d1e4ff] p-2.5 focus-within:border-[#00668a] transition-colors">
            <textarea
              ref={textareaRef}
              rows={1}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isChecking ? 'Connecting…' : 'Ask about your test result or milk safety standards...'}
              disabled={loading || isChecking || isDisabled}
              className="flex-1 resize-none bg-transparent text-xs text-[#001d36] placeholder:text-[#6e7980] focus:outline-none disabled:opacity-40 leading-relaxed font-semibold"
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading || isChecking || isDisabled}
              className="w-9 h-9 bg-[#00668a] disabled:bg-[#bdc8d1] text-white rounded-lg flex items-center justify-center shrink-0 transition-all hover:bg-[#004c69] active:scale-95 shadow-sm"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
