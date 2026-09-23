'use client'

import React, { useState, useEffect, useMemo } from 'react'
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts'

interface SpectralChartProps {
  data?: any[]
}

const DEFAULT_WAVELENGTHS = [415, 445, 480, 515, 555, 590, 630, 680, 720, 760, 810, 860, 900, 940]
const DEFAULT_BASELINE = [0.52, 0.61, 0.74, 0.78, 0.80, 0.76, 0.70, 0.63, 0.58, 0.52, 0.45, 0.40, 0.35, 0.30]

export default function SpectralChart({ data }: SpectralChartProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const chartData = useMemo(() => {
    if (!Array.isArray(data) || data.length === 0) {
      return DEFAULT_WAVELENGTHS.map((wl, idx) => ({
        wavelength: wl,
        reading: DEFAULT_BASELINE[idx] || 0.5,
        baseline: DEFAULT_BASELINE[idx] || 0.5,
      }))
    }

    return data.map((item, idx) => {
      if (typeof item === 'number') {
        const base = DEFAULT_BASELINE[idx] ?? item
        return {
          wavelength: DEFAULT_WAVELENGTHS[idx] ?? (400 + idx * 40),
          reading: Number(item.toFixed ? item.toFixed(3) : item),
          baseline: Number(base.toFixed ? base.toFixed(3) : base),
        }
      }
      if (typeof item === 'object' && item !== null) {
        const wl = item.wavelength ?? DEFAULT_WAVELENGTHS[idx] ?? (400 + idx * 40)
        const reading = Number(item.reading ?? item.val ?? item.value ?? 0.5)
        const baseline = Number(item.baseline ?? DEFAULT_BASELINE[idx] ?? reading)
        return {
          wavelength: wl,
          reading: isNaN(reading) ? 0.5 : reading,
          baseline: isNaN(baseline) ? 0.5 : baseline,
        }
      }
      return {
        wavelength: DEFAULT_WAVELENGTHS[idx] ?? (400 + idx * 40),
        reading: 0.5,
        baseline: 0.5,
      }
    })
  }, [data])

  if (!mounted) {
    return (
      <div className="h-64 w-full mt-4 bg-slate-50/60 rounded-2xl flex items-center justify-center animate-pulse">
        <span className="text-xs font-bold text-slate-400">Loading spectral fingerprint...</span>
      </div>
    )
  }

  return (
    <div className="h-64 w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorReading" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#60A5FA" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#60A5FA" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorBaseline" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.1}/>
              <stop offset="95%" stopColor="#94a3b8" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis 
            dataKey="wavelength" 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10, fontWeight: 'bold', fill: '#94a3b8' }}
            tickFormatter={(val) => `${val}nm`}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10, fontWeight: 'bold', fill: '#94a3b8' }}
          />
          <Tooltip 
            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
            itemStyle={{ fontWeight: 'bold' }}
          />
          <Area 
            type="monotone" 
            dataKey="reading" 
            name="Sample"
            stroke="#60A5FA" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorReading)" 
          />
          <Area 
            type="monotone" 
            dataKey="baseline" 
            name="Pure Baseline"
            stroke="#94a3b8" 
            strokeWidth={2}
            strokeDasharray="5 5"
            fillOpacity={1} 
            fill="url(#colorBaseline)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

