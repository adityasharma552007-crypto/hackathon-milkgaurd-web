-- FINAL corrected trigger for milk_data → scans conversion
-- WITHOUT adulterants and recommendation columns (they don't exist in the live DB)

-- Drop old versions
DROP TRIGGER IF EXISTS on_milk_data_insert ON public.milk_data;
DROP FUNCTION IF EXISTS public.fn_hardware_reading_to_scan();

-- Recreate function with only valid columns
CREATE OR REPLACE FUNCTION public.fn_hardware_reading_to_scan()
RETURNS TRIGGER AS $$
DECLARE
  v_safety_score   INT;
  v_result_tier    TEXT;
BEGIN
  v_safety_score := ROUND(NEW.quality * 100)::INT;

  IF NEW.quality >= 0.7 AND NEW.quality <= 0.9 THEN
    v_result_tier := 'safe';
  ELSIF NEW.quality >= 0.2 AND NEW.quality <= 0.4 THEN
    v_result_tier := 'danger';
  ELSE
    v_result_tier := 'warning';
  END IF;

  INSERT INTO public.scans (
    user_id, vendor_id, safety_score, result_tier,
    ai_confidence, scan_duration, wavelength_data,
    source_hardware_id, created_at
  ) VALUES (
    NULL, NULL,
    v_safety_score, v_result_tier,
    95.0, 0.5,
    jsonb_build_object('source', 'ESP32', 'quality_raw', NEW.quality, 'band', 'NIR'),
    NEW.id, NEW.created_at
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger
CREATE TRIGGER on_milk_data_insert
  AFTER INSERT ON public.milk_data
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_hardware_reading_to_scan();
