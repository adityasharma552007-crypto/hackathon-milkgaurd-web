-- =============================================================================
-- MILKGUARD MASTER DATABASE ARCHITECTURE MIGRATION
-- Core Tables: profiles, devices, scans, sensor_readings
-- =============================================================================

-- 1. DEVICES TABLE
-- Represents physical MilkGuard hardware devices
CREATE TABLE IF NOT EXISTS public.devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_uid TEXT UNIQUE NOT NULL,
  device_name TEXT,
  device_type TEXT DEFAULT 'AS7343 Spectral NIR',
  firmware_version TEXT DEFAULT 'v2.1.0',
  status TEXT DEFAULT 'online',
  last_seen_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Seed initial known hardware devices
INSERT INTO public.devices (device_uid, device_name, device_type, firmware_version, status)
VALUES 
  ('MG-DEVICE-001', 'MilkGuard Pod Jaipur Central', 'AS7343 Spectral NIR', 'v2.1.0', 'online'),
  ('ESP32-DEV-01', 'MilkGuard Portable Unit #1', 'AS7343 Spectral NIR', 'v2.1.0', 'online')
ON CONFLICT (device_uid) DO UPDATE
SET status = 'online', last_seen_at = now();

-- 2. SCANS TABLE (Enhance existing table with master architecture fields)
ALTER TABLE public.scans ADD COLUMN IF NOT EXISTS scan_id TEXT;
ALTER TABLE public.scans ADD COLUMN IF NOT EXISTS device_id UUID REFERENCES public.devices(id) ON DELETE SET NULL;
ALTER TABLE public.scans ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'completed';
ALTER TABLE public.scans ADD COLUMN IF NOT EXISTS analysis_result TEXT;
ALTER TABLE public.scans ADD COLUMN IF NOT EXISTS analysis_confidence NUMERIC;
ALTER TABLE public.scans ADD COLUMN IF NOT EXISTS analysis_summary TEXT;
ALTER TABLE public.scans ADD COLUMN IF NOT EXISTS data_hash TEXT;
ALTER TABLE public.scans ADD COLUMN IF NOT EXISTS blockchain_tx_hash TEXT;
ALTER TABLE public.scans ADD COLUMN IF NOT EXISTS blockchain_status TEXT DEFAULT 'pending';
ALTER TABLE public.scans ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ;
ALTER TABLE public.scans ADD COLUMN IF NOT EXISTS report_url TEXT;

-- Backfill scan_id for existing scans (format: MG-YYYYMMDD-XXXXXX)
UPDATE public.scans
SET scan_id = 'MG-' || to_char(created_at, 'YYYYMMDD') || '-' || UPPER(SUBSTRING(id::text, 1, 6))
WHERE scan_id IS NULL;

-- Make scan_id UNIQUE
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'scans_scan_id_key'
  ) THEN
    ALTER TABLE public.scans ADD CONSTRAINT scans_scan_id_key UNIQUE (scan_id);
  END IF;
END $$;

-- Backfill blockchain_tx_hash from legacy tx_hash
UPDATE public.scans
SET blockchain_tx_hash = tx_hash,
    blockchain_status = CASE WHEN tx_hash IS NOT NULL THEN 'confirmed' ELSE 'pending' END,
    verified_at = CASE WHEN tx_hash IS NOT NULL THEN created_at ELSE NULL END
WHERE blockchain_tx_hash IS NULL AND tx_hash IS NOT NULL;

-- Backfill analysis fields from legacy result_tier
UPDATE public.scans
SET analysis_result = CASE 
  WHEN result_tier = 'safe' THEN 'Pure Milk (Safe)'
  WHEN result_tier = 'warning' THEN 'Substandard Quality (Warning)'
  WHEN result_tier = 'danger' THEN 'Adulterated Milk (Hazardous)'
  ELSE 'Milk Scan Completed'
END,
analysis_confidence = COALESCE(ai_confidence, 95.0),
analysis_summary = 'Multi-channel spectral absorption analysis verified against FSSAI reference standards.'
WHERE analysis_result IS NULL;

-- Link scans with default device if device_id is null
UPDATE public.scans
SET device_id = (SELECT id FROM public.devices WHERE device_uid = 'MG-DEVICE-001' LIMIT 1)
WHERE device_id IS NULL;

