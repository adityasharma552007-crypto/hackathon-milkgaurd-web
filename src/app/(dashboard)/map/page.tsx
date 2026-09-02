import { createClient } from "@/lib/supabase/server"
import { Search, MapPin, SlidersHorizontal, ChevronLeft } from "lucide-react"
import Link from "next/link"
import dynamic from "next/dynamic"

// Dynamic import for Leaflet (Client-side only)
const VendorMap = dynamic(() => import("@/components/VendorMap"), { 
  ssr: false,
  loading: () => <div className="w-full h-full bg-slate-100 animate-pulse rounded-3xl flex items-center justify-center font-black text-slate-300 uppercase tracking-widest">Loading Jaipur Map...</div>
})

import { cookies } from "next/headers"

const DEFAULT_VENDORS = [
  { id: 'v1', name: 'Amul Dairy Booth #104', latitude: 26.9124, longitude: 75.7873, avg_score: 95, report_count: 0, is_flagged: false, total_scans: 42, city: 'Jaipur' },
  { id: 'v2', name: 'Saras Milk Outlet', latitude: 26.9000, longitude: 75.8000, avg_score: 88, report_count: 1, is_flagged: false, total_scans: 29, city: 'Jaipur' },
  { id: 'v3', name: 'Rawat Local Dairy', latitude: 26.9200, longitude: 75.7700, avg_score: 42, report_count: 5, is_flagged: true, total_scans: 18, city: 'Jaipur' },
  { id: 'v4', name: 'Jaipur Fresh Milk Depot', latitude: 26.8800, longitude: 75.8100, avg_score: 91, report_count: 0, is_flagged: false, total_scans: 35, city: 'Jaipur' },
]

const DEFAULT_SCANS = [
  { latitude: 26.9200, longitude: 75.7700, adulteration_score: 85 },
  { latitude: 26.9124, longitude: 75.7873, adulteration_score: 10 },
  { latitude: 26.9000, longitude: 75.8000, adulteration_score: 25 },
]

export default async function MapPage({ searchParams }: { searchParams: { filter?: string } }) {
  const cookieStore = cookies()
  const isDemo = cookieStore.get('mg_demo_session')?.value === 'true'

  let cityName = 'Jaipur'
  let vendors: any[] = DEFAULT_VENDORS
  let scans: any[] = DEFAULT_SCANS

  if (!isDemo) {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase.from('profiles').select('city').eq('id', user.id).single()
        if (profile?.city) cityName = profile.city
      }
      const [{ data: vData }, { data: sData }] = await Promise.all([
        supabase.from('vendors').select('*').order('avg_score', { ascending: false }),
        supabase.from('scans').select('latitude, longitude, adulteration_score').not('latitude', 'is', null).not('longitude', 'is', null)
      ])
      if (vData && vData.length > 0) vendors = vData
      if (sData && sData.length > 0) scans = sData
    } catch {
      vendors = DEFAULT_VENDORS
      scans = DEFAULT_SCANS
    }
  }

  const flaggedVendorsCount = (vendors || []).filter(v => v.is_flagged).length

  return (
    <div className="flex flex-col gap-4 w-full h-[calc(100vh-140px)]">
      {/* Search Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 bg-white p-4 rounded-2xl border border-[#d1e4ff] ambient-shadow">
        <div>
          <h1 className="text-xl font-extrabold text-[#001d36] tracking-tight">Contamination Heatmap</h1>
          <p className="text-xs font-medium text-[#3e484f]">Adulteration Hotspots & Verified Vendors — {cityName}</p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6e7980]" size={16} />
            <input 
              type="text" 
              placeholder={`Search ${cityName} area or vendor...`} 
              className="w-full h-10 bg-[#f8f9ff] border border-[#d1e4ff] rounded-xl pl-10 pr-4 text-xs font-semibold text-[#001d36] focus:outline-none focus:border-[#00668a]"
            />
          </div>

          <div className="flex items-center gap-2 bg-[#e5efff] px-3 py-2 rounded-xl text-xs font-bold text-[#00668a] shrink-0">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ba1a1a] animate-pulse"></span>
            <span>{flaggedVendorsCount} Flagged</span>
          </div>
        </div>
      </header>

      {/* Map Container */}
      <main className="flex-1 w-full rounded-2xl overflow-hidden border border-[#d1e4ff] ambient-shadow relative bg-white">
        <VendorMap 
          vendors={vendors || []} 
          scans={scans || []} 
          cityName={cityName} 
          flaggedOnly={searchParams.filter === 'flagged'}
        />
      </main>
    </div>
  )
}
