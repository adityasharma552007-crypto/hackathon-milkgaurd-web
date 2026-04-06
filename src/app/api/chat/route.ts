import Groq from 'groq-sdk'
import { NextRequest } from 'next/server'

const SYSTEM_PROMPT = `You are a helpful AI assistant for MilkGuard, a milk adulteration detection app.
Explain test results in simple, non-technical language for milk vendors and consumers.
Be concise, informative, and always provide:
- What was detected in the milk
- Why it's a concern (health or economic impact)
- What the vendor or consumer should do next
Use **bold** for key terms, bullet points for clarity.
Keep responses under 200 words. Be empathetic and constructive, never alarmist.`

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

export async function POST(req: NextRequest) {
  // Check API key — also catch the placeholder value
  const apiKey = process.env.GROQ_API_KEY
  const isPlaceholder = !apiKey || apiKey === 'your_groq_api_key_here' || apiKey.startsWith('your_')
  if (isPlaceholder) {
    return new Response(
      JSON.stringify({
        error:
          '⚙️ Groq API key not set up yet.\n\n' +
          '1. Go to https://console.groq.com and sign up (free)\n' +
          '2. Create an API key\n' +
          '3. Add it to your .env.local file:\n   GROQ_API_KEY=gsk_your_actual_key_here\n' +
          '4. Restart the dev server',
      }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    )
  }

  let body: { messages: { role: string; content: string }[]; context?: string }
  try {
    body = await req.json()
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid request body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const { messages, context } = body

  if (!messages || !Array.isArray(messages)) {
    return new Response(JSON.stringify({ error: 'messages array is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // Build the system message — optionally inject scan context
  const systemContent = context
    ? `${SYSTEM_PROMPT}\n\nCurrent scan context:\n${context}`
    : SYSTEM_PROMPT

  try {
    const groqClient = new Groq({ apiKey })
    const stream = await groqClient.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [
        { role: 'system', content: systemContent },
        ...messages.map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content })),
      ],
      stream: true,
      max_tokens: 400,
      temperature: 0.7,
    })

    // Return a streaming response
    const encoder = new TextEncoder()
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const text = chunk.choices[0]?.delta?.content ?? ''
            if (text) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`))
            }
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
        } catch (err: any) {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ error: err.message ?? 'Stream error' })}\n\n`)
          )
        } finally {
          controller.close()
        }
      },
    })

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
      },
    })
  } catch (err: any) {
    const status = err?.status ?? 500
    const message =
      status === 401
        ? 'Invalid Groq API key. Please check your GROQ_API_KEY.'
        : status === 429
        ? 'Rate limit reached. Please wait a moment and try again.'
        : err?.message ?? 'Failed to connect to AI service.'

    return new Response(JSON.stringify({ error: message }), {
      status,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
