import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const next = searchParams.get("next") ?? "/home"

  if (code) {
    const supabase = createClient()
    const { data: authData, error } = await supabase.auth
      .exchangeCodeForSession(code)
    
    if (!error && authData?.user) {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single()

      if (!profileError && profile) {
        return NextResponse.redirect(`${origin}${next}`)
      } else {
        // If not explicitly found in DB, redirect back
        return NextResponse.redirect(`${origin}/auth/login?error=profile_not_found`)
      }
    }
  }

  return NextResponse.redirect(`${origin}/auth/login`)
}
