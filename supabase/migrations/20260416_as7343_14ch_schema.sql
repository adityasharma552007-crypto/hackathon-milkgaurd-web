-- ============================================================
-- Migration: AS7343 14-Channel Spectral Schema for milk_data
-- Sensor: AS7343 (14 spectral channels over I2C)
-- Channels: F1–F8 (visible), NIR, Clear
-- Quality: 0.0–1.0  |  Status: Pure / Adulterated / Uncertain
-- ============================================================

-- 1. Add visible-spectrum channels F1–F8 if they don't exist
DO $$
DECLARE
  col TEXT;
BEGIN
  FOREACH col IN ARRAY ARRAY['f1','f2','f3','f4','f5','f6','f7','f8']
  LOOP
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema='public' AND table_name='milk_data' AND column_name=col
    ) THEN
      EXECUTE format('ALTER TABLE public.milk_data ADD COLUMN %I REAL', col);
    END IF;
  END LOOP;
END
$$;

-- 2. Add NIR channel
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='milk_data' AND column_name='nir'
  ) THEN
    ALTER TABLE public.milk_data ADD COLUMN nir REAL;
  END IF;
END
$$;

-- 3. Add Clear channel
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='milk_data' AND column_name='clear'
  ) THEN
    ALTER TABLE public.milk_data ADD COLUMN clear REAL;
  END IF;
END
$$;

-- 4. Add status column (Pure / Adulterated / Uncertain)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='milk_data' AND column_name='status'
  ) THEN
    ALTER TABLE public.milk_data ADD COLUMN status TEXT;
  END IF;
END
$$;

-- 5. Ensure quality column exists (it should from the earlier migration, but guard anyway)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='milk_data' AND column_name='quality'
  ) THEN
    ALTER TABLE public.milk_data ADD COLUMN quality REAL;
  END IF;
END
$$;

-- 6. Ensure tx_hash column exists (blockchain log)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='milk_data' AND column_name='tx_hash'
  ) THEN
    ALTER TABLE public.milk_data ADD COLUMN tx_hash TEXT;
  END IF;
END
$$;

-- 7. Add channel_hash column (SHA-256 hex of all 14 channel values — logged on-chain)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='milk_data' AND column_name='channel_hash'
  ) THEN
    ALTER TABLE public.milk_data ADD COLUMN channel_hash TEXT;
  END IF;
END
$$;

-- 8. Make sure RLS is on
ALTER TABLE public.milk_data ENABLE ROW LEVEL SECURITY;

-- 9. Anon INSERT (ESP32 hardware posts without auth)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename='milk_data' AND policyname='anon_insert_milk_data'
  ) THEN
    CREATE POLICY "anon_insert_milk_data" ON public.milk_data
      AS PERMISSIVE FOR INSERT
      TO anon
      WITH CHECK (true);
  END IF;
END
$$;

-- 10. Authenticated SELECT (web dashboard reads)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename='milk_data' AND policyname='authenticated_select_milk_data'
  ) THEN
    CREATE POLICY "authenticated_select_milk_data" ON public.milk_data
      AS PERMISSIVE FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END
$$;

-- 11. Authenticated UPDATE (blockchain server action writes tx_hash back)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename='milk_data' AND policyname='authenticated_update_milk_data'
  ) THEN
    CREATE POLICY "authenticated_update_milk_data" ON public.milk_data
      AS PERMISSIVE FOR UPDATE
      TO authenticated
      USING (true)
      WITH CHECK (true);
  END IF;
END
$$;

-- 12. Replica identity so Realtime broadcasts full row diffs
ALTER TABLE public.milk_data REPLICA IDENTITY FULL;

-- 13. Add to realtime publication
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname='supabase_realtime' AND tablename='milk_data'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.milk_data;
  END IF;
END
$$;
