-- Run this in Supabase Dashboard -> SQL Editor -> New query
-- 1) Table
create table if not exists public.postal_codes (
  id           bigint generated always as identity primary key,
  country_code text not null,
  postal_code  text not null,
  place_name   text,
  admin_name1  text,
  admin_name2  text,
  admin_name3  text,
  lat          double precision,
  lng          double precision
);

-- Fast lookups for the static build
create index if not exists idx_postal_codes_country_postal
  on public.postal_codes (country_code, postal_code);

-- 2) Row Level Security: public read-only
alter table public.postal_codes enable row level security;

drop policy if exists "public read" on public.postal_codes;
create policy "public read" on public.postal_codes
  for select using (true);

-- 3) TEMPORARY insert policy so the local loader script can upload data
--    with the publishable (anon) key. DROP THIS after the load finishes:
--      drop policy "temp load insert" on public.postal_codes;
drop policy if exists "temp load insert" on public.postal_codes;
create policy "temp load insert" on public.postal_codes
  for insert with check (true);

-- 4) Views for Server-Side Rendering (SSR) dynamic statistics
create or replace view public.state_stats as
select
  country_code,
  admin_name1 as state_name,
  count(distinct admin_name2) as district_count,
  count(distinct postal_code) as pin_count,
  count(*) as place_count
from public.postal_codes
group by country_code, admin_name1;

create or replace view public.district_stats as
select
  country_code,
  admin_name1 as state_name,
  admin_name2 as district_name,
  count(distinct postal_code) as pin_count,
  count(*) as place_count
from public.postal_codes
group by country_code, admin_name1, admin_name2;

-- 5) Performance Indexes for Views & Autocomplete Search
create index if not exists idx_postal_codes_country_state
  on public.postal_codes (country_code, admin_name1);

create index if not exists idx_postal_codes_country_state_district
  on public.postal_codes (country_code, admin_name1, admin_name2);

create index if not exists idx_postal_codes_country_place
  on public.postal_codes (country_code, place_name);
