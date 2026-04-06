-- iot_devices: stores paired ESP device info per user
create table if not exists public.iot_devices (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references public.profiles(id) on delete cascade not null,
  device_id     text not null,          -- e.g. "MG-001" from firmware
  display_name  text,                   -- user-set friendly name
  ip_address    text not null,
  port          int  default 8080,
  firmware      text,
  model         text,
  last_seen     timestamptz,
  created_at    timestamptz default now(),
  unique (user_id, ip_address)          -- one record per device per user
);

alter table public.iot_devices enable row level security;

create policy "own devices"
  on public.iot_devices for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- iot_test_sessions: each hardware-initiated test run
create table if not exists public.iot_test_sessions (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references public.profiles(id) on delete cascade not null,
  device_id     text,                   -- ESP device_id
  scan_id       uuid references public.scans(id), -- populated after save
  raw_payload   jsonb,                  -- full JSON from device
  duration_ms   int,
  started_at    timestamptz default now(),
  completed_at  timestamptz
);

alter table public.iot_test_sessions enable row level security;

create policy "own sessions"
  on public.iot_test_sessions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
