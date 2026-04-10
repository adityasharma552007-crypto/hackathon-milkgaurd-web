import { createClient } from "@/lib/supabase/server"
import { Search, MapPin, SlidersHorizontal, ChevronLeft } from "lucide-react"
import Link from "next/link"
import dynamic from "next/dynamic"

// Dynamic import for Leaflet (Client-side only)
const VendorMap = dynamic(() => import("@/components/VendorMap"), { 
  ssr: false,
  loading: () => <div className="w-full h-full bg-slate-100 animate-pulse rounded-3xl flex items-center justify-center font-black text-slate-300 uppercase tracking-widest">Loading Jaipur Map...</div>
})

export default async function MapPage({ searchParams }: { searchParams: { filter?: string } }) {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  let cityName = 'Jaipur'
  
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('city')
      .eq('id', user.id)
      .single()
    if (profile?.city) {
      cityName = profile.city
    }
  }
  
  // Fetch vendors
  const { data: vendors } = await supabase
    .from('vendors')
    .select('*')
    .order('avg_score', { ascending: false }) // actually schema has avg_score, not safety_score

  // Fetch heatmap scans
  const { data: scans } = await supabase
    .from('scans')
    .select('latitude, longitude, adulteration_score')
    .not('latitude', 'is', null)
    .not('longitude', 'is', null)

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Search Header */}
      <header className="p-6 pb-4 pt-12 space-y-4 shrink-0 z-50">
        <div className="flex items-center justify-between">
          <Link href="/home" className="p-2 bg-slate-100 rounded-full">
            <ChevronLeft size={20} className="text-[#60A5FA]" />
          </Link>
          <div className="flex flex-col items-center">
            <h1 className="text-xl font-black text-[#60A5FA] uppercase tracking-tighter">Vendor Map</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Adulteration Hotspots — {cityName}</p>
          </div>
          <div className="p-2 bg-slate-100 rounded-full">
             <SlidersHorizontal size={20} className="text-[#60A5FA]" />
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text" 
            placeholder={`Search ${cityName} area or vendor...`} 
            className="w-full h-12 bg-slate-50 border-none rounded-2xl pl-10 pr-4 text-sm font-bold focus:ring-[#60A5FA]"
          />
        </div>
      </header>

      {/* Map View */}
      <main className="flex-1 px-4 pb-24 overflow-hidden">
        <div className="w-full h-full relative">
           <VendorMap 
             vendors={vendors || []} 
             scans={scans || []} 
             cityName={cityName} 
             flaggedOnly={searchParams.filter === 'flagged'}
           />
        </div>
      </main>
    </div>
  )
}
