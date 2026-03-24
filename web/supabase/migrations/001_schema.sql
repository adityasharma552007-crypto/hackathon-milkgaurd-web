-- PROFILES
create table public.profiles (
  id            uuid references auth.users primary key,
  full_name     text,
  phone         text,
  city          text default 'Jaipur',
  area          text,
  pod_id        text,
  total_scans   int default 0,
  safe_scans    int default 0,
  created_at    timestamptz default now()
);

-- VENDORS
create table public.vendors (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  area            text,
  city            text default 'Jaipur',
  lat             float,
  lng             float,
  avg_score       float default 0,
  total_scans     int default 0,
  is_flagged      boolean default false,
  created_at      timestamptz default now()
);

-- SCANS
create table public.scans (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid references public.profiles(id),
  vendor_id        uuid references public.vendors(id),
  safety_score     int not null,
  result_tier      text check (result_tier in
                   ('safe','warning','danger','hazard')),
  ai_confidence    float,
  scan_duration    float,
  wavelength_data  jsonb,
  baseline_data    jsonb,
  adulterants      jsonb,
  recommendation   text,
  created_at       timestamptz default now()
);

-- ADULTERANT RESULTS
create table public.adulterant_results (
  id               uuid primary key default gen_random_uuid(),
  scan_id          uuid references public.scans(id)
                   on delete cascade,
  name             text not null,
  detected_value   float default 0,
  safe_limit       float default 0,
  unit             text default '%',
  status           text check (status in
                   ('safe','warning','danger','hazard','clear')),
  quantity_500ml   float,
  analogy          text
);

-- FSSAI REPORTS  
create table public.fssai_reports (
  id               uuid primary key default gen_random_uuid(),
  scan_id          uuid references public.scans(id),
  user_id          uuid references public.profiles(id),
  vendor_id        uuid references public.vendors(id),
  complaint_ref    text unique,
  status           text default 'submitted',
  auto_triggered   boolean default false,
  notes            text,
  created_at       timestamptz default now()
);

-- AREA ALERTS
create table public.area_alerts (
  id               uuid primary key default gen_random_uuid(),
  area_name        text,
  lat              float,
  lng              float,
  radius_km        float default 5,
  alert_type       text default 'adulteration',
  description      text,
  active_until     timestamptz,
  created_at       timestamptz default now()
);

-- TRIGGER: auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ACTION: RPC to increment scans
create or replace function public.increment_user_scans(
  p_user_id uuid,
  p_is_safe boolean
) returns void as $$
begin
  update public.profiles
  set
    total_scans = total_scans + 1,
    safe_scans = safe_scans + (case when p_is_safe then 1 else 0 end)
  where id = p_user_id;
end;
$$ language plpgsql security definer;

-- TRIGGER: update vendor avg score after scan
create or replace function public.update_vendor_score()
returns trigger as $$
begin
  update public.vendors
  set 
    avg_score = (
      select coalesce(avg(safety_score), 0)
      from public.scans 
      where vendor_id = new.vendor_id
    ),
    total_scans = (
      select count(*)
      from public.scans
      where vendor_id = new.vendor_id
    ),
    is_flagged = (
      select coalesce(avg(safety_score), 100) < 40
      from public.scans
      where vendor_id = new.vendor_id
    )
  where id = new.vendor_id;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_scan_created
  after insert on public.scans
  for each row execute procedure public.update_vendor_score();

-- TRIGGER: auto-flag FSSAI on hazardous scan
create or replace function public.auto_fssai_report()
returns trigger as $$
begin
  if new.result_tier = 'hazard' then
    insert into public.fssai_reports
      (scan_id, user_id, vendor_id, auto_triggered,
       complaint_ref)
    values (
      new.id, new.user_id, new.vendor_id, true,
      'MG-' || to_char(now(),'YYYYMMDD') || '-' 
      || lpad(floor(random()*99999)::text, 5, '0')
    );
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_hazardous_scan
  after insert on public.scans
  for each row execute procedure public.auto_fssai_report();

-- ROW LEVEL SECURITY
alter table public.profiles           enable row level security;
alter table public.scans              enable row level security;
alter table public.adulterant_results enable row level security;
alter table public.fssai_reports      enable row level security;
alter table public.vendors            enable row level security;
alter table public.area_alerts        enable row level security;

create policy "own profile" on public.profiles
  for all using (auth.uid() = id);

create policy "own scans" on public.scans
  for all using (auth.uid() = user_id);

create policy "own adulterant results"
  on public.adulterant_results for select
  using (scan_id in (
    select id from public.scans where user_id = auth.uid()
  ));

create policy "own reports" on public.fssai_reports
  for all using (auth.uid() = user_id);

create policy "vendors public read"
  on public.vendors for select using (true);

create policy "alerts public read"
  on public.area_alerts for select using (true);

-- SEED: Jaipur vendor data
insert into public.vendors 
  (name, area, city, lat, lng, avg_score, total_scans)
values
  ('Ramesh Dairy','Vaishali Nagar','Jaipur',
   26.9124,75.7397,89,47),
  ('Shree Dairy Point','Mansarovar','Jaipur',
   26.8476,75.7433,72,31),
  ('Gau Seva Milk','Malviya Nagar','Jaipur',
   26.8538,75.8022,91,63),
  ('City Dairy Hub','C-Scheme','Jaipur',
   26.9094,75.8007,38,19),
  ('Vishnu Milk Center','Sanganer','Jaipur',
   26.7921,75.8019,55,28),
  ('Fresh Farm Dairy','Pratap Nagar','Jaipur',
   26.8234,75.8156,82,44),
  ('Jai Dairy','Nirman Nagar','Jaipur',
   26.9278,75.7544,66,22),
  ('Pure Milk Co.','Tonk Road','Jaipur',
   26.8642,75.8234,93,71);
