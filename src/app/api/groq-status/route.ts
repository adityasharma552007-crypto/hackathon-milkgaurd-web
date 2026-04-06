import { NextRequest } from 'next/server'
import Groq from 'groq-sdk'

export async function GET(_req: NextRequest) {
  const apiKey = process.env.GROQ_API_KEY
  const missing =
    !apiKey || apiKey.trim() === '' || apiKey === 'your_groq_api_key_here' || apiKey.startsWith('your_')
  const badFormat = !missing && !apiKey!.startsWith('gsk_')

  if (missing) {
    return Response.json({ ok: false, reason: 'missing' })
  }

  if (badFormat) {
    return Response.json({ ok: false, reason: 'bad_format' })
  }

  // Ping Groq with a cheap request to verify credentials
  try {
    const client = new Groq({ apiKey })
    await client.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [{ role: 'user', content: 'ping' }],
      max_tokens: 1,
    })
    return Response.json({ ok: true, reason: 'valid' })
  } catch (err: any) {
    const status = err?.status ?? 0
    if (status === 401) return Response.json({ ok: false, reason: 'invalid_key' })
    if (status === 429) return Response.json({ ok: true, reason: 'rate_limited' }) // key is valid, just rate-limited
    return Response.json({ ok: false, reason: 'connection_error', detail: err?.message })
  }
}
