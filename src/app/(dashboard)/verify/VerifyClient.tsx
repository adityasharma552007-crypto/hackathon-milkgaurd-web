'use client'

import React from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Shield, 
  CheckCircle2, 
  ArrowUpRight, 
  Search, 
  ExternalLink, 
  Calendar, 
  Blocks, 
  AlertTriangle, 
  XCircle, 
  Activity 
} from 'lucide-react'
import { useTranslation } from '@/lib/i18n/useTranslation'

interface VerifyClientProps {
  lookupQuery: string
  verificationResult: any
  onChainScans: any[] | null
  totalOnChain: number | null
}

export function VerifyClient({
  lookupQuery,
  verificationResult,
  onChainScans,
  totalOnChain,
}: VerifyClientProps) {
  const { t } = useTranslation()

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
            {t('verify_title', 'Blockchain Verification Engine')}
          </h1>
          <p className="text-sm font-medium text-[#3e484f]">
            {t('verify_desc', 'Tamper-proof, cryptographically immutable registry of every milk purity test')}
          </p>
        </div>

        {/* Network Stats Pill */}
        <div className="bg-white border border-[#d1e4ff] rounded-2xl p-4 flex items-center gap-6 ambient-shadow">
          <div>
            <p className="text-xs font-semibold text-[#3e484f]">{t('onchain_records', 'On-Chain Records')}</p>
            <p className="text-xl font-extrabold text-[#001d36]">{totalOnChain || (onChainScans?.length ?? 0)}</p>
          </div>
          <div className="w-px h-8 bg-[#d1e4ff]" />
          <div>
            <p className="text-xs font-semibold text-[#3e484f]">{t('network', 'Network')}</p>
            <p className="text-sm font-bold text-[#00668a]">Polygon Amoy</p>
          </div>
        </div>
      </div>

      {/* Verification Lookup Tool */}
      <Card className="rounded-2xl border border-[#c4e7ff] bg-gradient-to-br from-[#00668a] to-[#004c69] text-white ambient-shadow overflow-hidden p-6">
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-bold">{t('verify_box_title', 'Verify Any Scan ID or Blockchain Hash')}</h2>
            <p className="text-xs text-[#c4e7ff] mt-0.5">{t('verify_box_desc', 'Enter a MilkGuard scan ID (e.g. MG-20260904-A8F31C) or 66-character Polygon transaction hash')}</p>
          </div>

          <form action="/verify" method="GET" className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#3e484f]" size={16} />
              <input 
                name="query"
                defaultValue={lookupQuery}
                placeholder={t('verify_input_ph', 'Enter Scan ID (MG-...) or Tx Hash (0x...)')} 
                className="w-full h-12 bg-white text-[#001d36] placeholder:text-[#6e7980] rounded-xl pl-10 pr-4 text-xs font-mono font-semibold focus:outline-none focus:ring-2 focus:ring-[#38bdf8]" 
              />
            </div>
            <Button type="submit" className="h-12 px-6 bg-[#30c5b3] hover:bg-[#28b0a0] text-[#004d44] font-extrabold rounded-xl flex items-center gap-1.5">
              <span>{t('btn_verify', 'Verify')}</span>
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
                      <span className="font-extrabold text-lg text-[#001d36]">Cryptographically Verified</span>
                      <Badge className="bg-emerald-100 text-emerald-800 border-none font-bold text-xs">IMMUTABLE</Badge>
                    </div>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">Matched authentic record on Polygon Amoy blockchain</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs text-slate-400 font-semibold block">Safety Score</span>
                  <span className="text-3xl font-black text-[#00668a]">{verificationResult.scan?.safety_score}%</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-slate-400 font-bold block mb-1">SCAN ID</span>
                  <span className="font-mono font-bold text-[#001d36] break-all">{verificationResult.scan?.id}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-slate-400 font-bold block mb-1">RESULT TIER</span>
                  <span className="font-bold uppercase text-emerald-700">{verificationResult.scan?.result_tier}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-slate-400 font-bold block mb-1">TESTED ON</span>
                  <span className="font-medium text-[#001d36]">
                    {verificationResult.scan?.created_at ? format(new Date(verificationResult.scan.created_at), 'PPP pp') : 'N/A'}
                  </span>
                </div>
              </div>

              {verificationResult.scan?.tx_hash && (
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-3.5 bg-blue-50/60 rounded-xl border border-blue-100">
                  <div className="truncate max-w-lg">
                    <span className="text-xs font-bold text-blue-900 block">Polygon Transaction Hash:</span>
                    <span className="text-xs font-mono text-blue-700 truncate">{verificationResult.scan.tx_hash}</span>
                  </div>
                  <a 
                    href={`https://amoy.polygonscan.com/tx/${verificationResult.scan.tx_hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#00668a] hover:underline shrink-0"
                  >
                    <span>View on PolygonScan</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              )}
            </Card>
          ) : (
            <Card className="rounded-2xl border-2 border-red-300 bg-white ambient-shadow p-6 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-red-100 text-red-700 flex items-center justify-center shrink-0">
                  <XCircle size={28} />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-[#001d36]">Verification Failed / Not Found</h3>
                  <p className="text-xs text-slate-500">The query '{lookupQuery}' does not match any authenticated records on our database or Polygon ledger.</p>
                </div>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Explainer: How Blockchain Verification Works */}
      <Card className="rounded-2xl border border-[#d1e4ff] bg-white ambient-shadow p-6 space-y-4">
        <h3 className="font-extrabold text-base text-[#001d36]">How MilkGuard Blockchain Verification Works</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-[#f8f9ff] rounded-xl border border-[#d1e4ff] flex flex-col gap-2">
            <div className="w-8 h-8 rounded-full bg-[#c4e7ff] text-[#00668a] font-extrabold flex items-center justify-center text-sm">1</div>
            <p className="font-bold text-[#001d36] text-xs">Spectroscopy Scan</p>
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
        <h3 className="text-base font-bold text-[#001d36]">
          {t('recent_onchain', 'Recent On-Chain Blockchain Scans')}
        </h3>

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
