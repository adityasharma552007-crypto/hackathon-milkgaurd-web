-- ALTER PROFILES TABLE to support Google OAuth and comprehensive profile completion

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS email text,
ADD COLUMN IF NOT EXISTS avatar_url text,
ADD COLUMN IF NOT EXISTS role text DEFAULT 'consumer',
ADD COLUMN IF NOT EXISTS provider text DEFAULT 'google',
ADD COLUMN IF NOT EXISTS profile_complete boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Replace the existing handle_new_user() trigger function to extract avatar and email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, avatar_url, provider)
  VALUES (
    new.id, 
    -- 'full_name' might come from metadata or we optionally coalesce
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'), 
    new.email, -- email from auth.users
    new.raw_user_meta_data->>'avatar_url',
    -- Assume google if oauth, else email. Defaulting to 'google' via table construct, but let's be explicit
    COALESCE(new.raw_user_meta_data->>'provider', 'google')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
