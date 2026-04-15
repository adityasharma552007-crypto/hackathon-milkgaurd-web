-- Backfill: Convert existing milk_data rows into scans entries
-- Only uses columns guaranteed to exist in the base schema

INSERT INTO public.scans (
  user_id,
  vendor_id,
  safety_score,
  result_tier,
  ai_confidence,
  scan_duration,
  wavelength_data,
  source_hardware_id,
  created_at
)
SELECT
  NULL,
  NULL,
  ROUND(md.quality * 100)::INT,
  CASE
    WHEN md.quality >= 0.7 AND md.quality <= 0.9 THEN 'safe'
    WHEN md.quality >= 0.2 AND md.quality <= 0.4 THEN 'danger'
    ELSE 'warning'
  END,
  95.0,
  0.5,
  jsonb_build_object('source', 'ESP32', 'quality_raw', md.quality),
  md.id,
  md.created_at
FROM public.milk_data md
WHERE NOT EXISTS (
  SELECT 1 FROM public.scans s WHERE s.source_hardware_id = md.id
);
