import { createClient } from '@/lib/supabase/server'
import { UserHydrator } from '@/components/common/UserHydrator'
import { BottomNav } from '@/components/common/BottomNav'
import { PageTransition } from '@/components/common/PageTransition'
import { redirect } from 'next/navigation'
import { cookies, headers } from 'next/headers'
import Link from 'next/link'
import { InstallButton } from '@/components/pwa/InstallButton'
import { MilkGuardLogo } from '@/components/brand/MilkGuardLogo'
import { Navbar } from '@/components/common/Navbar'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = cookies()
  const headerList = headers()
  const isDemo = cookieStore.get('mg_demo_session')?.value === 'true' || headerList.get('x-demo-user') === 'true'
  const currentPath = headerList.get('x-pathname') || ''
  const isGuestAllowedRoute = currentPath.startsWith('/scan') || currentPath.startsWith('/hardware') || currentPath.startsWith('/verify')

  let user: any = null
  let profile: any = null

  if (isDemo || isGuestAllowedRoute) {
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
      
      {/* Top Navigation Bar */}
      <Navbar />

      {/* Main Content Area */}
      <div className="w-full max-w-7xl mx-auto px-4 md:px-10 pt-6 pb-12">
        <PageTransition>{children}</PageTransition>
      </div>

      {/* Bottom Floating Navigation */}
      <BottomNav />
    </div>
  )
}
