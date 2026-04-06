"use client"

import { X } from "lucide-react"
import { useEffect, useState } from "react"

interface BottomSheetProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}

export function BottomSheet({ isOpen, onClose, title, children }: BottomSheetProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <>
      {/* Overlay */}
      <div 
        className={`fixed inset-0 bg-black/50 z-[100] transition-opacity duration-300 ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        onClick={onClose}
      />
      
      {/* Sheet */}
      <div 
        className={`fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white z-[100] rounded-t-[24px] p-6 shadow-2xl transition-transform duration-300 transform ${isOpen ? "translate-y-0" : "translate-y-full"}`}
        style={{ maxHeight: "85vh", overflowY: "auto" }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[18px] font-bold text-slate-900">{title}</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 transition-colors">
            <X size={20} className="text-slate-500" />
          </button>
        </div>
        <div className="pb-4">
          {children}
        </div>
      </div>
    </>
  )
}
