import { Loader2 } from 'lucide-react'

export default function DashboardLoading() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] bg-transparent">
      <div className="relative">
        <div className="w-16 h-16 rounded-full border-4 border-blue-100 border-t-blue-600 animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-6 h-6 rounded-full bg-blue-50 animate-pulse" />
        </div>
      </div>
      <p className="mt-4 text-xs font-black uppercase tracking-widest text-[#60A5FA] animate-pulse">
        Loading...
      </p>
    </div>
  )
}
