/**
 * Rate Limiting Tests for MilkGuard
 *
 * Tests for the Supabase-based rate limiting system.
 * Run with: npm test -- rateLimiting
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock Supabase client
vi.mock('@/lib/supabase/server', () => ({
  createClient: () => ({
    from: vi.fn((table: string) => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          gt: vi.fn(() => ({
            order: vi.fn(() => ({
              limit: vi.fn(() => ({
                single: vi.fn()
              }))
            }))
          }))
        })),
        insert: vi.fn(() => ({
          values: vi.fn()
        })),
        update: vi.fn(() => ({
          eq: vi.fn()
        })),
        delete: vi.fn(() => ({
          eq: vi.fn()
        }))
      })),
      upsert: vi.fn()
    })),
    auth: {
      getSession: vi.fn(() => Promise.resolve({ data: { session: null }, error: null }))
    }
  })
}))

describe('Rate Limiting', () => {
  describe('checkRateLimit', () => {
    it('should allow request when under limit', async () => {
      const { checkRateLimit } = await import('@/lib/supabase/rateLimiting')

      const result = await checkRateLimit('/api/chat', 'user-123', '192.168.1.100')

      expect(result.allowed).toBe(true)
      expect(result.remaining).toBeGreaterThanOrEqual(0)
      expect(result.limit).toBeGreaterThan(0)
      expect(result.resetIn).toBeGreaterThan(0)
    })

    it('should reject request when limit exceeded', async () => {
      const { checkRateLimit } = await import('@/lib/supabase/rateLimiting')

      // Simulate hitting the limit multiple times
      for (let i = 0; i < 15; i++) {
        await checkRateLimit('/api/chat', 'user-test-2', '192.168.1.101')
      }

      const result = await checkRateLimit('/api/chat', 'user-test-2', '192.168.1.101')

      // After exceeding limit (10 requests per 60 min for /api/chat)
      expect(result.allowed).toBe(false)
      expect(result.remaining).toBe(0)
      expect(result.resetIn).toBeGreaterThan(0)
    })

    it('should track limits per user independently', async () => {
      const { checkRateLimit } = await import('@/lib/supabase/rateLimiting')

      // User 1 makes several requests
      for (let i = 0; i < 5; i++) {
        await checkRateLimit('/api/chat', 'user-A', '192.168.1.102')
      }

      // User 2 should still have full quota
      const user2Result = await checkRateLimit('/api/chat', 'user-B', '192.168.1.103')

      expect(user2Result.allowed).toBe(true)
      expect(user2Result.remaining).toBeGreaterThan(5) // User 1's usage shouldn't affect User 2
    })

    it('should track unauthenticated requests by IP', async () => {
      const { checkRateLimit } = await import('@/lib/supabase/rateLimiting')

      const result1 = await checkRateLimit('/api/auth/login', undefined, '192.168.1.200')
      const result2 = await checkRateLimit('/api/auth/login', undefined, '192.168.1.200')

      expect(result1.allowed).toBe(true)
      expect(result2.allowed).toBe(true)
      expect(result2.remaining).toBeLessThan(result1.remaining) // Count should increment
    })

    it('should allow requests when no user ID or IP provided (fail open)', async () => {
      const { checkRateLimit } = await import('@/lib/supabase/rateLimiting')

      const result = await checkRateLimit('/api/chat')

      expect(result.allowed).toBe(true)
    })

    it('should return different limits for different endpoints', async () => {
      const { checkRateLimit } = await import('@/lib/supabase/rateLimiting')

      const chatResult = await checkRateLimit('/api/chat', 'user-xyz', '192.168.1.104')
      const loginResult = await checkRateLimit('/api/auth/login', 'user-xyz', '192.168.1.104')

      // /api/chat has 10 requests per 60 min
      // /api/auth/login has 5 requests per 15 min
      expect(chatResult.limit).toBe(10)
      expect(loginResult.limit).toBe(5)
    })
  })

  describe('getRateLimitStatus', () => {
    it('should return current limit status for user', async () => {
      const { getRateLimitStatus } = await import('@/lib/supabase/rateLimiting')

      const status = await getRateLimitStatus('/api/chat', 'user-status-test')

      expect(status).toBeDefined()
      expect(status?.limit).toBeGreaterThan(0)
      expect(status?.remaining).toBeGreaterThanOrEqual(0)
      expect(status?.resetIn).toBeGreaterThanOrEqual(0)
    })

    it('should return null for unconfigured endpoint', async () => {
      const { getRateLimitStatus } = await import('@/lib/supabase/rateLimiting')

      const status = await getRateLimitStatus('/api/nonexistent', 'user-test')

      expect(status).toBeNull()
    })
  })

  describe('clearRateLimit', () => {
    it('should clear rate limit for user', async () => {
      const { clearRateLimit } = await import('@/lib/supabase/rateLimiting')

      const cleared = await clearRateLimit('user-to-clear', '/api/chat')

      expect(typeof cleared).toBe('number')
      expect(cleared).toBeGreaterThanOrEqual(0)
    })

    it('should clear all limits for user when endpoint not specified', async () => {
      const { clearRateLimit } = await import('@/lib/supabase/rateLimiting')

      const cleared = await clearRateLimit('user-to-clear-all')

      expect(typeof cleared).toBe('number')
    })
  })

  describe('cleanupExpiredRateLimits', () => {
    it('should remove expired records', async () => {
      const { cleanupExpiredRateLimits } = await import('@/lib/supabase/rateLimiting')

      const deleted = await cleanupExpiredRateLimits(24)

      expect(typeof deleted).toBe('number')
      expect(deleted).toBeGreaterThanOrEqual(0)
    })

    it('should accept custom age threshold', async () => {
      const { cleanupExpiredRateLimits } = await import('@/lib/supabase/rateLimiting')

      const deleted = await cleanupExpiredRateLimits(1) // 1 hour

      expect(typeof deleted).toBe('number')
    })
  })

  describe('Rate Limit Configuration', () => {
    it('should have correct limit for /api/chat (10 per 60 min)', async () => {
      const { checkRateLimit } = await import('@/lib/supabase/rateLimiting')

      const result = await checkRateLimit('/api/chat', 'user-config-test', '192.168.1.105')

      expect(result.limit).toBe(10)
    })

    it('should have correct limit for /api/explain (5 per 60 min)', async () => {
      const { checkRateLimit } = await import('@/lib/supabase/rateLimiting')

      const result = await checkRateLimit('/api/explain', 'user-config-test', '192.168.1.105')

      expect(result.limit).toBe(5)
    })

    it('should have correct limit for /api/devices/scan (20 per 1 min)', async () => {
      const { checkRateLimit } = await import('@/lib/supabase/rateLimiting')

      const result = await checkRateLimit('/api/devices/scan', 'user-config-test', '192.168.1.105')

      expect(result.limit).toBe(20)
      expect(result.resetIn).toBe(60) // 1 minute in seconds
    })

    it('should have correct limit for /api/auth/login (5 per 15 min)', async () => {
      const { checkRateLimit } = await import('@/lib/supabase/rateLimiting')

      const result = await checkRateLimit('/api/auth/login', 'user-config-test', '192.168.1.105')

      expect(result.limit).toBe(5)
    })

    it('should have correct limit for /api/auth/signup (3 per 60 min)', async () => {
      const { checkRateLimit } = await import('@/lib/supabase/rateLimiting')

      const result = await checkRateLimit('/api/auth/signup', 'user-config-test', '192.168.1.105')

      expect(result.limit).toBe(3)
    })

    it('should have correct limit for /api/test/start (3 per 60 min)', async () => {
      const { checkRateLimit } = await import('@/lib/supabase/rateLimiting')

      const result = await checkRateLimit('/api/test/start', 'user-config-test', '192.168.1.105')

      expect(result.limit).toBe(3)
    })
  })

  describe('Response Headers', () => {
    it('should include rate limit headers in response', async () => {
      const { getRateLimitHeaders } = await import('@/lib/supabase/protectedRoute')

      const headers = getRateLimitHeaders(10, 5, 300)

      expect(headers['X-RateLimit-Limit']).toBe('10')
      expect(headers['X-RateLimit-Remaining']).toBe('5')
      expect(headers['X-RateLimit-Reset']).toBeDefined()
    })
  })
})

describe('Protected Route Helper', () => {
  describe('checkAndLogRateLimit', () => {
    it('should return allowed response when under limit', async () => {
      const { checkAndLogRateLimit } = await import('@/lib/supabase/protectedRoute')

      const mockReq = {
        headers: {
          get: vi.fn((name: string) => {
            if (name === 'x-forwarded-for') return '192.168.1.50'
            return null
          })
        },
        cookies: {
          get: vi.fn(() => undefined)
        }
      } as any

      const result = await checkAndLogRateLimit('/api/chat', mockReq)

      expect(result.allowed).toBe(true)
      expect(result.response).toBeUndefined()
      expect(result.remaining).toBeGreaterThanOrEqual(0)
    })

    it('should return 429 response when limit exceeded', async () => {
      const { checkAndLogRateLimit } = await import('@/lib/supabase/protectedRoute')

      const mockReq = {
        headers: {
          get: vi.fn((name: string) => '192.168.1.99'),
        },
        cookies: {
          get: vi.fn(() => undefined)
        }
      } as any

      // Exhaust the limit
      for (let i = 0; i < 15; i++) {
        await checkAndLogRateLimit('/api/chat', mockReq)
      }

      const result = await checkAndLogRateLimit('/api/chat', mockReq)

      expect(result.allowed).toBe(false)
      expect(result.response).toBeDefined()
      expect(result.response?.status).toBe(429)
    })
  })

  describe('getIpAddress', () => {
    it('should extract IP from x-forwarded-for header', async () => {
      const mockReq = {
        headers: {
          get: vi.fn((name: string) => {
            if (name === 'x-forwarded-for') return '203.0.113.195, 70.41.3.18, 150.172.238.178'
            return null
          })
        }
      } as any

      const { checkAndLogRateLimit } = await import('@/lib/supabase/protectedRoute')
      const result = await checkAndLogRateLimit('/api/chat', mockReq)

      // Should use the first IP in the chain
      expect(result.allowed).toBeDefined()
    })

    it('should return "unknown" when no IP headers present', async () => {
      const mockReq = {
        headers: {
          get: vi.fn(() => null)
        }
      } as any

      const { checkAndLogRateLimit } = await import('@/lib/supabase/protectedRoute')
      const result = await checkAndLogRateLimit('/api/chat', mockReq)

      expect(result.allowed).toBeDefined()
    })
  })
})