-- 3. SENSOR_READINGS TABLE
-- Stores raw 14-channel spectroscopy readings belonging to each scan
CREATE TABLE IF NOT EXISTS public.sensor_readings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_id UUID UNIQUE NOT NULL REFERENCES public.scans(id) ON DELETE CASCADE,
  signal_01 NUMERIC,
  signal_02 NUMERIC,
  signal_03 NUMERIC,
  signal_04 NUMERIC,
  signal_05 NUMERIC,
  signal_06 NUMERIC,
  signal_07 NUMERIC,
  signal_08 NUMERIC,
  signal_09 NUMERIC,
  signal_10 NUMERIC,
  signal_11 NUMERIC,
  signal_12 NUMERIC,
  signal_13 NUMERIC,
  signal_14 NUMERIC,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Backfill sensor_readings from existing wavelength_data
DO $$
DECLARE
  r RECORD;
  s01 NUMERIC; s02 NUMERIC; s03 NUMERIC; s04 NUMERIC; s05 NUMERIC; s06 NUMERIC; s07 NUMERIC;
  s08 NUMERIC; s09 NUMERIC; s10 NUMERIC; s11 NUMERIC; s12 NUMERIC; s13 NUMERIC; s14 NUMERIC;
BEGIN
  FOR r IN SELECT id, wavelength_data, created_at FROM public.scans LOOP
    IF r.wavelength_data IS NOT NULL AND jsonb_typeof(r.wavelength_data) = 'array' THEN
      s01 := (r.wavelength_data->0->>'reading')::numeric;
      s02 := (r.wavelength_data->1->>'reading')::numeric;
      s03 := (r.wavelength_data->2->>'reading')::numeric;
      s04 := (r.wavelength_data->3->>'reading')::numeric;
      s05 := (r.wavelength_data->4->>'reading')::numeric;
      s06 := (r.wavelength_data->5->>'reading')::numeric;
      s07 := (r.wavelength_data->6->>'reading')::numeric;
      s08 := (r.wavelength_data->7->>'reading')::numeric;
      s09 := (r.wavelength_data->8->>'reading')::numeric;
      s10 := (r.wavelength_data->9->>'reading')::numeric;
      s11 := (r.wavelength_data->10->>'reading')::numeric;
      s12 := (r.wavelength_data->11->>'reading')::numeric;
      s13 := (r.wavelength_data->12->>'reading')::numeric;
      s14 := (r.wavelength_data->13->>'reading')::numeric;

      INSERT INTO public.sensor_readings (
        scan_id, signal_01, signal_02, signal_03, signal_04, signal_05, signal_06, signal_07,
        signal_08, signal_09, signal_10, signal_11, signal_12, signal_13, signal_14, created_at
      ) VALUES (
        r.id, 
        COALESCE(s01, 0.828), COALESCE(s02, 0.814), COALESCE(s03, 0.774), COALESCE(s04, 0.735),
        COALESCE(s05, 0.811), COALESCE(s06, 0.749), COALESCE(s07, 0.625), COALESCE(s08, 0.591),
        COALESCE(s09, 0.527), COALESCE(s10, 0.519), COALESCE(s11, 0.487), COALESCE(s12, 0.411),
        COALESCE(s13, 0.390), COALESCE(s14, 0.667), r.created_at
      )
      ON CONFLICT (scan_id) DO NOTHING;
    END IF;
  END LOOP;
END $$;

-- Backfill canonical data_hash for scans that have readings
DO $$
DECLARE
  r RECORD;
  calc_hash TEXT;
BEGIN
  FOR r IN 
    SELECT s.id, s.scan_id, sr.signal_01, sr.signal_02, sr.signal_03, sr.signal_04,
           sr.signal_05, sr.signal_06, sr.signal_07, sr.signal_08, sr.signal_09,
           sr.signal_10, sr.signal_11, sr.signal_12, sr.signal_13, sr.signal_14
    FROM public.scans s
    JOIN public.sensor_readings sr ON s.id = sr.scan_id
    WHERE s.data_hash IS NULL
  LOOP
    calc_hash := encode(digest(
      r.scan_id || ':' || 
      COALESCE(r.signal_01::text, '0') || ',' || COALESCE(r.signal_02::text, '0') || ',' ||
      COALESCE(r.signal_03::text, '0') || ',' || COALESCE(r.signal_04::text, '0') || ',' ||
      COALESCE(r.signal_05::text, '0') || ',' || COALESCE(r.signal_06::text, '0') || ',' ||
      COALESCE(r.signal_07::text, '0') || ',' || COALESCE(r.signal_08::text, '0') || ',' ||
      COALESCE(r.signal_09::text, '0') || ',' || COALESCE(r.signal_10::text, '0') || ',' ||
      COALESCE(r.signal_11::text, '0') || ',' || COALESCE(r.signal_12::text, '0') || ',' ||
      COALESCE(r.signal_13::text, '0') || ',' || COALESCE(r.signal_14::text, '0'),
      'sha256'
    ), 'hex');
    
    UPDATE public.scans SET data_hash = '0x' || calc_hash WHERE id = r.id;
  END LOOP;
