'use client'

import React, { useState, useTransition } from 'react'
import { AlertCircle, CheckCircle2, Loader2, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { reportVendor } from '@/lib/actions/reports'
import { toast } from "sonner"

interface ReportButtonProps {
  scanId: string
  isHazard: boolean
  isReported: boolean
}

export default function ReportButton({ scanId, isHazard, isReported }: ReportButtonProps) {
  const [isPending, startTransition] = useTransition()
  const [reported, setReported] = useState(isReported || isHazard)

  const handleReport = async () => {
    startTransition(async () => {
       try {
         const res = await reportVendor(scanId)
         if (res.success) {
           setReported(true)
           toast.success("Vendor reported to FSSAI successfully.")
         }
       } catch (err: any) {
         toast.error(err.message || "Failed to report vendor.")
       }
    })
  }

  if (reported) {
    return (
      <div className="flex items-center gap-2 p-4 bg-red-50 text-red-600 rounded-3xl border border-red-100">
         <CheckCircle2 size={24} />
         <div>
            <p className="font-black uppercase text-xs tracking-tighter">Reported to FSSAI</p>
            <p className="text-[10px] font-bold opacity-80">Regulatory investigation pending.</p>
         </div>
      </div>
    )
  }

  return (
    <Button 
      onClick={handleReport}
      disabled={isPending}
      className="w-full h-16 rounded-3xl bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-tighter gap-3 shadow-xl shadow-red-100"
    >
      {isPending ? (
        <Loader2 className="animate-spin" size={20} />
      ) : (
        <AlertCircle size={20} />
      )}
      Report Vendor to FSSAI
    </Button>
  )
}
