-- Lactation Feed Calculator — initial schema
-- Tables: sows, farrowings, feeding_config
-- Ownership model: single shared family login, `user_id = auth.uid()` (no
-- farm_id/memberships in v1 — see design.md "Auth / multi-user (RLS)").

-- ---------------------------------------------------------------------------
-- sows
-- ---------------------------------------------------------------------------
create table if not exists public.sows (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null,
  birth_date date,
  status text not null default 'active'
    check (status in ('active', 'sold', 'culled', 'dead')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.sows is 'Breeding sows registered by the family.';

create index if not exists sows_user_id_idx on public.sows (user_id);

alter table public.sows enable row level security;

create policy "sows_select_own" on public.sows
  for select using (auth.uid() = user_id);

create policy "sows_insert_own" on public.sows
  for insert with check (auth.uid() = user_id);

create policy "sows_update_own" on public.sows
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "sows_delete_own" on public.sows
  for delete using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- farrowings
-- ---------------------------------------------------------------------------
create table if not exists public.farrowings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  sow_id uuid not null references public.sows (id) on delete cascade,
  farrowing_date date not null,
  born_alive integer not null check (born_alive >= 0),
  -- Editable live counter; cross-fostering between litters is allowed, so
  -- this is intentionally NOT constrained to <= born_alive.
  current_piglets integer not null check (current_piglets >= 0),
  status text not null default 'lactating'
    check (status in ('lactating', 'weaned', 'closed')),
  weaning_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.farrowings is 'A farrowing (parto) linked to a sow; current_piglets is a live editable counter with no mortality event history (v1 scope).';

create index if not exists farrowings_user_id_idx on public.farrowings (user_id);
create index if not exists farrowings_sow_id_idx on public.farrowings (sow_id);

-- One active (lactating) litter per sow at a time.
create unique index if not exists farrowings_one_lactating_per_sow
  on public.farrowings (sow_id)
  where (status = 'lactating');

alter table public.farrowings enable row level security;

create policy "farrowings_select_own" on public.farrowings
  for select using (auth.uid() = user_id);

create policy "farrowings_insert_own" on public.farrowings
  for insert with check (auth.uid() = user_id);

create policy "farrowings_update_own" on public.farrowings
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "farrowings_delete_own" on public.farrowings
  for delete using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- feeding_config
-- ---------------------------------------------------------------------------
create table if not exists public.feeding_config (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique default auth.uid() references auth.users (id) on delete cascade,
  base_kg numeric(4, 2) not null default 2.00 check (base_kg >= 0),
  kg_per_piglet numeric(4, 2) not null default 0.40 check (kg_per_piglet >= 0),
  updated_at timestamptz not null default now()
);

comment on table public.feeding_config is 'Exactly one current feeding config row per user; no historical versions (v1 scope).';

alter table public.feeding_config enable row level security;

create policy "feeding_config_select_own" on public.feeding_config
  for select using (auth.uid() = user_id);

create policy "feeding_config_insert_own" on public.feeding_config
  for insert with check (auth.uid() = user_id);

create policy "feeding_config_update_own" on public.feeding_config
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "feeding_config_delete_own" on public.feeding_config
  for delete using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- updated_at maintenance
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger sows_set_updated_at
  before update on public.sows
  for each row execute function public.set_updated_at();

create trigger farrowings_set_updated_at
  before update on public.farrowings
  for each row execute function public.set_updated_at();

create trigger feeding_config_set_updated_at
  before update on public.feeding_config
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Default feeding_config provisioning (spec: "Provide default config")
-- ---------------------------------------------------------------------------
-- Every new authenticated user gets a default feeding_config row created
-- automatically, so the app can always assume exactly one current row
-- exists per user without a "create on first read" race in application code.
create or replace function public.handle_new_user_feeding_config()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.feeding_config (user_id)
  values (new.id)
  on conflict (user_id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created_feeding_config
  after insert on auth.users
  for each row execute function public.handle_new_user_feeding_config();
