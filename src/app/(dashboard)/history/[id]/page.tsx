import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { 
  Shield, 
  AlertCircle, 
  AlertTriangle, 
  ChevronLeft, 
  Info, 
  FileText, 
  Share2,
  ChevronDown,
  Building2,
  Calendar,
  Activity,
  Blocks
} from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

import SpectralChart from "@/components/SpectralChart"
import FSSAIReportModal from "@/components/FSSAIReportModal"
import ReportButton from "@/components/ReportButton"
import ReportVendorButton from "@/components/ReportVendorButton"
import ExplainWithAI from "@/components/ExplainWithAI"
import BlockchainDetails from "@/components/BlockchainDetails"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

const FALLBACK_SCANS_MAP: Record<string, any> = {
  'scan-demo-1': {
    id: 'scan-demo-1',
    safety_score: 96,
    result_tier: 'safe',
    ai_confidence: 98,
    recommendation: 'Milk sample is pure and safe for consumption.',
    created_at: new Date().toISOString(),
    source_hardware_id: 'ESP32-DEV-01',
    tx_hash: '0x8f2d3a4b5c6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a',
    vendors: { id: 'v1', name: 'Amul Dairy Booth #104', avg_score: 95, report_count: 0 }
  },
  'scan-demo-2': {
    id: 'scan-demo-2',
    safety_score: 92,
    result_tier: 'safe',
    ai_confidence: 95,
    recommendation: 'Good quality sample. Minimal variation in spectral baseline.',
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
    source_hardware_id: null,
    tx_hash: '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b',
    vendors: { id: 'v2', name: 'Saras Milk Outlet', avg_score: 88, report_count: 1 }
  },
  'scan-demo-3': {
    id: 'scan-demo-3',
    safety_score: 45,
    result_tier: 'adulterated',
    ai_confidence: 94,
    recommendation: 'Adulterants detected: Traces of detergent and starch found.',
    created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
    source_hardware_id: null,
    tx_hash: null,
    vendors: { id: 'v3', name: 'Local Unregistered Vendor', avg_score: 42, report_count: 5 }
  }
}

