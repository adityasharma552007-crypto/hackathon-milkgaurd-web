import { createClient } from '@/lib/supabase/server'
import { UserHydrator } from '@/components/common/UserHydrator'
import { BottomNav } from '@/components/common/BottomNav'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Smartphone, Download } from 'lucide-react'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Fetch profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <div className="min-h-screen bg-[#F7F9F8] pb-24">
      <UserHydrator user={user} profile={profile} />
      <div className="max-w-md mx-auto min-h-screen bg-white shadow-xl relative overflow-hidden flex flex-col">
        {/* Global Dashboard Header with Download CTA */}
        <div className="w-full bg-white border-b border-slate-100 px-5 py-3 flex items-center justify-between sticky top-0 z-40 shadow-sm backdrop-blur-md bg-white/90">
          <Link href="/home" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-inner">
              <span className="text-white font-black text-sm leading-none">M</span>
            </div>
            <span className="font-black text-slate-800 tracking-tight text-lg">MilkGuard</span>
          </Link>
          <Link href="/download" className="flex items-center gap-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 px-3.5 py-1.5 rounded-full shadow-md hover:shadow-lg transition-all text-white group">
             <Smartphone size={14} className="group-hover:-rotate-12 transition-transform" />
             <span className="text-xs font-bold leading-none tracking-wide">Download</span>
             <Download size={12} className="ml-0.5 opacity-80" />
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
      <BottomNav />
    </div>
  )
}
