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

export default async function ScanResultPage({ 
  params,
  searchParams 
}: { 
  params: { id: string },
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const supabase = createClient()
  const { data: scan } = await supabase
    .from('scans')
    .select('*, vendors(id, name, avg_score, report_count), adulterant_results(*), fssai_reports(id), tx_hash')
    .eq('id', params.id)
    .single()

  if (!scan) notFound()

  function getTrustScoreDetails(avgScore: number, reportCount: number) {
    const trustScore = Math.round((avgScore * 0.6) + Math.max(0, 40 - (reportCount * 5)))
    if (trustScore >= 80) return { score: trustScore, label: 'Trusted', color: 'text-emerald-500', bg: 'bg-emerald-50' }
    if (trustScore >= 50) return { score: trustScore, label: 'Moderate', color: 'text-amber-500', bg: 'bg-amber-50' }
    return { score: trustScore, label: 'Flagged', color: 'text-red-500', bg: 'bg-red-50' }
  }

  const vendorTrust = scan.vendors ? getTrustScoreDetails(scan.vendors.avg_score || 0, scan.vendors.report_count || 0) : null

  const tierColors = {
    safe: "bg-[#60A5FA] text-white",
    warning: "bg-amber-500 text-white",
    danger: "bg-red-500 text-white",
    hazard: "bg-black text-rose-500"
  }

  const tierIcons = {
    safe: Shield,
    warning: AlertTriangle,
    danger: AlertCircle,
    hazard: AlertCircle
  }

  const StatusIcon = tierIcons[scan.result_tier as keyof typeof tierIcons]

  return (
    <div className="flex flex-col min-h-screen bg-[#F7F9F8]">
      {/* Top Banner */}
      <div className={cn("p-6 pt-12 text-center relative overflow-hidden", tierColors[scan.result_tier as keyof typeof tierColors])}>
        <div className="relative z-10">
          <div className="flex justify-between items-center mb-6">
            <Link href="/home" className="p-2 bg-white/10 rounded-full">
              <ChevronLeft size={20} />
            </Link>
            <p className="text-[10px] font-black uppercase tracking-[0.2em]">Scan Report</p>
            <div className="p-2 bg-white/10 rounded-full">
               <Share2 size={16} />
            </div>
          </div>

          <div className="mb-4 inline-flex flex-col items-center">
             <div className="text-7xl font-black tracking-tighter leading-none mb-1">{scan.safety_score}%</div>
             <p className="text-[10px] font-black uppercase tracking-widest opacity-70">Purity Score</p>
          </div>

          <h1 className="text-2xl font-black uppercase tracking-tighter mb-2">
            {scan.result_tier === 'safe' ? 'MILK IS SAFE' : 'ADULTERATION DETECTED'}
          </h1>
          <p className="text-xs font-medium opacity-80 max-w-[280px] mx-auto leading-relaxed">
            {scan.recommendation}
          </p>
        </div>
        <div className="absolute top-[-50px] right-[-50px] w-64 h-64 bg-white/10 rounded-full blur-[80px]" />
      </div>

      <main className="p-4 -mt-4 relative z-20 space-y-4 pb-12">
        {/* Info Card */}
        <Card className="rounded-3xl border-none shadow-lg">
          <CardContent className="p-5">
             <div className="flex justify-between items-start mb-4">
               <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
                    <Building2 size={20} className="text-slate-400" />
                 </div>
                 <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Source</p>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-slate-800 leading-none">{scan.vendors?.name || 'Home/Unlisted Sample'}</p>
                      {vendorTrust && (
                        <Badge className={cn("text-[8px] h-4 uppercase font-black px-1.5", vendorTrust.bg, vendorTrust.color)}>
                          {vendorTrust.label}
                        </Badge>
                      )}
                    </div>
                 </div>
               </div>
               <div className="text-right shrink-0">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Confidence</p>
                  <Badge variant="secondary" className="bg-blue-50 text-[#60A5FA] border-none font-black">{scan.ai_confidence}%</Badge>
               </div>
             </div>
             
             {scan.vendors && vendorTrust && (
               <>
                 <Separator className="mb-4 opacity-50" />
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                       <div>
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Trust Score</p>
                         <p className={cn("text-xl font-black leading-none", vendorTrust.color)}>{vendorTrust.score}</p>
                       </div>
                       <div>
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Comm. Reports</p>
                         <p className="text-sm font-bold text-slate-600 leading-none">{scan.vendors.report_count || 0}</p>
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
        <Card className="rounded-3xl border-none shadow-lg">
          <CardHeader className="p-5 pb-2">
            <CardTitle className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Blocks size={14} className="text-[#8247E5]" />
              Blockchain Record
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 pt-3">
            <BlockchainDetails txHash={scan.tx_hash ?? null} />
          </CardContent>
        </Card>

        {/* Spectral Chart */}
        <Card className="rounded-3xl border-none shadow-lg overflow-hidden">
          <CardHeader className="p-5 pb-0">
             <CardTitle className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
               <Activity size={14} className="text-[#60A5FA]" />
               Spectral Fingerprint
             </CardTitle>
          </CardHeader>
          <CardContent className="p-5 pt-0">
             <SpectralChart data={scan.wavelength_data} />
             <div className="mt-4 p-3 bg-slate-50 rounded-2xl flex items-center gap-3">
                <Info size={16} className="text-slate-400 shrink-0" />
                <p className="text-[10px] text-slate-500 font-medium leading-tight">
                  Our sensors analyzed 18 spectral channels. Spikes in the chart indicate deviations from the pure milk baseline.
                </p>
             </div>
          </CardContent>
        </Card>

        {/* Adulterant Breakdown */}
        <div className="space-y-3">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest px-2">Detailed Findings</h3>
          {scan.adulterant_results?.map((res: any) => (
            <Card key={res.id} className="rounded-2xl border-none shadow-sm overflow-hidden">
              <CardContent className="p-0">
                <div className="p-4 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center",
                      res.status === 'clear' ? "bg-blue-50 text-blue-400" : "bg-red-50 text-red-500"
                    )}>
                      {res.status === 'clear' ? <Shield size={16} /> : <AlertTriangle size={16} />}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 leading-none mb-1">{res.name}</p>
                      <p className="text-[10px] font-bold text-slate-400 tracking-wider">
                        {res.status === 'clear' ? 'NOT DETECTED' : `DETECTED: ${res.detected_value}${res.unit}`}
                      </p>
                    </div>
                  </div>
                  <ChevronDown size={16} className="text-slate-300" />
                </div>
                {res.detected && (
                  <div className="px-4 pb-4 pt-0">
                    <Separator className="mb-3 opacity-50" />
                    <p className="text-[10px] font-medium text-slate-600 leading-relaxed italic bg-amber-50 p-2 rounded-xl border border-amber-100/50 text-center">
                      "{res.analogy}"
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* AI Explanation */}
        <ExplainWithAI
          safetyScore={scan.safety_score}
          resultTier={scan.result_tier}
          recommendation={scan.recommendation}
          vendorName={scan.vendors?.name}
          aiConfidence={scan.ai_confidence}
          adulterantResults={scan.adulterant_results ?? []}
        />

        {/* FSSAI Notice & Report Generator */}
        <div className="space-y-3">
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

        <Button variant="ghost" className="w-full text-slate-400 font-bold text-[10px] uppercase tracking-widest print:hidden">
           Terms of Service & Regulatory Basis
        </Button>
      </main>
    </div>
  )
}
