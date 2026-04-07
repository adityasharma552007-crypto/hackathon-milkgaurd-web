import { createClient } from "@/lib/supabase/server"
import { Search, MapPin, SlidersHorizontal, ChevronLeft } from "lucide-react"
import Link from "next/link"
import dynamic from "next/dynamic"

// Dynamic import for Leaflet (Client-side only)
const VendorMap = dynamic(() => import("@/components/VendorMap"), { 
  ssr: false,
  loading: () => <div className="w-full h-full bg-slate-100 animate-pulse rounded-3xl flex items-center justify-center font-black text-slate-300 uppercase tracking-widest">Loading Jaipur Map...</div>
})

export default async function MapPage() {
  const supabase = createClient()
  
  // Fetch vendors
  const { data: vendors } = await supabase
    .from('vendors')
    .select('*')
    .order('safety_score', { ascending: false })

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Search Header */}
      <header className="p-6 pb-4 pt-12 space-y-4 shrink-0 z-50">
        <div className="flex items-center justify-between">
          <Link href="/home" className="p-2 bg-slate-100 rounded-full">
            <ChevronLeft size={20} className="text-[#60A5FA]" />
          </Link>
          <h1 className="text-xl font-black text-[#60A5FA] uppercase tracking-tighter">Vendor Map</h1>
          <div className="p-2 bg-slate-100 rounded-full">
             <SlidersHorizontal size={20} className="text-[#60A5FA]" />
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text" 
            placeholder="Search Jaipur area or vendor..." 
            className="w-full h-12 bg-slate-50 border-none rounded-2xl pl-10 pr-4 text-sm font-bold focus:ring-[#60A5FA]"
          />
        </div>
      </header>

      {/* Map View */}
      <main className="flex-1 px-4 pb-24 overflow-hidden">
        <div className="w-full h-full relative">
           <VendorMap vendors={vendors || []} />
        </div>
      </main>
    </div>
  )
}
