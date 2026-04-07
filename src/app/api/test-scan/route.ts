import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { checkAndLogRateLimit, getRateLimitHeaders } from "@/lib/supabase/protectedRoute"

export async function GET() {
  // Check rate limit FIRST
  const rateLimitCheck = await checkAndLogRateLimit('/api/test/start')

  if (!rateLimitCheck.allowed) {
    return rateLimitCheck.response
  }

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json(
      { error: "Not authenticated" },
      {
        status: 401,
        headers: getRateLimitHeaders(rateLimitCheck.limit, rateLimitCheck.remaining, rateLimitCheck.resetIn)
      }
    )
  }

  const testWavelengths = [
    0.81, 0.80, 0.75, 0.71, 0.68, 0.64,
    0.61, 0.57, 0.55, 0.51, 0.47, 0.44,
    0.41, 0.68, 0.35, 0.31, 0.29, 0.27
  ]

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/analyze-milk`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
      },
      body: JSON.stringify({
        wavelengths: testWavelengths,
        userId: user.id,
        vendorId: null
      })
    }
  )

  if (!res.ok) {
    const err = await res.json()
    return NextResponse.json(
      err,
      {
        status: res.status,
        headers: getRateLimitHeaders(rateLimitCheck.limit, rateLimitCheck.remaining, rateLimitCheck.resetIn)
      }
    )
  }

  const data = await res.json()
  return NextResponse.json(
    {
      ...data,
      remaining: rateLimitCheck.remaining
    },
    {
      headers: getRateLimitHeaders(rateLimitCheck.limit, rateLimitCheck.remaining, rateLimitCheck.resetIn)
    }
  )
}
