import { createClient } from "@/lib/supabase/server"
import { verifyPublicScan } from "@/lib/supabase/masterScanService"
import { Shield, CheckCircle2, ArrowUpRight, Search, ExternalLink, Calendar, Blocks, AlertTriangle, XCircle, Activity } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default async function VerifyPage({
  searchParams
}: {
  searchParams?: { tx?: string; scan_id?: string; query?: string }
}) {
  const supabase = createClient()
  const lookupQuery = (searchParams?.query || searchParams?.scan_id || searchParams?.tx || '').trim()

  let verificationResult: any = null
  if (lookupQuery) {
    try {
      verificationResult = await verifyPublicScan(lookupQuery)
    } catch (err: any) {
      verificationResult = { verified: false, reason: 'error', error: err.message }
    }
  }

  // Fetch recent scans that have tx_hash recorded on-chain
  const { data: onChainScans } = await supabase
    .from('scans')
    .select('*, vendors(name)')
    .not('tx_hash', 'is', null)
    .order('created_at', { ascending: false })
    .limit(10)

  // Fetch total on-chain count
  const { count: totalOnChain } = await supabase
    .from('scans')
    .select('id', { count: 'exact', head: true })
    .not('tx_hash', 'is', null)

  return (
    <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#e5efff] border border-[#c4e7ff] text-xs font-semibold text-[#00668a] mb-2">
            <span className="w-2 h-2 rounded-full bg-[#30c5b3] animate-pulse"></span>
            <span>Polygon Amoy Testnet · Live</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#001d36] tracking-tight">
            Blockchain Verification Engine
          </h1>
          <p className="text-sm font-medium text-[#3e484f]">
            Tamper-proof, cryptographically immutable registry of every milk purity test
          </p>
        </div>

        {/* Network Stats Pill */}
        <div className="bg-white border border-[#d1e4ff] rounded-2xl p-4 flex items-center gap-6 ambient-shadow">
          <div>
            <p className="text-xs font-semibold text-[#3e484f]">On-Chain Records</p>
            <p className="text-xl font-extrabold text-[#001d36]">{totalOnChain || (onChainScans?.length ?? 0)}</p>
          </div>
          <div className="w-px h-8 bg-[#d1e4ff]" />
          <div>
            <p className="text-xs font-semibold text-[#3e484f]">Network</p>
            <p className="text-sm font-bold text-[#00668a]">Polygon Amoy</p>
          </div>
        </div>
      </div>

      {/* Verification Lookup Tool */}
      <Card className="rounded-2xl border border-[#c4e7ff] bg-gradient-to-br from-[#00668a] to-[#004c69] text-white ambient-shadow overflow-hidden p-6">
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-bold">Verify Any Scan ID or Blockchain Hash</h2>
            <p className="text-xs text-[#c4e7ff] mt-0.5">Enter a MilkGuard scan ID (e.g. MG-20260904-A8F31C) or 66-character Polygon transaction hash</p>
          </div>

          <form action="/verify" method="GET" className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#3e484f]" size={16} />
              <input 
                name="query"
                defaultValue={lookupQuery}
                placeholder="Enter Scan ID (MG-...) or Tx Hash (0x...)" 
                className="w-full h-12 bg-white text-[#001d36] placeholder:text-[#6e7980] rounded-xl pl-10 pr-4 text-xs font-mono font-semibold focus:outline-none focus:ring-2 focus:ring-[#38bdf8]" 
              />
            </div>
            <Button type="submit" className="h-12 px-6 bg-[#30c5b3] hover:bg-[#28b0a0] text-[#004d44] font-extrabold rounded-xl flex items-center gap-1.5">
              <span>Verify</span>
              <ArrowUpRight size={16} />
            </Button>
          </form>
        </div>
      </Card>

      {/* Verification Result Display */}
      {lookupQuery && verificationResult && (
        <div className="space-y-4">
          {verificationResult.verified ? (
            <Card className="rounded-2xl border-2 border-emerald-500 bg-white ambient-shadow overflow-hidden p-6 space-y-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <CheckCircle2 size={28} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-base font-extrabold text-[#001d36]">CRYPTOGRAPHIC INTEGRITY VERIFIED</span>
                      <Badge className="bg-emerald-500 text-white font-bold text-[10px] uppercase">MATCH</Badge>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">Stored data matches the blockchain-anchored fingerprint perfectly.</p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-xs text-slate-400 font-bold uppercase">Public Scan ID</p>
                  <p className="font-mono font-extrabold text-sm text-[#00668a]">{verificationResult.scan_id}</p>
                </div>
              </div>

              {/* Technical Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                  <p className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">Hardware Origin & Timestamp</p>
                  <p><span className="text-slate-500">Device UID:</span> <span className="font-mono font-bold text-slate-800">{verificationResult.device_uid}</span></p>
                  <p><span className="text-slate-500">Device Name:</span> <span className="font-semibold text-slate-800">{verificationResult.device_name}</span></p>
                  <p><span className="text-slate-500">Scan Timestamp:</span> <span className="font-medium text-slate-800">{verificationResult.created_at ? format(new Date(verificationResult.created_at), 'PPP p') : 'Recent'}</span></p>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                  <p className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">AI Assessment & Confidence</p>
                  <p><span className="text-slate-500">Result:</span> <span className="font-bold uppercase text-slate-800">{verificationResult.analysis_result || 'SAFE'}</span></p>
                  <p><span className="text-slate-500">Confidence:</span> <span className="font-bold text-[#00668a]">{verificationResult.analysis_confidence}%</span></p>
                  <p className="text-slate-600 italic">"{verificationResult.analysis_summary}"</p>
                </div>
              </div>

              {/* 14 Sensor Signals Snapshot */}
              {verificationResult.sensor_readings && (
                <div className="space-y-2">
                  <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Authoritative 14 Hardware Sensor Readings
                  </p>
                  <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                    {Array.from({ length: 14 }, (_, i) => {
                      const key = `signal_${i < 9 ? '0' + (i + 1) : (i + 1)}`
                      const val = verificationResult.sensor_readings[key]
                      return (
                        <div key={key} className="bg-white p-2 rounded border border-slate-200 text-center">
                          <p className="text-[9px] font-mono font-bold text-slate-400">{key}</p>
                          <p className="text-xs font-mono font-extrabold text-slate-800 mt-0.5">
                            {typeof val === 'number' ? val.toFixed(4) : (val ?? '0.000')}
                          </p>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Blockchain & Hashes */}
              <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200 space-y-2 text-xs">
                <p className="font-bold text-emerald-800 uppercase tracking-wider text-[10px]">Cryptographic Proof</p>
                <div className="grid grid-cols-[120px_1fr] gap-2 font-mono text-[11px]">
                  <span className="text-emerald-700 font-bold">Canonical Hash:</span>
                  <span className="break-all font-bold text-slate-900">{verificationResult.computed_data_hash}</span>
                  
                  <span className="text-emerald-700 font-bold">Polygon Tx Hash:</span>
                  <span className="break-all font-bold text-slate-900">{verificationResult.blockchain_tx_hash || 'Pending validation'}</span>
                </div>
                {verificationResult.blockchain_tx_hash && (
                  <div className="pt-2">
                    <a
                      href={`https://amoy.polygonscan.com/tx/${verificationResult.blockchain_tx_hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#00668a] hover:underline"
                    >
                      <span>Audit on Polygonscan Explorer</span>
                      <ExternalLink size={12} />
                    </a>
                  </div>
                )}
              </div>
            </Card>
          ) : (
            <Card className="rounded-2xl border-2 border-red-400 bg-red-50/50 ambient-shadow p-6 space-y-3 text-red-900">
              <div className="flex items-center gap-3">
                <XCircle size={28} className="text-red-600 shrink-0" />
                <div>
                  <h3 className="font-extrabold text-base">
                    {verificationResult.reason === 'hash_mismatch' ? 'DATA INTEGRITY MISMATCH' : 'SCAN NOT FOUND'}
                  </h3>
                  <p className="text-xs text-red-700 mt-0.5">
                    {verificationResult.reason === 'hash_mismatch' 
                      ? 'The stored sensor data does not match the blockchain-anchored cryptographic fingerprint! Possible data tampering detected.'
                      : 'No verification record exists for the provided identifier. Check the scan ID and try again.'}
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Audit Flow Timeline Card */}
      <Card className="rounded-2xl border border-[#d1e4ff] bg-white ambient-shadow p-6">
        <h3 className="text-base font-bold text-[#001d36] mb-4 flex items-center gap-2">
          <Blocks size={20} className="text-[#00668a]" />
          <span>How MilkGuard Cryptographic Trust Works</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
          <div className="p-4 bg-[#f8f9ff] rounded-xl border border-[#d1e4ff] flex flex-col gap-2">
            <div className="w-8 h-8 rounded-full bg-[#c4e7ff] text-[#00668a] font-extrabold flex items-center justify-center text-sm">1</div>
            <p className="font-bold text-[#001d36] text-xs">Spectral Capture</p>
            <p className="text-[11px] text-[#3e484f]">NIR sensor captures 18-wavelength fingerprint of milk sample.</p>
          </div>

          <div className="p-4 bg-[#f8f9ff] rounded-xl border border-[#d1e4ff] flex flex-col gap-2">
            <div className="w-8 h-8 rounded-full bg-[#c4e7ff] text-[#00668a] font-extrabold flex items-center justify-center text-sm">2</div>
            <p className="font-bold text-[#001d36] text-xs">AI Inference</p>
            <p className="text-[11px] text-[#3e484f]">AI computes purity score, adulterant findings, and trust index.</p>
          </div>

          <div className="p-4 bg-[#f8f9ff] rounded-xl border border-[#d1e4ff] flex flex-col gap-2">
            <div className="w-8 h-8 rounded-full bg-[#c4e7ff] text-[#00668a] font-extrabold flex items-center justify-center text-sm">3</div>
            <p className="font-bold text-[#001d36] text-xs">SHA-256 Encryption</p>
            <p className="text-[11px] text-[#3e484f]">Test report payload is hashed cryptographically before submission.</p>
          </div>

          <div className="p-4 bg-[#f8f9ff] rounded-xl border border-[#d1e4ff] flex flex-col gap-2">
            <div className="w-8 h-8 rounded-full bg-[#30c5b3]/20 text-[#006b5f] font-extrabold flex items-center justify-center text-sm">4</div>
            <p className="font-bold text-[#001d36] text-xs">Polygon Contract</p>
            <p className="text-[11px] text-[#3e484f]">Smart contract permanently logs proof on Polygon blockchain.</p>
          </div>
        </div>
      </Card>

      {/* Recent On-Chain Scans */}
      <div className="space-y-3">
        <h3 className="text-base font-bold text-[#001d36]">Recent Immutable Records</h3>

        {onChainScans && onChainScans.length > 0 ? (
          onChainScans.map((scan) => (
            <Card key={scan.id} className="rounded-2xl border border-[#d1e4ff] bg-white ambient-shadow hover:border-[#00668a] transition-all p-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#30c5b3]/15 text-[#006b5f] flex items-center justify-center">
                    <CheckCircle2 size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-[#001d36] text-sm">
                      {scan.vendors?.name || 'Home Sample'} · <span className="text-[#00668a]">{scan.safety_score}% Purity</span>
                    </p>
                    <p className="text-xs font-mono text-[#6e7980] truncate max-w-xs md:max-w-md">
                      Tx: {scan.tx_hash}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                  <span className="text-xs text-[#3e484f] font-medium">
                    {format(new Date(scan.created_at), 'MMM dd, hh:mm a')}
                  </span>

                  <a
                    href={`https://amoy.polygonscan.com/tx/${scan.tx_hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold bg-[#e5efff] text-[#00668a] hover:bg-[#c4e7ff] transition-colors border border-[#c4e7ff]"
                  >
                    <span>View on Polygon</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <div className="py-12 text-center bg-white rounded-2xl border border-dashed border-[#d1e4ff]">
            <p className="text-sm font-bold text-[#3e484f]">No on-chain records found</p>
            <p className="text-xs text-[#6e7980] mt-1">Run a scan to publish your first immutable test result to Polygon.</p>
          </div>
        )}
      </div>
    </div>
  )
}
