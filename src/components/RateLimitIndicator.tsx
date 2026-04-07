'use client'

import { useEffect, useState, useCallback } from 'react'

interface RateLimitStatus {
  limit: number
  remaining: number
  resetTime: string
  resetIn: number
}

interface RateLimitIndicatorProps {
  endpoint: string
  className?: string
  showProgress?: boolean
  compact?: boolean
}

export function RateLimitIndicator({
  endpoint,
  className = '',
  showProgress = true,
  compact = false
}: RateLimitIndicatorProps) {
  const [status, setStatus] = useState<RateLimitStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStatus = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/rate-limit-status?endpoint=${encodeURIComponent(endpoint)}`)

      if (!res.ok) {
        if (res.status === 401) {
          // Not authenticated - hide indicator
          setStatus(null)
          return
        }
        throw new Error('Failed to fetch rate limit status')
      }

      const data = await res.json()
      setStatus(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [endpoint])

  useEffect(() => {
    fetchStatus()

    // Poll for updates every 30 seconds
    const interval = setInterval(fetchStatus, 30000)

    return () => clearInterval(interval)
  }, [fetchStatus])

  if (loading) {
    return null
  }

  if (error || !status) {
    return null
  }

  const percentage = (status.remaining / status.limit) * 100
  const isLow = status.remaining <= Math.ceil(status.limit * 0.2) // Less than 20% remaining
  const resetMinutes = Math.round(status.resetIn / 60)
  const resetSeconds = status.resetIn % 60

  if (compact) {
    return (
      <div className={`flex items-center gap-2 text-xs ${className}`}>
        <span className={isLow ? 'text-red-600 font-medium' : 'text-gray-500'}>
          {status.remaining}/{status.limit}
        </span>
        {isLow && (
          <span className="text-red-500" title={`Resets in ${resetMinutes}m ${resetSeconds}s`}>
            !
          </span>
        )}
      </div>
    )
  }

  return (
    <div className={`p-3 rounded-lg ${isLow ? 'bg-red-50 border border-red-200' : 'bg-blue-50 border border-blue-200'} ${className}`}>
      {showProgress && (
        <div className="mb-2">
          <div className="flex justify-between text-xs mb-1">
            <span className={isLow ? 'text-red-700' : 'text-gray-600'}>
              Requests remaining
            </span>
            <span className={isLow ? 'text-red-700 font-medium' : 'text-gray-700 font-medium'}>
              {status.remaining} / {status.limit}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                isLow ? 'bg-red-500' : 'bg-blue-500'
              }`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      )}
      <p className={`text-xs ${isLow ? 'text-red-600' : 'text-gray-500'}`}>
        {isLow ? 'Low quota! ' : ''}
        Resets in {resetMinutes > 0 ? `${resetMinutes}m` : `${resetSeconds}s`}
      </p>
    </div>
  )
}

/**
 * Hook to get rate limit status programmatically
 */
export function useRateLimitStatus(endpoint: string) {
  const [status, setStatus] = useState<RateLimitStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchStatus() {
      try {
        setLoading(true)
        const res = await fetch(`/api/rate-limit-status?endpoint=${encodeURIComponent(endpoint)}`)

        if (!res.ok) {
          throw new Error('Failed to fetch rate limit status')
        }

        const data = await res.json()
        setStatus(data)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchStatus()
    const interval = setInterval(fetchStatus, 30000)
    return () => clearInterval(interval)
  }, [endpoint])

  return { status, loading, error }
}
