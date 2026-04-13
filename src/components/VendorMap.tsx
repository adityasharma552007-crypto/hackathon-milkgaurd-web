'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet.heat'
import { Shield, AlertTriangle, Star, Navigation, Map as MapIcon, Users, Layers, Users2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import ReportVendorButton from '@/components/ReportVendorButton'

// Fix for default Leaflet markers in Next.js
const customIcon = (tier: string) => {
  const color = tier === 'safe' ? '#60A5FA' : tier === 'warning' ? '#F5A623' : '#EF4444'
  return L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="background-color: ${color}; width: 30px; height: 30px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); display: flex; items-center; justify-content: center;">
             <div style="width: 10px; height: 10px; background: white; border-radius: 50%;"></div>
           </div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15]
  })
}

interface VendorMapProps {
  vendors: any[]
  scans?: any[]
  cityName?: string
  flaggedOnly?: boolean
}

type ViewMode = 'vendors' | 'heatmap' | 'both';

function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap()
  map.setView(center)
  return null
}

function HeatmapLayer({ points, viewMode }: { points: any[], viewMode: ViewMode }) {
  const map = useMap()

  useEffect(() => {
    if (viewMode === 'vendors' || !points.length) return;

    // Map the scans into Leaflet heat points format: [lat, lng, intensity]
    // Intensity defines weight. 0.0 - 1.0 (Low to high adulteration risk)
    const heatPoints = points.map(p => [
      p.latitude, 
      p.longitude, 
      (p.adulteration_score || 0) / 100
    ])
    
    // Add heat layer
    const heat = (L as any).heatLayer(heatPoints, {
      radius: 25,
      blur: 15,
      maxZoom: 14,
      gradient: {
        0.3: '#10B981', // green for low risk
        0.6: '#F5A623', // orange for medium risk
        1.0: '#EF4444'  // red for high risk
      }
    }).addTo(map)

    return () => {
      map.removeLayer(heat)
    }
  }, [map, points, viewMode])

  return null
}

