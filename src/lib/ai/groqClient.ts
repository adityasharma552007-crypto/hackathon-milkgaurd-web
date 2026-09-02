import Groq from 'groq-sdk'

export const GROQ_MODELS = [
  process.env.GROQ_MODEL,
  'groq/compound-mini',
  'openai/gpt-oss-20b',
  'qwen/qwen3.6-27b',
  'groq/compound',
  'allam-2-7b'
].filter(Boolean) as string[]

export const DEFAULT_GROQ_MODEL = GROQ_MODELS[0] || 'groq/compound-mini'

export function getGroqClient(apiKey?: string) {
  const key = apiKey || process.env.GROQ_API_KEY
  if (!key) throw new Error('GROQ_API_KEY is not defined')
  return new Groq({ apiKey: key })
}

/**
 * Executes a chat completion with automatic fallback across available Groq models
 */
export async function runGroqChatCompletion(
  params: Omit<Groq.Chat.ChatCompletionCreateParamsNonStreaming, 'model'> & { model?: string },
  apiKey?: string
) {
  const groq = getGroqClient(apiKey)
  const modelsToTry = params.model ? [params.model, ...GROQ_MODELS.filter(m => m !== params.model)] : GROQ_MODELS

  let lastError: any = null
  for (const model of modelsToTry) {
    try {
      const res = await groq.chat.completions.create({
        ...params,
        model,
        stream: false,
      })
      return { response: res, modelUsed: model }
    } catch (err: any) {
      lastError = err
      // If error is 404 model not found or deprecation, try next model
      if (err?.status === 404 || err?.message?.includes('model') || err?.message?.includes('does not exist')) {
        continue
      }
      throw err
    }
  }
  throw lastError
}

/**
 * Creates a streaming chat completion with automatic fallback across available Groq models
 */
export async function runGroqChatStream(
  params: Omit<Groq.Chat.ChatCompletionCreateParamsStreaming, 'model'> & { model?: string },
  apiKey?: string
) {
  const groq = getGroqClient(apiKey)
  const modelsToTry = params.model ? [params.model, ...GROQ_MODELS.filter(m => m !== params.model)] : GROQ_MODELS

  let lastError: any = null
  for (const model of modelsToTry) {
    try {
      const stream = await groq.chat.completions.create({
        ...params,
        model,
        stream: true,
      })
      return { stream, modelUsed: model }
    } catch (err: any) {
      lastError = err
      if (err?.status === 404 || err?.message?.includes('model') || err?.message?.includes('does not exist')) {
        continue
      }
      throw err
    }
  }
  throw lastError
}
