import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import LandingClient from "./LandingClient"

export default async function LandingPage() {
  const cookieStore = cookies()
  const isDemo = cookieStore.get('mg_demo_session')?.value === 'true'

  if (isDemo) {
    redirect('/home')
  }

  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      redirect('/home')
    }
  } catch {
    // If Supabase fetch fails/times out, render landing page without blocking
  }

  return <LandingClient />
}