export default function VendorMap({ vendors, scans = [], cityName = 'Jaipur', flaggedOnly = false }: VendorMapProps) {
  const [isMounted, setIsMounted] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>('both')
  const defaultCenter: [number, number] = [26.9124, 75.7873] // Jaipur

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) return <div className="w-full h-full bg-slate-100 animate-pulse rounded-3xl" />

  function getTrustScoreDetails(avgScore: number, reportCount: number) {
    const trustScore = Math.round((avgScore * 0.6) + Math.max(0, 40 - (reportCount * 5)))
    if (trustScore >= 80) return { score: trustScore, label: 'Trusted', color: 'text-emerald-500', bg: 'bg-emerald-50' }
    if (trustScore >= 50) return { score: trustScore, label: 'Moderate', color: 'text-amber-500', bg: 'bg-amber-50' }
    return { score: trustScore, label: 'Flagged', color: 'text-red-500', bg: 'bg-red-50' }
  }

  return (
    <div className="w-full h-full relative rounded-3xl overflow-hidden shadow-2xl flex flex-col">
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] flex bg-white/90 backdrop-blur-md rounded-full shadow-lg p-1 border border-slate-100">
        <button
          onClick={() => setViewMode('vendors')}
          className={cn(
            "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all gap-1.5 flex items-center",
            viewMode === 'vendors' ? "bg-slate-800 text-white shadow-md" : "text-slate-500 hover:bg-slate-100"
          )}
        >
          <Users size={12} /> Vendors
        </button>
        <button
          onClick={() => setViewMode('heatmap')}
          className={cn(
            "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all gap-1.5 flex items-center",
            viewMode === 'heatmap' ? "bg-red-500 text-white shadow-md" : "text-slate-500 hover:bg-slate-100"
          )}
        >
          <MapIcon size={12} /> Heatmap
        </button>
        <button
          onClick={() => setViewMode('both')}
          className={cn(
            "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all gap-1.5 flex items-center",
            viewMode === 'both' ? "bg-[#60A5FA] text-white shadow-md" : "text-slate-500 hover:bg-slate-100"
          )}
        >
          <Layers size={12} /> Both
        </button>
      </div>
      <MapContainer 
        {...({
          center: defaultCenter, 
          zoom: 13, 
          scrollWheelZoom: false,
          className: "w-full h-full",
          zoomControl: false
        } as any)}
      >
        <TileLayer
          {...({
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
            className: "grayscale brightness-105 contrast-90"
          } as any)}
        />
        
        <HeatmapLayer points={scans} viewMode={viewMode} />
        
        {viewMode !== 'heatmap' && vendors.filter((v: any) => (v.latitude || v.lat) && (v.longitude || v.lng)).filter((v: any) => !flaggedOnly || v.is_flagged || getTrustScoreDetails(v.avg_score || 0, v.report_count || 0).score < 50).map((vendor: any) => {
          const trust = getTrustScoreDetails(vendor.avg_score || 0, vendor.report_count || 0)
          const iconTier = trust.score >= 80 ? 'safe' : trust.score >= 50 ? 'warning' : 'danger'

          return (
            <Marker 
              key={vendor.id} 
              {...({
                position: [vendor.latitude || vendor.lat, vendor.longitude || vendor.lng],
                icon: customIcon(iconTier)
              } as any)}
            >
              <Popup {...({ className: "custom-popup" } as any)}>
                <div className="w-52 p-1">
                  <div className="flex justify-between items-start mb-3">
                     <Link href={`/vendors/${vendor.id}`}>
                       <h3 className="font-black text-slate-800 text-sm max-w-[120px] leading-tight shrink-0 hover:text-[#60A5FA] cursor-pointer transition-colors underline underline-offset-4">{vendor.name}</h3>
                     </Link>
                     <Badge className={cn("text-[8px] h-5 uppercase font-black shrink-0", trust.bg, trust.color)}>
                       {trust.label}
                     </Badge>
                  </div>
                  <div className="space-y-3">
                     <div className="flex items-center justify-between bg-slate-50 p-2 rounded-xl">
                        <div className="flex items-center gap-2">
                           <div className={cn("text-2xl font-black leading-none", trust.color)}>{trust.score}</div>
                           <div className="text-[8px] font-bold text-slate-400 uppercase leading-tight">Trust<br/>Score</div>
                        </div>
                        <div className="text-right">
                           <div className="text-[10px] font-black text-slate-600">{Math.round(vendor.avg_score || 0)}% Purity</div>
                           <div className="text-[8px] font-bold text-slate-400 uppercase">{vendor.total_scans || 0} Scans</div>
                        </div>
                     </div>
                     
                     <div className="flex items-center justify-between pt-1">
                        <div className="text-[9px] font-black text-slate-400 flex items-center gap-1 uppercase">
                           <Users2 size={12} className="text-slate-300" />
                           {vendor.report_count || 0} Reports
                        </div>
                        <ReportVendorButton vendorId={vendor.id} vendorName={vendor.name} />
                     </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          )
        })}
      </MapContainer>

      {/* Map Controls Floating Overlay */}
      <div className="absolute top-4 right-4 z-[1000] space-y-2">
         <button className="w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center text-[#60A5FA]">
            <Navigation size={18} />
         </button>
      </div>

      <div className="absolute bottom-4 left-4 z-[1000]">
         <Card className="rounded-2xl border-none shadow-xl bg-white/90 backdrop-blur-md">
            <CardContent className="p-3">
               <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 border-b border-slate-100 pb-1 w-full text-center">
                 {viewMode === 'vendors' ? 'Vendor Filter' : 'Risk Legend'}
               </p>
               
               {viewMode === 'vendors' ? (
                 <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                       <div className="w-3 h-3 bg-[#60A5FA] rounded-full ring-2 ring-[#60A5FA]/20" />
                       <span className="text-[9px] font-black uppercase text-slate-600">Safe Vendors</span>
                    </div>
                    <div className="flex items-center gap-2">
                       <div className="w-3 h-3 bg-[#F5A623] rounded-full ring-2 ring-[#F5A623]/20" />
                       <span className="text-[9px] font-black uppercase text-slate-600">Warning Area</span>
                    </div>
                    <div className="flex items-center gap-2">
                       <div className="w-3 h-3 bg-red-500 rounded-full ring-2 ring-red-500/20" />
                       <span className="text-[9px] font-black uppercase text-slate-600">Danger Zone</span>
                    </div>
                 </div>
               ) : (
                 <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                       <div className="w-3 h-3 bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                       <span className="text-[9px] font-black uppercase text-slate-600">High Risk Area</span>
                    </div>
                    <div className="flex items-center gap-2">
                       <div className="w-3 h-3 bg-[#F5A623] rounded-full shadow-[0_0_8px_rgba(245,166,35,0.5)]" />
                       <span className="text-[9px] font-black uppercase text-slate-600">Medium Risk Area</span>
                    </div>
                    <div className="flex items-center gap-2">
                       <div className="w-3 h-3 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                       <span className="text-[9px] font-black uppercase text-slate-600">Safe Area</span>
                    </div>
                 </div>
               )}
            </CardContent>
         </Card>
      </div>
      
      <style jsx global>{`
        .leaflet-popup-content-wrapper {
          border-radius: 20px !important;
          padding: 0 !important;
          overflow: hidden;
        }
        .leaflet-popup-content {
          margin: 0 !important;
        }
        .grayscale {
          filter: grayscale(100%);
        }
      `}</style>
    </div>
  )
}
