import { createClient } from '@/lib/supabase/server'
import { UserHydrator } from '@/components/common/UserHydrator'
import { BottomNav } from '@/components/common/BottomNav'
import { redirect } from 'next/navigation'

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
      <div className="max-w-md mx-auto min-h-screen bg-white shadow-xl relative overflow-hidden">
        {children}
      </div>
      <BottomNav />
    </div>
  )
}
