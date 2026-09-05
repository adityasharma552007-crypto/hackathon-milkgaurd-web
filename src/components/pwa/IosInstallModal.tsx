'use client'

import React from 'react'
import { Share, PlusSquare, X } from 'lucide-react'
import { MilkGuardLogo } from '@/components/brand/MilkGuardLogo'

interface IosInstallModalProps {
  isOpen: boolean
  onClose: () => void
}

export function IosInstallModal({ isOpen, onClose }: IosInstallModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-[#c4e7ff] text-left relative animate-in slide-in-from-bottom-4 duration-300"
        role="dialog"
        aria-modal="true"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#f0f4f8] hover:bg-[#e2eaf0] text-[#3e484f] flex items-center justify-center transition-colors"
          aria-label="Close"
        >
          <X size={16} />
        </button>

        <div className="mb-4">
          <MilkGuardLogo variant="icon" size={48} />
        </div>

        <h3 className="text-lg font-bold text-[#001d36] mb-1">
          Install MilkGuard on iOS
        </h3>
        <p className="text-xs text-[#52606d] mb-4 leading-relaxed">
          Install MilkGuard directly on your iPhone or iPad home screen via Safari:
        </p>

        <ol className="space-y-3 text-xs text-[#1e293b]">
          <li className="flex items-start gap-3 p-2.5 rounded-xl bg-[#f8f9ff] border border-[#e2eaf0]">
            <span className="w-5 h-5 rounded-full bg-[#00668a] text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
              1
            </span>
            <span>
              Tap the <strong className="text-[#00668a]">Share</strong> button in Safari's bottom toolbar.
            </span>
          </li>

          <li className="flex items-start gap-3 p-2.5 rounded-xl bg-[#f8f9ff] border border-[#e2eaf0]">
            <span className="w-5 h-5 rounded-full bg-[#00668a] text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
              2
            </span>
            <span>
              Scroll down and tap <strong className="text-[#00668a]"><PlusSquare size={13} className="inline mr-1 -mt-0.5" />Add to Home Screen</strong>.
            </span>
          </li>

          <li className="flex items-start gap-3 p-2.5 rounded-xl bg-[#f8f9ff] border border-[#e2eaf0]">
            <span className="w-5 h-5 rounded-full bg-[#00668a] text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
              3
            </span>
            <span>
              Tap <strong className="text-[#00668a]">Add</strong> in the top right corner to complete.
            </span>
          </li>
        </ol>

        <button
          onClick={onClose}
          className="w-full mt-5 py-2.5 rounded-xl bg-[#00668a] hover:bg-[#004c69] text-white font-bold text-xs shadow-sm transition-all"
        >
          Got It
        </button>
      </div>
    </div>
  )
}
