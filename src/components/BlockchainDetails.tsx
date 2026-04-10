'use client'

import React, { useState } from 'react'
import { Copy, Check, Link2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import BlockchainBadge from './BlockchainBadge'

interface BlockchainDetailsProps {
  txHash: string | null
}

function truncateTxHash(hash: string): string {
  if (hash.length < 12) return hash
  return `${hash.slice(0, 8)}...${hash.slice(-4)}`
}

export default function BlockchainDetails({ txHash }: BlockchainDetailsProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    if (!txHash) return
    try {
      await navigator.clipboard.writeText(txHash)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback: do nothing
    }
  }

  return (
    <div className="space-y-3">
      {/* Badge */}
      <BlockchainBadge txHash={txHash} />

      {/* Hash row – only shown if tx exists */}
      {txHash && (
        <div className="flex items-center gap-2 bg-slate-50 rounded-2xl px-4 py-3">
          <Link2 size={14} className="text-slate-400 shrink-0" />
          <span className="font-mono text-[11px] text-slate-600 font-bold tracking-tight flex-1 min-w-0 truncate">
            {truncateTxHash(txHash)}
          </span>
          <div className="relative">
            <button
              onClick={handleCopy}
              className={cn(
                'p-1.5 rounded-xl transition-all duration-200',
                copied
                  ? 'bg-emerald-100 text-emerald-600'
                  : 'bg-white text-slate-400 hover:text-slate-600 hover:bg-slate-100 shadow-sm'
              )}
              title="Copy transaction hash"
            >
              {copied ? <Check size={13} /> : <Copy size={13} />}
            </button>
            {copied && (
              <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[9px] font-bold px-2 py-1 rounded-lg whitespace-nowrap pointer-events-none">
                Copied!
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
