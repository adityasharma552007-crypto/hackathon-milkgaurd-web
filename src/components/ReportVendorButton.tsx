'use client'

import React, { useState } from 'react'
import { Flag } from 'lucide-react'
import ReportVendorSheet from './ReportVendorSheet'
import { cn } from '@/lib/utils'

interface ReportVendorButtonProps {
  vendorId: string
  vendorName: string
  lastScanId?: string | null
  className?: string
  text?: string
}

export default function ReportVendorButton({
  vendorId,
  vendorName,
  lastScanId,
  className,
  text = "Report Vendor"
}: ReportVendorButtonProps) {
  const [sheetOpen, setSheetOpen] = useState(false)

  return (
    <>
      <button 
        onClick={(e) => {
          e.stopPropagation()
          setSheetOpen(true)
        }}
        className={cn(
          "h-8 px-3 bg-red-50 text-red-500 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 transition-colors hover:bg-red-100 ring-1 ring-red-100 shrink-0",
          className
        )}
      >
        <Flag size={12} className="shrink-0" />
        {text}
      </button>

      <ReportVendorSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        vendorId={vendorId}
        vendorName={vendorName}
        lastScanId={lastScanId}
      />
    </>
  )
}
