# Rate Limiting Documentation

## Overview

MilkGuard uses Supabase-based rate limiting to protect API endpoints from abuse. All rate limit checks happen via database queries (no middleware), providing simple, clean, and persistent rate limiting.

## Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   API Route     │────▶│  checkRateLimit  │────▶│   Supabase DB   │
│   (POST/GET)    │     │  (rateLimiting)  │     │  (rate_limits)  │
└─────────────────┘     └──────────────────┘     └─────────────────┘
```

## Database Schema

### `rate_limits` Table

Stores active rate limit records for users and IPs.

| Column       | Type      | Description                              |
|-------------|-----------|------------------------------------------|
| id          | UUID      | Primary key                              |
| user_id     | UUID      | Reference to auth.users (nullable)       |
| endpoint    | TEXT      | API endpoint being rate limited          |
| request_count | INT     | Current request count in window          |
| reset_time  | TIMESTAMP | When the rate limit window resets        |
| ip_address  | TEXT      | Client IP (for unauthenticated requests) |
| created_at  | TIMESTAMP | Record creation time                     |
| updated_at  | TIMESTAMP | Last update time                         |

### `rate_limit_config` Table

Configuration for each endpoint's rate limits.

| Endpoint           | Limit | Window (minutes) |
|-------------------|-------|------------------|
| /api/chat         | 10    | 60               |
| /api/explain      | 5     | 60               |
| /api/devices/scan | 20    | 1                |
| /api/devices/connect | 15 | 1                |
| /api/auth/login   | 5     | 15               |
| /api/auth/signup  | 3     | 60               |
| /api/test/start   | 3     | 60               |

## Usage

### Protecting an API Route

```typescript
import { checkAndLogRateLimit, getRateLimitHeaders } from '@/lib/supabase/protectedRoute'

export async function POST(req: NextRequest) {
  // Check rate limit FIRST
  const rateLimitCheck = await checkAndLogRateLimit('/api/chat', req)

  if (!rateLimitCheck.allowed) {
    return rateLimitCheck.response // Returns 429
  }

  // Continue with normal logic...
  return Response.json({
    message: 'Success',
    remaining: rateLimitCheck.remaining
  }, {
    headers: getRateLimitHeaders(rateLimitCheck.limit, rateLimitCheck.remaining, rateLimitCheck.resetIn)
  })
}
```

### Displaying Rate Limit Status in UI

```tsx
import { RateLimitIndicator } from '@/components/RateLimitIndicator'

function MyComponent() {
  return (
    <div>
      <RateLimitIndicator endpoint="/api/chat" />
    </div>
  )
}
```

### Getting Rate Limit Status Programmatically

```tsx
import { useRateLimitStatus } from '@/components/RateLimitIndicator'

function MyComponent() {
  const { status, loading, error } = useRateLimitStatus('/api/chat')

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div>
      {status?.remaining} / {status?.limit} requests remaining
    </div>
  )
}
```

## Response Headers

All protected endpoints include these headers:

| Header                | Description                          |
|----------------------|--------------------------------------|
| X-RateLimit-Limit    | Maximum requests allowed in window   |
| X-RateLimit-Remaining | Requests remaining in current window |
| X-RateLimit-Reset    | ISO timestamp when window resets     |
| Retry-After          | Seconds until retry (on 429 only)    |

## 429 Response Format

When rate limit is exceeded:

```json
{
  "error": "Rate limit exceeded",
  "message": "Too many requests. Try again in 300 seconds.",
  "retryAfter": 300,
  "limit": 10,
  "remaining": 0
}
```

## Admin Monitoring

Admins can view rate limit statistics:

```bash
GET /api/admin/rate-limit-stats
```

Returns:
- Top endpoints by request count
- Top users by request count
- Suspicious IPs (high usage or violations)
- Recent violations

## Cleanup Job

Expired rate limit records are cleaned up automatically by the Supabase Edge Function:

```bash
POST https://<project-ref>.supabase.co/functions/v1/cleanup-rate-limits
Authorization: Bearer <service-role-key>
```

Or manually via the utility function:

```typescript
import { cleanupExpiredRateLimits } from '@/lib/supabase/rateLimiting'

await cleanupExpiredRateLimits(24) // Delete records older than 24 hours
```

## Testing

Run the test suite:

```bash
npm test -- rateLimiting
```

Tests cover:
- Hitting rate limits
- Reset after time window
- Per-user isolation
- IP-based limiting (unauthenticated)
- Response header validation

## Environment Variables

| Variable                      | Description                    |
|------------------------------|--------------------------------|
| NEXT_PUBLIC_RATE_LIMIT_ENDPOINT | Endpoint for status checks   |
| RATE_LIMIT_ENABLED           | Enable/disable rate limiting   |

## Fail-Safe Behavior

If Supabase is unavailable:
- Rate limit checks **fail open** (requests are allowed)
- Errors are logged to console
- A warning is included in logs

This ensures the application remains functional even if the database is temporarily unavailable.

## Security Considerations

1. **Per-user isolation**: Authenticated users have separate limits from IP-based limits
2. **IP tracking**: Unauthenticated requests are tracked by IP address
3. **Admin override**: Admins can manually clear rate limits for users
4. **Audit trail**: All requests are logged in the `rate_limits` table
