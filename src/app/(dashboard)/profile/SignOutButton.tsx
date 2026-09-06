"use client"

import { useState } from "react"
import { LogOut, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { signOut } from "@/lib/supabase/authUtils"

import { useTranslation } from "@/lib/i18n/useTranslation"

export function SignOutButton() {
  const [isSigningOut, setIsSigningOut] = useState(false)
  const { t } = useTranslation()

  async function handleSignOut() {
    if (isSigningOut) return
    setIsSigningOut(true)

    try {
      await signOut()
    } catch (err) {
      console.error("Sign out error:", err)
    } finally {
      // Full page redirect clears Next.js App Router RSC cache, Zustand store, and browser memory
      window.location.href = "/auth/login?logged_out=true"
    }
  }

  return (
    <Button 
      variant="outline" 
      onClick={handleSignOut}
      disabled={isSigningOut}
      className="w-full h-14 rounded-full border border-red-600 text-red-600 hover:bg-red-50 hover:text-red-700 focus:bg-red-50 font-bold uppercase tracking-widest bg-transparent flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
    >
      {isSigningOut ? (
        <>
          <Loader2 size={18} className="animate-spin" />
          <span>{t('signing_out', 'SIGNING OUT...')}</span>
        </>
      ) : (
        <>
          <LogOut size={18} />
          <span>{t('sign_out', 'SIGN OUT')}</span>
        </>
      )}
    </Button>
  )
}

