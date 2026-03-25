'use client'

import React, { useState, useEffect } from 'react'
import { PDFDownloadLink } from '@react-pdf/renderer'
import { FileText, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import ScanReportPDF from './ScanReportPDF'

interface PDFButtonProps {
  scan: any
}

export default function PDFButton({ scan }: PDFButtonProps) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) return null

  return (
    <PDFDownloadLink
      document={<ScanReportPDF scan={scan} />}
      fileName={`MilkGuard_Report_${scan.id.substring(0, 8)}.pdf`}
    >
      {/* @ts-ignore */}
      {({ loading }: any) => (
        <Button variant="outline" disabled={loading} className="w-full h-16 rounded-3xl border-slate-200 text-slate-400 font-black uppercase tracking-tighter gap-3 bg-white">
          {loading ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              Generating PDF...
            </>
          ) : (
            <>
              <FileText size={20} />
              Download Official Report
            </>
          )}
        </Button>
      )}
    </PDFDownloadLink>
  )
}
