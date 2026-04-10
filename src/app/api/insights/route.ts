import Groq from 'groq-sdk'
import { NextRequest } from 'next/server'
import { checkAndLogRateLimit, getRateLimitHeaders } from '@/lib/supabase/protectedRoute'

export async function POST(req: NextRequest) {
  // Check rate limit
  const rateLimitCheck = await checkAndLogRateLimit('/api/insights', req)

  if (!rateLimitCheck.allowed) {
    return rateLimitCheck.response
  }

  const apiKey = process.env.GROQ_API_KEY
  const isPlaceholder = !apiKey || apiKey === 'your_groq_api_key_here' || apiKey.startsWith('your_')
  
  if (isPlaceholder) {
    // Return mock data for placeholder scenarios
    const fallback = [
      { insight: "System limits prevent live AI scanning. Please provide an active Groq key.", type: "warning", icon: "TriangleAlert" },
      { insight: "Default thresholds holding steady.", type: "info", icon: "Info" },
      { insight: "Vendor scan routines optimal pending live intelligence hook.", type: "success", icon: "CheckCircle" },
      { insight: "Adulteration risk stable.", type: "info", icon: "Activity" }
    ]
    return new Response(JSON.stringify(fallback), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...getRateLimitHeaders(rateLimitCheck.limit, rateLimitCheck.remaining, rateLimitCheck.resetIn)
      }
    })
  }

  let body: any
  try {
    body = await req.json()
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid request body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const { context } = body

  // System Prompt exactly matching specs
  const SYSTEM_PROMPT = `You are a food safety analyst for MilkGuard. 
Analyze the following scan data and generate exactly 4 short insights in JSON format:
[
  { "insight": "string", "type": "warning"|"success"|"info", "icon": "string" }
]
Keep each insight under 20 words. Be specific and data driven. Focus on patterns, risks, and recommendations. Valid icon strings: "AlertTriangle", "CheckCircle", "Info", "Activity", "TrendUp", "TrendDown", "ShieldAlert", "ShieldCheck".

Context:
${JSON.stringify(context || {})}`

  try {
    const groqClient = new Groq({ apiKey })
    
    const completion = await groqClient.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT }
      ],
      response_format: { type: "json_object" },
      max_tokens: 300,
      temperature: 0.4,
    })

    const rawContent = completion.choices[0]?.message?.content || '{"insights": []}'
    let parsedContent;
    try {
      parsedContent = JSON.parse(rawContent)
    } catch {
      // Fallback extraction if model outputs wrapper
      parsedContent = { insights: [{ insight: "Failed to parse AI output.", type: "warning", icon: "AlertTriangle" }] }
    }

    // Sometimes the model wraps it in {"insights": [...]}, we should flatten it.
    const resultArr = Array.isArray(parsedContent) ? parsedContent : (parsedContent.insights || parsedContent.data || Object.values(parsedContent)[0])

    return new Response(JSON.stringify(Array.isArray(resultArr) ? resultArr.slice(0,4) : []), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...getRateLimitHeaders(rateLimitCheck.limit, rateLimitCheck.remaining, rateLimitCheck.resetIn)
      },
    })
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err?.message || 'Failed to generate insights' }), {
      status: err?.status || 500,
      headers: {
        'Content-Type': 'application/json',
        ...getRateLimitHeaders(rateLimitCheck.limit, rateLimitCheck.remaining, rateLimitCheck.resetIn)
      },
    })
  }
}
