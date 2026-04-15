-- Supabase Migration: milk_data table setup for ESP32 hardware + Realtime + Blockchain

-- 0. Create milk_data table if it doesn't already exist
CREATE TABLE IF NOT EXISTS public.milk_data (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    quality REAL NOT NULL,
    tx_hash TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 1. Add tx_hash column to milk_data if it doesn't exist
--    (handles the case where table was created without it)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema='public' AND table_name='milk_data' AND column_name='tx_hash'
    ) THEN
        ALTER TABLE public.milk_data ADD COLUMN tx_hash TEXT;
    END IF;
END
$$;

-- 2. Enable Row Level Security
ALTER TABLE public.milk_data ENABLE ROW LEVEL SECURITY;

-- 3. Allow anonymous hardware (ESP32) to INSERT
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename='milk_data' AND policyname='Enable insert for anonymous hardware'
    ) THEN
        CREATE POLICY "Enable insert for anonymous hardware" ON public.milk_data
        AS PERMISSIVE FOR INSERT
        TO anon
        WITH CHECK (true);
    END IF;
END
$$;

-- 4. Allow authenticated users to SELECT
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename='milk_data' AND policyname='Enable read access for authenticated apps'
    ) THEN
        CREATE POLICY "Enable read access for authenticated apps" ON public.milk_data
        AS PERMISSIVE FOR SELECT
        TO authenticated
        USING (true);
    END IF;
END
$$;

-- 5. Allow authenticated users to UPDATE (so tx_hash can be written back)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename='milk_data' AND policyname='Enable updates for authenticated users'
    ) THEN
        CREATE POLICY "Enable updates for authenticated users" ON public.milk_data
        AS PERMISSIVE FOR UPDATE
        TO authenticated
        USING (true)
        WITH CHECK (true);
    END IF;
END
$$;

-- 6. Set Replica Identity FULL for Realtime to broadcast complete row data
ALTER TABLE public.milk_data REPLICA IDENTITY FULL;

-- 7. Add milk_data to the realtime publication if not already added
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime' AND tablename = 'milk_data'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.milk_data;
    END IF;
END
$$;