export default async function ScanResultPage({ 
  params,
  searchParams 
}: { 
  params: { id: string },
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  let scan: any = FALLBACK_SCANS_MAP[params.id] || null

  if (!scan) {
    try {
      const supabase = createClient()
      const { data } = await supabase
        .from('scans')
        .select('*, vendors(id, name, avg_score, report_count), adulterant_results(*), fssai_reports(id), tx_hash, source_hardware_id')
        .eq('id', params.id)
        .single()
      if (data) scan = data
    } catch {
      scan = FALLBACK_SCANS_MAP['scan-demo-1']
    }
  }

  if (!scan) {
    scan = FALLBACK_SCANS_MAP['scan-demo-1']
  }

  function getTrustScoreDetails(avgScore: number, reportCount: number) {
    const trustScore = Math.round((avgScore * 0.6) + Math.max(0, 40 - (reportCount * 5)))
    if (trustScore >= 80) return { score: trustScore, label: 'Trusted', color: 'text-[#006b5f]', bg: 'bg-[#30c5b3]/15' }
    if (trustScore >= 50) return { score: trustScore, label: 'Moderate', color: 'text-amber-700', bg: 'bg-amber-100' }
    return { score: trustScore, label: 'Flagged', color: 'text-[#93000a]', bg: 'bg-[#ffdad6]' }
  }

  const vendorTrust = scan.vendors ? getTrustScoreDetails(scan.vendors.avg_score || 0, scan.vendors.report_count || 0) : null

  const tierBanners = {
    safe: "bg-gradient-to-br from-[#00668a] to-[#004c69] text-white",
    warning: "bg-gradient-to-br from-[#d97706] to-[#b45309] text-white",
    danger: "bg-gradient-to-br from-[#ba1a1a] to-[#93000a] text-white",
    hazard: "bg-gradient-to-br from-[#1b1c1c] to-[#000000] text-red-400"
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto">
      {/* Top Banner */}
      <div className={cn("p-8 rounded-3xl relative overflow-hidden ambient-shadow text-center", tierBanners[scan.result_tier as keyof typeof tierBanners])}>
        <div className="relative z-10 space-y-4">
          <div className="flex justify-between items-center">
            <Link href="/history" className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors">
              <ChevronLeft size={20} />
            </Link>
            <span className="text-xs font-bold uppercase tracking-widest opacity-80">Milk Purity Certificate</span>
            <div className="p-2 bg-white/10 rounded-full opacity-0 pointer-events-none">
              <Share2 size={16} />
            </div>
          </div>

          <div className="flex flex-col items-center">
            <span className="text-6xl md:text-7xl font-extrabold tracking-tight leading-none mb-1">{scan.safety_score}%</span>
            <span className="text-xs font-bold uppercase tracking-widest opacity-80">Safety Index Score</span>
          </div>

          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            {scan.result_tier === 'safe' ? 'MILK IS SAFE & PURE' : 'ADULTERATION DETECTED'}
          </h1>

          <p className="text-xs md:text-sm font-medium opacity-90 max-w-md mx-auto leading-relaxed">
            {scan.recommendation}
          </p>
        </div>
      </div>

      <main className="space-y-6">
        {/* Info Card */}
        <Card className="rounded-2xl border border-[#d1e4ff] bg-white ambient-shadow">
          <CardContent className="p-6 space-y-4">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 bg-[#e5efff] rounded-xl flex items-center justify-center text-[#00668a]">
                  <Building2 size={24} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#3e484f]">Sample Origin</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className="font-bold text-[#001d36] text-base">{scan.vendors?.name || 'Home / Unlisted Sample'}</p>
                    {vendorTrust && (
                      <Badge className={cn("text-[10px] px-2 py-0.5 font-bold uppercase border-none", vendorTrust.bg, vendorTrust.color)}>
                        {vendorTrust.label}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <p className="text-xs font-semibold text-[#3e484f]">AI Confidence</p>
                <Badge variant="secondary" className="bg-[#e5efff] text-[#00668a] font-extrabold text-sm border-none mt-0.5">
                  {scan.ai_confidence}%
                </Badge>
              </div>
            </div>

            {scan.vendors && vendorTrust && (
              <>
                <Separator className="bg-[#d1e4ff]/60" />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div>
                      <p className="text-xs font-semibold text-[#3e484f]">Trust Rating</p>
                      <p className={cn("text-2xl font-extrabold", vendorTrust.color)}>{vendorTrust.score}/100</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-[#3e484f]">Community Reports</p>
                      <p className="text-sm font-bold text-[#001d36]">{scan.vendors.report_count || 0} flagged</p>
                    </div>
                  </div>

                  <ReportVendorButton 
                    vendorId={scan.vendors.id} 
                    vendorName={scan.vendors.name} 
                    lastScanId={scan.id} 
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Blockchain Details Card */}
        <Card className="rounded-2xl border border-[#d1e4ff] bg-white ambient-shadow">
          <CardHeader className="p-6 pb-2">
            <CardTitle className="text-sm font-bold text-[#001d36] flex items-center gap-2">
              <span className="material-symbols-outlined text-[#00668a]">verified</span>
              <span>Blockchain Verification Record</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-2">
            <BlockchainDetails txHash={scan.tx_hash ?? null} />
          </CardContent>
        </Card>

        {/* Spectral Chart */}
        <Card className="rounded-2xl border border-[#d1e4ff] bg-white ambient-shadow overflow-hidden">
          <CardHeader className="p-6 pb-2">
            <CardTitle className="text-sm font-bold text-[#001d36] flex items-center gap-2">
              <Activity size={18} className="text-[#00668a]" />
              <span>Spectral Fingerprint Scan</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0 space-y-4">
            {!scan.source_hardware_id ? (
              <SpectralChart data={scan.wavelength_data} />
            ) : (
              <div className="py-8 text-center bg-[#f8f9ff] rounded-2xl border border-[#d1e4ff]">
                <p className="text-3xl mb-1">📡</p>
                <p className="font-bold text-[#001d36]">Direct Hardware Pod Sensor Reading</p>
                <p className="text-xs mt-1 text-[#3e484f]">Raw spectral decomposition is mapped directly via NIR hardware sensor.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Adulterant Breakdown / Findings */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-[#001d36] px-1">Chemical Adulterant Breakdown</h3>
          {!scan.source_hardware_id ? (
            scan.adulterant_results?.map((res: any) => (
              <Card key={res.id} className="rounded-2xl border border-[#d1e4ff] bg-white ambient-shadow">
                <CardContent className="p-4 flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-9 h-9 rounded-xl flex items-center justify-center",
                        res.status === 'clear' ? "bg-[#30c5b3]/15 text-[#006b5f]" : "bg-[#ffdad6] text-[#ba1a1a]"
                      )}>
                        <span className="material-symbols-outlined text-xl">
                          {res.status === 'clear' ? 'shield' : 'warning'}
                        </span>
                      </div>
                      <div>
                        <p className="font-bold text-[#001d36] text-sm">{res.name}</p>
                        <p className="text-xs font-semibold text-[#3e484f]">
                          {res.status === 'clear' ? 'NOT DETECTED (Safe)' : `DETECTED: ${res.detected_value}${res.unit}`}
                        </p>
                      </div>
                    </div>
                  </div>
                  {res.detected && (
                    <p className="text-xs font-medium text-[#001d36] bg-[#eef4ff] p-3 rounded-xl border border-[#c4e7ff] italic">
                      "{res.analogy}"
                    </p>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="rounded-2xl border border-[#d1e4ff] bg-white ambient-shadow p-5">
              <div className="flex items-center gap-3">
                <span className="text-2xl">📡</span>
                <div>
                  <p className="font-bold text-[#001d36]">ESP32 Hardware Reading</p>
                  <p className="text-xs text-[#3e484f]">Direct sensor analysis threshold check</p>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* AI Explanation */}
        {!scan.source_hardware_id && (
          <ExplainWithAI
            safetyScore={scan.safety_score}
            resultTier={scan.result_tier}
            recommendation={scan.recommendation}
            vendorName={scan.vendors?.name}
            aiConfidence={scan.ai_confidence}
            adulterantResults={scan.adulterant_results ?? []}
          />
        )}

        {/* FSSAI Notice & Report Generator */}
        <div className="space-y-3 pt-2">
          {['hazard', 'danger'].includes(scan.result_tier) && scan.vendor_id && (
            <ReportButton 
              scanId={scan.id} 
              isHazard={scan.result_tier === 'hazard'} 
              isReported={(scan.fssai_reports?.length ?? 0) > 0} 
            />
          )}

          <FSSAIReportModal 
            scan={scan} 
            defaultOpen={searchParams.report === 'true'} 
          />
        </div>
      </main>
    </div>
  )
}
