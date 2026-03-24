'use client'

import React, { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Shield, AlertTriangle, Star, Navigation } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

// Fix for default Leaflet markers in Next.js
const customIcon = (tier: string) => {
  const color = tier === 'safe' ? '#1A6B4A' : tier === 'warning' ? '#F5A623' : '#EF4444'
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
}

function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap()
  map.setView(center)
  return null
}

export default function VendorMap({ vendors }: VendorMapProps) {
  const [isMounted, setIsMounted] = useState(false)
  const defaultCenter: [number, number] = [26.9124, 75.7873] // Jaipur

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) return <div className="w-full h-full bg-slate-100 animate-pulse rounded-3xl" />

  return (
    <div className="w-full h-full relative rounded-3xl overflow-hidden shadow-2xl">
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
        
        {vendors.map((vendor) => (
          <Marker 
            key={vendor.id} 
            {...({
              position: [vendor.latitude, vendor.longitude],
              icon: customIcon(vendor.safety_tier)
            } as any)}
          >
            <Popup {...({ className: "custom-popup" } as any)}>
              <div className="w-48 p-1">
                <div className="flex justify-between items-start mb-2">
                   <h3 className="font-black text-slate-800 text-sm">{vendor.name}</h3>
                   <Badge className={cn(
                     "text-[8px] h-4 uppercase font-black",
                     vendor.safety_tier === 'safe' ? "bg-green-100 text-[#1A6B4A]" : "bg-red-100 text-red-500"
                   )}>
                     {vendor.safety_tier}
                   </Badge>
                </div>
                <div className="space-y-2">
                   <div className="flex items-center gap-2">
                      <div className="text-xl font-black text-slate-800">{vendor.safety_score}%</div>
                      <div className="text-[8px] font-bold text-slate-400 uppercase">Avg Purity</div>
                   </div>
                   <div className="flex items-center justify-between text-[10px] font-bold text-slate-500">
                      <div className="flex items-center gap-1">
                         <Star size={10} className="fill-[#F5A623] text-[#F5A623]" />
                         {vendor.rating}
                      </div>
                      <div>{vendor.total_scans} SCANS</div>
                   </div>
                   <button className="w-full h-8 bg-[#1A6B4A] text-white rounded-lg text-xs font-bold uppercase tracking-tighter mt-1">
                      View Profile
                   </button>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Map Controls Floating Overlay */}
      <div className="absolute top-4 right-4 z-[1000] space-y-2">
         <button className="w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center text-[#1A6B4A]">
            <Navigation size={18} />
         </button>
      </div>

      <div className="absolute bottom-4 left-4 right-4 z-[1000]">
         <Card className="rounded-2xl border-none shadow-xl bg-white/90 backdrop-blur-md">
            <CardContent className="p-4 flex items-center justify-between">
               <div className="flex gap-4">
                  <div className="flex items-center gap-1">
                     <div className="w-3 h-3 bg-[#1A6B4A] rounded-full" />
                     <span className="text-[9px] font-black uppercase text-slate-500">Safe</span>
                  </div>
                  <div className="flex items-center gap-1">
                     <div className="w-3 h-3 bg-[#F5A623] rounded-full" />
                     <span className="text-[9px] font-black uppercase text-slate-500">Watch</span>
                  </div>
                  <div className="flex items-center gap-1">
                     <div className="w-3 h-3 bg-red-500 rounded-full" />
                     <span className="text-[9px] font-black uppercase text-slate-500">Danger</span>
                  </div>
               </div>
               <p className="text-[9px] font-bold text-[#1A6B4A] uppercase italic underline underline-offset-2">Filter By Tier</p>
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
