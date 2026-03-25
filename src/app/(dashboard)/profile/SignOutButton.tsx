"use client"

import { LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

export function SignOutButton() {
  const router = useRouter()
  const supabase = createClient()

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  return (
    <Button 
      variant="outline" 
      onClick={handleSignOut}
      className="w-full mt-6 h-14 rounded-full border-red-500 text-red-500 hover:bg-red-50 font-black uppercase tracking-widest bg-transparent"
    >
      Sign Out
    </Button>
  )
}
