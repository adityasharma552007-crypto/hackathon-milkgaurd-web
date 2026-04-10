'use client'

import React, { useState, useRef } from 'react'
import { Flag, Loader2, FileWarning, HelpCircle } from 'lucide-react'
import { submitVendorReport } from '@/lib/actions/vendorReports'
import { toast } from 'sonner'

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'

interface ReportVendorSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  vendorId: string
  vendorName: string
  lastScanId?: string | null
}

const ISSUE_OPTIONS = [
  "Adulteration Confirmed",
  "Incorrect Rating",
  "Suspicious Activity",
  "Wrong Location",
  "Other"
]

export default function ReportVendorSheet({
  open,
  onOpenChange,
  vendorId,
  vendorName,
  lastScanId
}: ReportVendorSheetProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    const formData = new FormData(e.currentTarget)
    formData.append('vendorId', vendorId)
    
    // Checkbox mapping for optional scan validation
    const attachScan = formData.get('attachScan')
    if (attachScan === 'on' && lastScanId) {
      formData.append('scanId', lastScanId)
    }

    const res = await submitVendorReport(formData)
    
    setIsSubmitting(false)

    if (res.error) {
      toast.error(res.error)
    } else {
      toast.success("Report Submitted", {
        description: "Thank you. Our community moderators will review this."
      })
      onOpenChange(false)
      if (formRef.current) formRef.current.reset()
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-[2rem] p-6 pt-8 pb-10 bg-white">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-xl font-black text-slate-800 uppercase tracking-tighter flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center shrink-0">
               <Flag size={14} className="text-red-500" />
            </div>
            Report Vendor
          </SheetTitle>
          <SheetDescription className="text-xs font-bold text-slate-400 uppercase tracking-widest text-left">
            Submit a dispute or report concerning <span className="text-[#60A5FA]">{vendorName}</span>.
          </SheetDescription>
        </SheetHeader>

        <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
          {/* Issue Type */}
          <div className="space-y-2">
            <label htmlFor="issueType" className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">
              Select Issue Type *
            </label>
            <div className="relative">
              <select 
                id="issueType" 
                name="issueType"
                required
                className="w-full h-12 bg-slate-50 border-none rounded-2xl px-4 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-[#60A5FA] appearance-none"
              >
                <option value="" disabled selected>Choose an issue...</option>
                {ISSUE_OPTIONS.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                 <HelpCircle size={16} className="text-slate-300" />
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label htmlFor="description" className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1 flex justify-between">
              <span>Describe the issue *</span>
              <span className="opacity-50 font-medium lowercase tracking-normal">max 300 chars</span>
            </label>
            <textarea
              id="description"
              name="description"
              required
              maxLength={300}
              placeholder="Please provide specifics to help moderators..."
              className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-[#60A5FA] resize-none h-28"
            />
          </div>

          {/* Optional Attach Scan */}
          {lastScanId && (
            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex items-start gap-3">
              <input 
                type="checkbox" 
                id="attachScan" 
                name="attachScan"
                className="mt-1 w-4 h-4 rounded text-amber-500 focus:ring-amber-500 border-amber-300"
              />
              <div>
                <label htmlFor="attachScan" className="text-sm font-bold text-amber-800 block cursor-pointer">
                  Attach latest scan report
                </label>
                <p className="text-[10px] text-amber-600 font-medium leading-tight mt-0.5">
                  Securely link your recent scan result as evidence to this dispute.
                </p>
              </div>
            </div>
          )}

          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full h-14 bg-red-500 hover:bg-red-600 text-white font-black text-lg rounded-full shadow-lg shadow-red-100 uppercase tracking-tighter"
          >
            {isSubmitting ? <Loader2 className="animate-spin" size={24} /> : 'Submit Report'}
          </Button>

          <p className="text-[9px] text-center text-slate-400 font-bold uppercase tracking-widest px-8">
            False reports strictly violate community guidelines.
          </p>
        </form>
      </SheetContent>
    </Sheet>
  )
}
