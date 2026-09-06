'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import { 
  Search, 
  Filter, 
  TrendingUp, 
  CheckCircle2, 
  AlertTriangle, 
  ExternalLink 
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import HistoryTrendChart from '@/components/HistoryTrendChart'
import { useTranslation } from '@/lib/i18n/useTranslation'
import { cn } from '@/lib/utils'

interface HistoryClientProps {
  scans: any[]
  trendData: any[]
}

export function HistoryClient({ scans, trendData }: HistoryClientProps) {
  const { t } = useTranslation()
  const [search, setSearch] = useState('')
  const [filterTab, setFilterTab] = useState<'all' | 'safe' | 'adulterated'>('all')

  const filteredScans = useMemo(() => {
    return scans.filter(scan => {
      const isSafe = (scan.analysis_result || scan.result_tier) === 'safe'
      if (filterTab === 'safe' && !isSafe) return false
      if (filterTab === 'adulterated' && isSafe) return false

      if (!search.trim()) return true
      const q = search.toLowerCase()
      const vendor = (scan.vendors?.name || '').toLowerCase()
      const scanId = (scan.scan_id || scan.id || '').toLowerCase()
      return vendor.includes(q) || scanId.includes(q)
    })
  }, [scans, search, filterTab])

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#001d36] tracking-tight">
            {t('history_title', 'Test History & Analytics')}
          </h1>
          <p className="text-sm font-medium text-[#3e484f]">
            {t('history_desc', 'Track your family milk tests and purity trends across all samples')}
          </p>
        </div>

        {/* Search & Filter bar */}
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <div className="relative flex-1 sm:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6e7980]" size={16} />
            <Input 
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={t('search_history_ph', 'Search vendor, scan ID, or result...')} 
              className="pl-10 h-11 rounded-xl border-[#d1e4ff] bg-white text-xs font-semibold focus-visible:ring-[#00668a]" 
            />
          </div>

          <div className="flex items-center gap-1 bg-[#e5efff] p-1 rounded-xl border border-[#d1e4ff]">
            <button
              onClick={() => setFilterTab('all')}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                filterTab === 'all' ? "bg-white text-[#00668a] shadow-sm" : "text-[#51666d] hover:text-[#001d36]"
              )}
            >
              {t('tab_all', 'All Scans')}
            </button>
            <button
              onClick={() => setFilterTab('safe')}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                filterTab === 'safe' ? "bg-white text-[#137333] shadow-sm" : "text-[#51666d] hover:text-[#001d36]"
              )}
            >
              {t('tab_safe', 'Pure (Safe)')}
            </button>
            <button
              onClick={() => setFilterTab('adulterated')}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                filterTab === 'adulterated' ? "bg-white text-[#dc2626] shadow-sm" : "text-[#51666d] hover:text-[#001d36]"
              )}
            >
              {t('tab_adulterated', 'Adulterated')}
            </button>
          </div>
        </div>
      </div>

      {/* Trend Summary Card */}
      <Card className="rounded-2xl border border-[#c4e7ff] shadow-md bg-gradient-to-br from-[#00668a] to-[#004c69] text-white overflow-hidden relative">
        <CardHeader className="p-6 pb-2">
          <CardTitle className="text-xs font-bold uppercase tracking-wider text-[#c4e7ff] flex items-center gap-2">
            <TrendingUp size={16} className="text-[#30c5b3]" />
            <span>{t('purity_trends', '30-Day Milk Purity Trend')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <HistoryTrendChart data={trendData} />
        </CardContent>
      </Card>

      {/* Scan History Cards */}
      <div className="space-y-3">
        <div className="flex justify-between items-center px-1">
          <h2 className="text-sm font-bold text-[#001d36] uppercase tracking-wider">
            {t('tab_all', 'All Scans')} ({filteredScans.length})
          </h2>
          <span className="text-xs text-[#3e484f]">Sorted by most recent</span>
        </div>

        {filteredScans && filteredScans.length > 0 ? (
          filteredScans.map((scan) => {
            const displayScanId = scan.scan_id || (scan.id?.length > 15 ? `MG-${scan.id.slice(0, 8).toUpperCase()}` : scan.id)
            const deviceName = scan.devices?.device_name || (scan.devices?.device_uid ? `Hardware Pod (${scan.devices.device_uid})` : (scan.source_hardware_id ? `Hardware Pod (${scan.source_hardware_id})` : (scan.vendors?.name || 'MilkGuard Test Unit')))
            const isSafe = (scan.analysis_result || scan.result_tier) === 'safe'
            const score = scan.safety_score ?? (scan.analysis_confidence ? Math.round(Number(scan.analysis_confidence)) : 95)
            const txHash = scan.blockchain_tx_hash || scan.tx_hash
            const bStatus = scan.blockchain_status || (txHash ? 'confirmed' : 'pending')

            return (
              <Link href={`/history/${scan.id}`} key={scan.id} className="block group">
                <Card className="rounded-2xl border border-[#d1e4ff] bg-white p-4 sm:p-5 ambient-shadow hover:border-[#00668a] transition-all">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <div className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm",
                        isSafe ? "bg-[#dcfce7] text-[#16a34a]" : "bg-[#fee2e2] text-[#dc2626]"
                      )}>
                        {isSafe ? <CheckCircle2 size={24} /> : <AlertTriangle size={24} />}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-[#001d36] text-sm sm:text-base group-hover:text-[#00668a] transition-colors">
                            {displayScanId}
                          </span>
                          <Badge className={cn(
                            "border-none font-bold text-[10px] uppercase tracking-wider px-2 py-0.5",
                            isSafe ? "bg-[#e6f4ea] text-[#137333]" : "bg-[#fce8e6] text-[#c5221f]"
                          )}>
                            {isSafe ? t('pure_status', 'PURE') : t('adulterated_status', 'ADULTERATED')}
                          </Badge>
                        </div>

                        <p className="text-xs text-slate-500 font-medium mt-0.5">
                          {deviceName}
                        </p>

                        <p className="text-[11px] text-slate-400 font-medium">
                          {scan.created_at ? format(new Date(scan.created_at), 'PPP p') : 'Recent'}
                        </p>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                      <div className="text-right">
                        <span className="text-xs text-slate-400 font-bold block sm:inline mr-1">{t('overall_safety', 'Purity Score')}:</span>
                        <span className={cn(
                          "text-xl sm:text-2xl font-black",
                          isSafe ? "text-[#15803d]" : "text-[#dc2626]"
                        )}>
                          {score}%
                        </span>
                      </div>

                      {txHash && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#00668a] bg-[#e5efff] px-2 py-0.5 rounded-full mt-1">
                          <span>On-Chain</span>
                          <ExternalLink size={10} />
                        </span>
                      )}
                    </div>
                  </div>
                </Card>
              </Link>
            )
          })
        ) : (
          <div className="py-12 text-center bg-white rounded-2xl border border-dashed border-[#d1e4ff]">
            <p className="text-sm font-bold text-[#3e484f]">{t('no_scans_found', 'No matching test records found')}</p>
            <p className="text-xs text-[#6e7980] mt-1">{t('start_scan_to_analyze', 'Start a scan to analyze your milk purity')}</p>
          </div>
        )}
      </div>
    </div>
  )
}
