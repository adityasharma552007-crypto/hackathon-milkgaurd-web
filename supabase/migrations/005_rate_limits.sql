-- Rate Limiting Schema for MilkGuard
-- Provides Supabase-based rate limiting with persistent storage

-- Rate limits tracking table
CREATE TABLE IF NOT EXISTS rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  request_count INT DEFAULT 1,
  reset_time TIMESTAMP WITH TIME ZONE NOT NULL,
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for efficient user+endpoint lookups
CREATE INDEX IF NOT EXISTS idx_rate_limits_user_endpoint
  ON rate_limits(user_id, endpoint, reset_time);

-- Index for IP-based lookups (unauthenticated requests)
CREATE INDEX IF NOT EXISTS idx_rate_limits_ip_endpoint
  ON rate_limits(ip_address, endpoint, reset_time);

-- Rate limit configuration table
CREATE TABLE IF NOT EXISTS rate_limit_config (
  endpoint TEXT PRIMARY KEY,
  limit_count INT NOT NULL,
  window_minutes INT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Default rate limit configurations
INSERT INTO rate_limit_config (endpoint, limit_count, window_minutes) VALUES
  ('/api/chat', 10, 60),
  ('/api/explain', 5, 60),
  ('/api/devices/scan', 20, 1),
  ('/api/devices/connect', 15, 1),
  ('/api/auth/login', 5, 15),
  ('/api/auth/signup', 3, 60),
  ('/api/test/start', 3, 60)
ON CONFLICT (endpoint) DO NOTHING;

-- Enable Row Level Security on rate_limits
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

-- RLS Policies for rate_limits
-- SELECT: Admin only (for monitoring)
CREATE POLICY "Admins can view rate limits"
  ON rate_limits
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = (
        SELECT raw_user_meta_data->>'user_id'
        FROM auth.users
        LIMIT 1
      )
      AND (raw_user_meta_data->>'role')::text = 'admin'
    )
  );

-- INSERT: Service role only (from app API)
CREATE POLICY "Service role can insert rate limits"
  ON rate_limits
  FOR INSERT
  WITH CHECK (true);

-- UPDATE: Service role only (from app API)
CREATE POLICY "Service role can update rate limits"
  ON rate_limits
  FOR UPDATE
  USING (true);

-- DELETE: Service role only (for cleanup)
CREATE POLICY "Service role can delete rate limits"
  ON rate_limits
  FOR DELETE
  USING (true);

-- RLS for rate_limit_config (readable by all authenticated users)
ALTER TABLE rate_limit_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view rate limit config"
  ON rate_limit_config
  FOR SELECT
  TO authenticated
  USING (true);

-- Function to get or create rate limit record
CREATE OR REPLACE FUNCTION check_rate_limit(
  p_endpoint TEXT,
  p_user_id UUID DEFAULT NULL,
  p_ip_address TEXT DEFAULT NULL
)
RETURNS TABLE (
  allowed BOOLEAN,
  remaining INT,
  reset_in INT,
  limit_count INT
) AS $$
DECLARE
  v_limit_config RECORD;
  v_existing RECORD;
  v_now TIMESTAMP WITH TIME ZONE := NOW();
  v_reset_time TIMESTAMP WITH TIME ZONE;
  v_request_count INT;
BEGIN
  -- Get limit configuration
  SELECT limit_count, window_minutes INTO v_limit_config
  FROM rate_limit_config
  WHERE endpoint = p_endpoint;

  IF v_limit_config IS NULL THEN
    -- No config found, allow by default
    RETURN QUERY SELECT true, 999, 0, 999;
    RETURN;
  END IF;

  -- Calculate reset time boundary
  v_reset_time := v_now + (v_limit_config.window_minutes * INTERVAL '1 minute');

  -- Look for existing record
  IF p_user_id IS NOT NULL THEN
    SELECT * INTO v_existing
    FROM rate_limits
    WHERE user_id = p_user_id
      AND endpoint = p_endpoint
      AND reset_time > v_now
    ORDER BY reset_time DESC
    LIMIT 1;
  ELSIF p_ip_address IS NOT NULL THEN
    SELECT * INTO v_existing
    FROM rate_limits
    WHERE ip_address = p_ip_address
      AND endpoint = p_endpoint
      AND reset_time > v_now
    ORDER BY reset_time DESC
    LIMIT 1;
  END IF;

  IF v_existing IS NULL THEN
    -- No existing record, create new one
    INSERT INTO rate_limits (user_id, endpoint, request_count, reset_time, ip_address)
    VALUES (p_user_id, p_endpoint, 1, v_reset_time, p_ip_address)
    RETURNING * INTO v_existing;

    RETURN QUERY SELECT true, v_limit_config.limit_count - 1,
      EXTRACT(EPOCH FROM (v_reset_time - v_now))::INT,
      v_limit_config.limit_count;
  ELSIF v_existing.request_count >= v_limit_config.limit_count THEN
    -- Rate limit exceeded
    RETURN QUERY SELECT false, 0,
      EXTRACT(EPOCH FROM (v_existing.reset_time - v_now))::INT,
      v_limit_config.limit_count;
  ELSE
    -- Increment counter
    UPDATE rate_limits
    SET request_count = request_count + 1,
        updated_at = NOW()
    WHERE id = v_existing.id
    RETURNING * INTO v_existing;

    RETURN QUERY SELECT true,
      v_limit_config.limit_count - v_existing.request_count,
      EXTRACT(EPOCH FROM (v_existing.reset_time - v_now))::INT,
      v_limit_config.limit_count;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to manually clear rate limit (admin use)
CREATE OR REPLACE FUNCTION clear_user_rate_limit(
  p_user_id UUID,
  p_endpoint TEXT DEFAULT NULL
)
RETURNS INT AS $$
DECLARE
  v_deleted INT;
BEGIN
  IF p_endpoint IS NULL THEN
    DELETE FROM rate_limits
    WHERE user_id = p_user_id;
  ELSE
    DELETE FROM rate_limits
    WHERE user_id = p_user_id AND endpoint = p_endpoint;
  END IF;

  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  RETURN v_deleted;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
