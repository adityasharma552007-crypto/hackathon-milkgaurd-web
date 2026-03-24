'use client'

import React from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'

interface HistoryTrendChartProps {
  data: any[]
}

export default function HistoryTrendChart({ data }: HistoryTrendChartProps) {
  return (
    <div className="h-40 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#F5A623" stopOpacity={0.4}/>
              <stop offset="95%" stopColor="#F5A623" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
          <XAxis 
            dataKey="date" 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 9, fontWeight: 'bold', fill: 'rgba(255,255,255,0.5)' }}
            interval={6} // Show every week
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            domain={[0, 100]}
            tick={{ fontSize: 9, fontWeight: 'bold', fill: 'rgba(255,255,255,0.5)' }}
          />
          <Tooltip 
            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '10px' }}
            cursor={{ stroke: 'rgba(255,255,255,0.2)' }}
            formatter={(value: number) => [`${Math.round(value)}%`, 'Score']}
          />
          <Area 
            connectNulls
            type="monotone" 
            dataKey="score" 
            stroke="#F5A623" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorScore)" 
            animationDuration={1500}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
