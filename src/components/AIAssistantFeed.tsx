'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2, AlertTriangle, CheckCircle, Info, Activity, TrendingUp, TrendingDown, ShieldAlert, ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils'

const ICONS: Record<string, any> = {
  AlertTriangle,
  CheckCircle,
  Info,
  Activity,
  TrendUp: TrendingUp,
  TrendDown: TrendingDown,
  ShieldAlert,
  ShieldCheck,
  warning: AlertTriangle,
  success: CheckCircle,
  info: Info
}

interface AIAssistantFeedProps {
  contextData: any
}

export default function AIAssistantFeed({ contextData }: AIAssistantFeedProps) {
  const [insights, setInsights] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchInsights = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ context: contextData })
      })
      if (!res.ok) throw new Error('Network error')
      const data = await res.json()
      if (Array.isArray(data)) setInsights(data)
    } catch (err) {
      console.error("Failed to load insights:", err)
      setInsights([{ insight: "Failed to connect to AI engine. Please retry.", type: "warning", icon: "AlertTriangle" }])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchInsights()
    // Expose refresh function to parent if needed, or we just rely on parent key-remount 
  }, [contextData])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
         {[1, 2, 3, 4].map(i => (
           <Card key={i} className="border-none shadow-sm rounded-2xl animate-pulse bg-white">
             <CardContent className="p-5 flex gap-4 h-[88px]">
                <div className="w-10 h-10 rounded-xl bg-slate-100 shrink-0" />
                <div className="flex-1 space-y-2 py-1">
                   <div className="h-3 bg-slate-100 rounded w-full" />
                   <div className="h-3 bg-slate-100 rounded w-2/3" />
                </div>
             </CardContent>
           </Card>
         ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {insights.map((item, idx) => {
        const IconNode = ICONS[item.icon] || ICONS[item.type] || Info
        const isWarning = item.type === 'warning'
        const isSuccess = item.type === 'success'

        return (
          <Card key={idx} className="border-none shadow-sm rounded-2xl bg-white overflow-hidden group hover:shadow-md transition-shadow">
            <CardContent className="p-5 flex items-start gap-4">
               <div className={cn(
                 "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors",
                 isWarning ? "bg-red-50 text-red-500 group-hover:bg-red-100" :
                 isSuccess ? "bg-emerald-50 text-emerald-500 group-hover:bg-emerald-100" :
                 "bg-blue-50 text-[#60A5FA] group-hover:bg-blue-100"
               )}>
                  <IconNode size={20} />
               </div>
               <p className="text-sm font-bold text-slate-700 leading-tight pt-1">
                  {item.insight}
               </p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
