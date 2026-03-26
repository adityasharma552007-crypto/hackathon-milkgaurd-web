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
      className="w-full h-14 rounded-full border border-red-600 text-red-600 hover:bg-red-50 hover:text-red-700 focus:bg-red-50 font-bold uppercase tracking-widest bg-transparent flex items-center justify-center gap-2"
    >
      <LogOut size={18} />
      SIGN OUT
    </Button>
  )
}
