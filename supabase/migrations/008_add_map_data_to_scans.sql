-- Migration: Add map location data and adulteration score to scans table
ALTER TABLE public.scans 
ADD COLUMN IF NOT EXISTS latitude float,
ADD COLUMN IF NOT EXISTS longitude float,
ADD COLUMN IF NOT EXISTS adulteration_score float;

-- Backfill data: populate the location based on the linked vendor,
-- and compute the adulteration score based on safety score (100 - safety_score)
UPDATE public.scans s
SET 
  latitude = v.lat,
  longitude = v.lng,
  adulteration_score = 100 - s.safety_score
FROM public.vendors v
WHERE s.vendor_id = v.id;

-- Ensure future scans are properly queried via indexes
CREATE INDEX IF NOT EXISTS idx_scans_location ON public.scans(latitude, longitude) WHERE latitude IS NOT NULL;