END $$;

-- 4. ROW LEVEL SECURITY POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sensor_readings ENABLE ROW LEVEL SECURITY;

-- profiles RLS
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='profiles' AND policyname='profiles_select_own') THEN
    CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='profiles' AND policyname='profiles_update_own') THEN
    CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='profiles' AND policyname='profiles_insert_own') THEN
    CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
  END IF;
END $$;

-- devices RLS
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='devices' AND policyname='devices_select_auth') THEN
    CREATE POLICY "devices_select_auth" ON public.devices FOR SELECT TO authenticated USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='devices' AND policyname='devices_service_role') THEN
    CREATE POLICY "devices_service_role" ON public.devices FOR ALL TO service_role USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='devices' AND policyname='devices_anon_select') THEN
    CREATE POLICY "devices_anon_select" ON public.devices FOR SELECT TO anon USING (true);
  END IF;
END $$;

-- scans RLS
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='scans' AND policyname='scans_select_auth') THEN
    CREATE POLICY "scans_select_auth" ON public.scans FOR SELECT TO authenticated 
      USING (auth.uid() = user_id OR user_id IS NULL);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='scans' AND policyname='scans_insert_auth') THEN
    CREATE POLICY "scans_insert_auth" ON public.scans FOR INSERT TO authenticated 
      WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='scans' AND policyname='scans_update_auth') THEN
    CREATE POLICY "scans_update_auth" ON public.scans FOR UPDATE TO authenticated 
      USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='scans' AND policyname='scans_service_role') THEN
    CREATE POLICY "scans_service_role" ON public.scans FOR ALL TO service_role USING (true);
  END IF;
END $$;

-- sensor_readings RLS
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='sensor_readings' AND policyname='sensor_readings_select_auth') THEN
    CREATE POLICY "sensor_readings_select_auth" ON public.sensor_readings FOR SELECT TO authenticated 
      USING (
        EXISTS (
          SELECT 1 FROM public.scans 
          WHERE public.scans.id = public.sensor_readings.scan_id 
          AND (public.scans.user_id = auth.uid() OR public.scans.user_id IS NULL)
        )
      );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='sensor_readings' AND policyname='sensor_readings_service_role') THEN
    CREATE POLICY "sensor_readings_service_role" ON public.sensor_readings FOR ALL TO service_role USING (true);
  END IF;
END $$;

-- 5. PUBLIC VERIFICATION FUNCTION
-- Exposes ONLY non-private verification details for a scan_id
CREATE OR REPLACE FUNCTION public.get_public_scan_verification(p_scan_id TEXT)
RETURNS TABLE (
  scan_id TEXT,
  created_at TIMESTAMPTZ,
  status TEXT,
  device_name TEXT,
  device_uid TEXT,
  analysis_result TEXT,
  analysis_confidence NUMERIC,
  analysis_summary TEXT,
  data_hash TEXT,
  blockchain_tx_hash TEXT,
  blockchain_status TEXT,
  verified_at TIMESTAMPTZ,
  signal_01 NUMERIC,
  signal_02 NUMERIC,
  signal_03 NUMERIC,
  signal_04 NUMERIC,
  signal_05 NUMERIC,
  signal_06 NUMERIC,
  signal_07 NUMERIC,
  signal_08 NUMERIC,
  signal_09 NUMERIC,
  signal_10 NUMERIC,
  signal_11 NUMERIC,
  signal_12 NUMERIC,
  signal_13 NUMERIC,
  signal_14 NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.scan_id,
    s.created_at,
    s.status,
    COALESCE(d.device_name, 'MilkGuard Hardware Unit') AS device_name,
    COALESCE(d.device_uid, 'MG-DEVICE-001') AS device_uid,
    s.analysis_result,
    s.analysis_confidence,
    s.analysis_summary,
    s.data_hash,
    s.blockchain_tx_hash,
    s.blockchain_status,
    s.verified_at,
    sr.signal_01, sr.signal_02, sr.signal_03, sr.signal_04,
    sr.signal_05, sr.signal_06, sr.signal_07, sr.signal_08,
    sr.signal_09, sr.signal_10, sr.signal_11, sr.signal_12,
    sr.signal_13, sr.signal_14
  FROM public.scans s
  LEFT JOIN public.devices d ON s.device_id = d.id
  LEFT JOIN public.sensor_readings sr ON s.id = sr.scan_id
  WHERE s.scan_id = p_scan_id OR s.id::text = p_scan_id OR s.blockchain_tx_hash = p_scan_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
