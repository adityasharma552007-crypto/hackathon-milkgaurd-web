-- Migration: Auto-convert ESP32 milk_data readings into full scans
-- Every INSERT into milk_data triggers a corresponding row in scans
-- Hardware scans are visible to ALL authenticated users (no user_id filter)

-- 1. Add source_hardware_id column to scans table (nullable, tracks origin)
ALTER TABLE public.scans 
ADD COLUMN IF NOT EXISTS source_hardware_id UUID REFERENCES public.milk_data(id);

-- 2. Update RLS on scans to allow all authenticated users to READ hardware scans
-- (hardware scans have user_id = NULL, so the existing "own scans" policy excludes them)
DROP POLICY IF EXISTS "hardware scans visible to all" ON public.scans;
CREATE POLICY "hardware scans visible to all" ON public.scans
  FOR SELECT
  TO authenticated
  USING (source_hardware_id IS NOT NULL);

-- 3. The core mapping function: milk_data quality → scans row
CREATE OR REPLACE FUNCTION public.fn_hardware_reading_to_scan()
RETURNS TRIGGER AS $$
DECLARE
  v_safety_score   INT;
  v_result_tier    TEXT;
  v_recommendation TEXT;
BEGIN
  -- Map quality float to safety_score (0–100 int)
  v_safety_score := ROUND(NEW.quality * 100)::INT;

  -- Derive result_tier and recommendation from quality bands
  IF NEW.quality >= 0.7 AND NEW.quality <= 0.9 THEN
    v_result_tier    := 'safe';
    v_recommendation := 'Milk sample is within normal purity parameters. No adulterants detected by hardware sensor. Safe for consumption.';

  ELSIF NEW.quality >= 0.2 AND NEW.quality <= 0.4 THEN
    v_result_tier    := 'danger';
    v_recommendation := 'Hardware sensor detected significant quality deviation. Possible adulteration or spoilage. Do not consume. Report to your supplier immediately.';

  ELSE
    v_result_tier    := 'warning';
    v_recommendation := 'Sensor reading is outside expected pure milk range but not conclusively adulterated. Recommend re-testing or manual lab verification.';
  END IF;

  -- Insert a full scans row (user_id = NULL → hardware scan, no vendor association)
  INSERT INTO public.scans (
    user_id,
    vendor_id,
    safety_score,
    result_tier,
    ai_confidence,
    scan_duration,
    wavelength_data,
    recommendation,
    source_hardware_id,
    created_at
  ) VALUES (
    NULL,                                  -- no user; hardware scan
    NULL,                                  -- no vendor; direct ESP32 reading
    v_safety_score,                        -- derived from quality
    v_result_tier,                         -- 'safe' | 'warning' | 'danger'
    95.0,                                  -- hardware confidence (fixed, sensor-grade)
    0.5,                                   -- sensor read duration (seconds)
    jsonb_build_object(                    -- minimal spectral placeholder
      'source', 'ESP32 Hardware Sensor',
      'quality_raw', NEW.quality,
      'band', 'NIR',
      'channels', 1,
      'note', 'Hardware reading — no spectral decomposition available'
    ),
    v_recommendation,
    NEW.id,                                -- link back to milk_data row
    NEW.created_at
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Drop and recreate the trigger cleanly (idempotent)
DROP TRIGGER IF EXISTS on_milk_data_insert ON public.milk_data;
CREATE TRIGGER on_milk_data_insert
  AFTER INSERT ON public.milk_data
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_hardware_reading_to_scan();
