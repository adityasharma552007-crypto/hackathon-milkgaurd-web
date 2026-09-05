import { createClient } from '@/lib/supabase/server'
import { UserHydrator } from '@/components/common/UserHydrator'
import { BottomNav } from '@/components/common/BottomNav'
import { PageTransition } from '@/components/common/PageTransition'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { InstallButton } from '@/components/pwa/InstallButton'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = cookies()
  const isDemo = cookieStore.get('mg_demo_session')?.value === 'true'

  let user: any = null
  let profile: any = null

  if (isDemo) {
    user = {
      id: 'demo-user-123',
      email: 'demo@milkguard.com',
      user_metadata: { full_name: 'Demo User', phone: '9876543210' }
    }
    profile = {
      id: 'demo-user-123',
      full_name: 'Demo User',
      phone: '9876543210',
      city: 'Jaipur',
      area: 'Malviya Nagar',
      pod_id: 'POD-JP-042',
      total_scans: 28,
      safe_scans: 26,
      created_at: new Date().toISOString()
    }
  } else {
    try {
      const supabase = createClient()
      const { data } = await supabase.auth.getUser()
      user = data?.user ?? null

      if (user) {
        const { data: p } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        profile = p
      }
    } catch {
      user = null
    }
  }

  if (!user) {
    redirect('/auth/login')
  }

  return (
    <div className="min-h-screen bg-[#f8f9ff] text-[#001d36] font-sans antialiased pb-24 md:pb-8">
      <UserHydrator user={user} profile={profile} />
      
      {/* Stitch TopAppBar */}
      <header className="sticky top-0 w-full z-50 bg-[#f8f9ff]/90 backdrop-blur-xl border-b border-[#d1e4ff]/60 ambient-shadow">
        <div className="flex justify-between items-center px-4 md:px-10 h-16 w-full max-w-7xl mx-auto">
          {/* Leading Brand */}
          <Link href="/home" className="flex items-center gap-2 group active:scale-95 transition-transform p-1.5 rounded-xl hover:bg-[#e5efff]/60">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#00668a] to-[#004c69] flex items-center justify-center text-white shadow-md">
              <span className="material-symbols-outlined text-xl">biotech</span>
            </div>
            <span className="text-xl font-extrabold text-[#00288e] tracking-tight">MilkGuard</span>
          </Link>

          {/* Actions & Avatar */}
          <div className="flex items-center gap-3">
            <InstallButton variant="dashboard" label="Install App" />

            <Link href="/profile" className="flex items-center active:scale-95 transition-transform">
              <div className="w-10 h-10 rounded-full bg-[#dbe9ff] border border-[#bdc8d1] flex items-center justify-center hover:opacity-80 transition-opacity overflow-hidden">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="material-symbols-outlined text-[#3e484f]">person</span>
                )}
              </div>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="w-full max-w-7xl mx-auto px-4 md:px-10 pt-6 pb-12">
        <PageTransition>{children}</PageTransition>
      </div>

      {/* Bottom Floating Navigation */}
      <BottomNav />
    </div>
  )
}
