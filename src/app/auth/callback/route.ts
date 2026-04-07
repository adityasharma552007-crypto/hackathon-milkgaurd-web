import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const next = searchParams.get("next") ?? "/home"

  if (code) {
    const supabase = createClient()
    const { error, data } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data?.user) {
      // Check if profile is complete
      const { data: profile } = await supabase
        .from('profiles')
        .select('profile_complete')
        .eq('id', data.user.id)
        .single();
        
      if (profile && !profile.profile_complete) {
        // Redirect to profile completion if not explicitly complete
        return NextResponse.redirect(`${origin}/auth/complete-profile`)
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Failed to exchange code or user canceled
  return NextResponse.redirect(`${origin}/auth/login?error=auth_failed`)
}
