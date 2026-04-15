-- Backfill: Convert all existing milk_data rows that don't yet have a scans entry
-- The trigger only fires on NEW inserts, so we must manually process existing rows.

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
)
SELECT
  NULL,                                -- no user; hardware scan
  NULL,                                -- no vendor
  ROUND(md.quality * 100)::INT,        -- quality → safety_score
  CASE
    WHEN md.quality >= 0.7 AND md.quality <= 0.9 THEN 'safe'
    WHEN md.quality >= 0.2 AND md.quality <= 0.4 THEN 'danger'
    ELSE 'warning'
  END,                                 -- result_tier
  95.0,                                -- hardware confidence
  0.5,                                 -- sensor read duration
  jsonb_build_object(
    'source', 'ESP32 Hardware Sensor',
    'quality_raw', md.quality,
    'band', 'NIR',
    'channels', 1,
    'note', 'Hardware reading — no spectral decomposition available'
  ),                                   -- wavelength_data placeholder
  CASE
    WHEN md.quality >= 0.7 AND md.quality <= 0.9
      THEN 'Milk sample is within normal purity parameters. No adulterants detected by hardware sensor. Safe for consumption.'
    WHEN md.quality >= 0.2 AND md.quality <= 0.4
      THEN 'Hardware sensor detected significant quality deviation. Possible adulteration or spoilage. Do not consume. Report to your supplier immediately.'
    ELSE
      'Sensor reading is outside expected pure milk range but not conclusively adulterated. Recommend re-testing or manual lab verification.'
  END,                                 -- recommendation
  md.id,                               -- link back to milk_data row
  md.created_at
FROM public.milk_data md
WHERE NOT EXISTS (
  -- Only insert if a scans row for this milk_data id doesn't already exist
  SELECT 1 FROM public.scans s WHERE s.source_hardware_id = md.id
);
