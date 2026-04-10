-- Add blockchain transaction hash to scans table
ALTER TABLE public.scans ADD COLUMN IF NOT EXISTS tx_hash text;

-- Index for fast lookup of verified scans
CREATE INDEX IF NOT EXISTS idx_scans_tx_hash ON public.scans(tx_hash) WHERE tx_hash IS NOT NULL;
