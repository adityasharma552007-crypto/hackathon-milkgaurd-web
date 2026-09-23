'use client'

import React, { useEffect } from 'react'
import Link from 'next/link'
import { AlertCircle, RotateCcw, ChevronLeft, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export default function ScanReportError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[ScanReportError] Unhandled error in scan report page:', error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] max-w-lg mx-auto p-4 text-center">
      <Card className="rounded-3xl border border-[#d1e4ff] bg-white p-6 sm:p-8 ambient-shadow w-full">
        <CardContent className="p-0 flex flex-col items-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center border border-red-100 shadow-sm">
            <AlertCircle size={32} />
          </div>

          <div className="space-y-1">
            <h1 className="text-xl font-black text-[#001d36] tracking-tight">
              Unable to Load Test Report
            </h1>
            <p className="text-xs text-[#3e484f] max-w-sm leading-relaxed">
              We encountered an issue preparing the spectrophotometric analysis report. Your test data is safe.
            </p>
          </div>

          {error?.message && (
            <div className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-left overflow-x-auto">
              <p className="text-[10px] font-mono text-slate-500 font-bold uppercase tracking-wider mb-0.5">Diagnostic Details</p>
              <p className="text-xs font-mono text-slate-800 break-words">{error.message}</p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-2.5 w-full pt-2">
            <Button
              onClick={() => reset()}
              className="flex-1 h-12 rounded-xl bg-[#00668a] hover:bg-[#004c69] text-white font-bold text-xs uppercase tracking-wider gap-2 shadow-sm"
            >
              <RotateCcw size={14} />
              Reload Report
            </Button>
            <Button
              asChild
              variant="outline"
              className="flex-1 h-12 rounded-xl border-[#d1e4ff] text-[#001d36] font-bold text-xs uppercase tracking-wider gap-2 hover:bg-[#e5efff]/40"
            >
              <Link href="/history">
                <ChevronLeft size={14} />
                Back to History
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
