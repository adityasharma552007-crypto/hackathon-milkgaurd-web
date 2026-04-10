-- MIGRATION 009: Vendor Reports and Trust Score Mechanism

CREATE TABLE IF NOT EXISTS public.vendor_reports (
  id              uuid primary key default gen_random_uuid(),
  vendor_id       uuid not null references public.vendors(id) on delete cascade,
  user_id         uuid not null references public.profiles(id) on delete cascade,
  issue_type      text not null,
  description     text not null,
  scan_id         uuid references public.scans(id) on delete set null,
  status          text not null default 'pending',
  created_at      timestamptz default now()
);

-- Add report_count cache to vendors
ALTER TABLE public.vendors
ADD COLUMN IF NOT EXISTS report_count int default 0;

-- Function to handle new vendor reports automatically
CREATE OR REPLACE FUNCTION handle_new_vendor_report()
RETURNS TRIGGER AS $$
DECLARE
  new_count int;
  avg_s float;
  new_trust_score float;
BEGIN
  -- Increment cache count
  UPDATE public.vendors
  SET report_count = report_count + 1
  WHERE id = NEW.vendor_id
  RETURNING report_count, avg_score INTO new_count, avg_s;

  -- Recalculate Trust Score inside trigger: Math.round((avg_score * 0.6) + Math.max(0, 40 - (report_count * 5)))
  new_trust_score := ROUND((avg_s * 0.6) + GREATEST(0, (40 - (new_count * 5))));

  -- Flag automatically if score drops below 50
  IF new_trust_score < 50 THEN
    UPDATE public.vendors SET is_flagged = true WHERE id = NEW.vendor_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Bind the trigger
DROP TRIGGER IF EXISTS on_vendor_report_added ON public.vendor_reports;
CREATE TRIGGER on_vendor_report_added
  AFTER INSERT ON public.vendor_reports
  FOR EACH ROW EXECUTE FUNCTION handle_new_vendor_report();

-- Update existing vendors report_count based on historical reports (if any exist later)
UPDATE public.vendors v
SET report_count = (SELECT count(*) FROM public.vendor_reports vr WHERE vr.vendor_id = v.id);
