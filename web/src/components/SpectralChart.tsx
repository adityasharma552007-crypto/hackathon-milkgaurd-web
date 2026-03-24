'use client'

import React from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts'

interface SpectralChartProps {
  data: any[]
}

export default function SpectralChart({ data }: SpectralChartProps) {
  return (
    <div className="h-64 w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorReading" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#1A6B4A" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#1A6B4A" stopOpacity={0}/>
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
            stroke="#1A6B4A" 
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
