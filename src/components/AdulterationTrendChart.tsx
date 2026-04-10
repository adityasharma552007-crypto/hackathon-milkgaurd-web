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
  ReferenceLine
} from 'recharts'

interface AdulterationTrendChartProps {
  data: { date: string; score: number }[]
}

const CustomDot = (props: any) => {
  const { cx, cy, payload } = props;
  const isHighRisk = payload.score > 50;

  return (
    <circle 
      cx={cx} 
      cy={cy} 
      r={4} 
      stroke={isHighRisk ? "#EF4444" : "#60A5FA"} 
      strokeWidth={2} 
      fill="#fff" 
    />
  );
};

export default function AdulterationTrendChart({ data }: AdulterationTrendChartProps) {
  return (
    <div className="h-48 w-full -ml-3">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis 
            dataKey="date" 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10, fontWeight: 'bold', fill: '#94a3b8' }}
            dy={10}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            domain={[0, 100]}
            tick={{ fontSize: 10, fontWeight: 'bold', fill: '#94a3b8' }}
          />
          <Tooltip 
            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '11px', fontWeight: 'bold', padding: '8px 12px' }}
            cursor={{ stroke: '#e2e8f0', strokeWidth: 2, strokeDasharray: '3 3' }}
            formatter={(value: number) => [`${Math.round(value)}%`, 'Adulteration Score']}
          />
          <ReferenceLine 
            y={50} 
            stroke="#ef4444" 
            strokeDasharray="4 4" 
            label={{ position: 'top', value: 'Safety Threshold', fill: '#ef4444', fontSize: 9, fontWeight: 'black', textAnchor: 'start', dx: -55, dy: -5 }} 
          />
          <Line 
            type="monotone" 
            dataKey="score" 
            stroke="#60A5FA" 
            strokeWidth={3}
            dot={<CustomDot />}
            activeDot={{ r: 6, strokeWidth: 0 }}
            animationDuration={1500}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
