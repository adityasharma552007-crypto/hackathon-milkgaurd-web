'use client'

import React from 'react'
import { ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BlockchainBadgeProps {
  txHash: string | null
  className?: string
}

export default function BlockchainBadge({ txHash, className }: BlockchainBadgeProps) {
  if (txHash) {
    return (
      <a
        href={`https://amoy.polygonscan.com/tx/${txHash}`}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider',
          'bg-emerald-50 text-emerald-600 border border-emerald-200',
          'hover:bg-emerald-100 hover:border-emerald-300 transition-all duration-200',
          'cursor-pointer select-none',
          className
        )}
      >
        <span className="text-[11px]">✅</span>
        Verified on Blockchain
        <ExternalLink size={9} className="opacity-60" />
      </a>
    )
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider',
        'bg-slate-100 text-slate-400 border border-slate-200',
        'cursor-default select-none',
        className
      )}
    >
      <span className="text-[11px]">⏳</span>
      Pending Verification
    </span>
  )
}
