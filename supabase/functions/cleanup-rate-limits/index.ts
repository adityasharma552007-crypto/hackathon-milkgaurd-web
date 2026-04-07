/**
 * Supabase Edge Function: Cleanup Rate Limits
 *
 * Removes expired rate limit records older than 24 hours.
 * Should be called periodically via cron job or scheduler.
 *
 * Usage:
 *   curl -X POST https://<project-ref>.supabase.co/functions/v1/cleanup-rate-limits \
 *     -H "Authorization: Bearer <service-role-key>"
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

interface ResponseBody {
  success: boolean
  deletedCount: number
  message: string
  timestamp: string
}

Deno.serve(async (req: Request): Promise<Response> => {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { 'Content-Type': 'application/json' } }
    )
  }

  try {
    // Create Supabase client with service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      throw new Error('Missing Supabase environment variables')
    }

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Calculate cutoff time (24 hours ago)
    const cutoffDate = new Date(Date.now() - 24 * 60 * 60 * 1000)

    // Delete expired records
    const { data, error } = await supabase
      .from('rate_limits')
      .delete()
      .lt('updated_at', cutoffDate.toISOString())
      .select()

    if (error) {
      console.error('[CleanupRateLimits] Error deleting records:', error)
      throw error
    }

    const deletedCount = data?.length || 0

    const responseBody: ResponseBody = {
      success: true,
      deletedCount,
      message: `Successfully deleted ${deletedCount} expired rate limit records`,
      timestamp: new Date().toISOString()
    }

    return new Response(
      JSON.stringify(responseBody),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'authorization, content-type'
        }
      }
    )
  } catch (error) {
    console.error('[CleanupRateLimits] Error:', error)

    const errorResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }

    return new Response(
      JSON.stringify(errorResponse),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'authorization, content-type'
        }
      }
    )
  }
})
