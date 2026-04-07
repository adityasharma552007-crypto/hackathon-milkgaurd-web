/**
 * POST /api/explain
 * Provides AI-powered explanations of milk test results with rate limiting
 */

import { NextRequest } from 'next/server'
import Groq from 'groq-sdk'
import { checkAndLogRateLimit, getRateLimitHeaders } from '@/lib/supabase/protectedRoute'

const EXPLAIN_PROMPT = `You are a milk quality analysis expert. Explain test results in simple terms.
Include:
- What was detected
- Health/economic implications
- Recommended actions
Use clear, non-technical language. Be concise (under 150 words).`

export async function POST(req: NextRequest) {
  // Check rate limit FIRST
  const rateLimitCheck = await checkAndLogRateLimit('/api/explain', req)

  if (!rateLimitCheck.allowed) {
    return rateLimitCheck.response
  }

  // Check API key
  const apiKey = process.env.GROQ_API_KEY
  const isPlaceholder = !apiKey || apiKey === 'your_groq_api_key_here' || apiKey.startsWith('your_')
  if (isPlaceholder) {
    return new Response(
      JSON.stringify({
        error: 'Groq API key not configured',
      }),
      {
        status: 503,
        headers: {
          'Content-Type': 'application/json',
          ...getRateLimitHeaders(rateLimitCheck.limit, rateLimitCheck.remaining, rateLimitCheck.resetIn)
        }
      }
    )
  }

  const body = await req.json().catch(() => null)
  if (!body?.results) {
    return new Response(
      JSON.stringify({ error: 'Test results are required' }),
      {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          ...getRateLimitHeaders(rateLimitCheck.limit, rateLimitCheck.remaining, rateLimitCheck.resetIn)
        }
      }
    )
  }

  try {
    const groq = new Groq({ apiKey })
    const completion = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [
        { role: 'system', content: EXPLAIN_PROMPT },
        { role: 'user', content: JSON.stringify(body.results, null, 2) }
      ],
      max_tokens: 300,
      temperature: 0.7,
    })

    return new Response(
      JSON.stringify({
        explanation: completion.choices[0]?.message?.content,
        remaining: rateLimitCheck.remaining
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...getRateLimitHeaders(rateLimitCheck.limit, rateLimitCheck.remaining, rateLimitCheck.resetIn)
        }
      }
    )
  } catch (err: any) {
    const status = err?.status ?? 500
    const message = status === 401
      ? 'Invalid Groq API key'
      : status === 429
      ? 'Rate limit reached. Please wait and try again.'
      : err?.message ?? 'Failed to generate explanation'

    return new Response(
      JSON.stringify({ error: message }),
      {
        status,
        headers: {
          'Content-Type': 'application/json',
          ...getRateLimitHeaders(rateLimitCheck.limit, rateLimitCheck.remaining, rateLimitCheck.resetIn)
        }
      }
    )
  }
}
