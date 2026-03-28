import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import LandingClient from "./LandingClient"

export default async function LandingPage() {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect('/home')
  }

  return <LandingClient />
}
