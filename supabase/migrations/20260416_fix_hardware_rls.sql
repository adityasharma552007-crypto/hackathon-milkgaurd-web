-- Migration: Fix RLS so hardware scans (user_id=NULL) are visible to all authenticated users
-- The existing "own scans" policy is FOR ALL which covers SELECT too,
-- and only passes when user_id = auth.uid(). Hardware scans have user_id=NULL so they're blocked.

-- Step 1: Drop the blanket "own scans" all-purpose policy
DROP POLICY IF EXISTS "own scans" ON public.scans;

-- Step 2: Recreate as SELECT-only for the user's own scans OR hardware scans (user_id IS NULL)
CREATE POLICY "read own and hardware scans" ON public.scans
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()          -- user's own manual scans
    OR source_hardware_id IS NOT NULL  -- OR any ESP32 hardware scan
  );

-- Step 3: Keep insert/update/delete restricted to own rows only
CREATE POLICY "insert own scans" ON public.scans
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "update own scans" ON public.scans
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "delete own scans" ON public.scans
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Step 4: Also allow the DB trigger (SECURITY DEFINER) to insert hardware scans with user_id=NULL
-- The trigger runs as the function owner (postgres), which bypasses RLS — so no extra policy needed.

-- Step 5: Drop and recreate the old "hardware scans visible to all" policy (cleanup)
DROP POLICY IF EXISTS "hardware scans visible to all" ON public.scans;
