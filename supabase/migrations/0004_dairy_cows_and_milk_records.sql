-- Milk Production Logging for Dairy Cows (Module 3)
-- Tables: dairy_cows, milk_records
-- Ownership model: same as modules 1 and 2, `user_id = auth.uid()` (see
-- supabase/migrations/0001_init.sql). Mirrors 0003's
-- fattening_pigs/weight_checkins shape (parent entity + editable child
-- event-log), with one addition: `UNIQUE (cow_id, record_date)` on
-- milk_records enforces at most one daily total per cow per day — see
-- Engram `sdd/registro-produccion-leche/design`.
--
-- milk_records is unused by application code until PR2 (CRUD + history
-- view); this migration only creates the schema.

-- ---------------------------------------------------------------------------
-- dairy_cows
-- ---------------------------------------------------------------------------
create table if not exists public.dairy_cows (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  ear_tag text not null,
  -- Exit/sold-or-dead marker, mirrors fattening_pigs.exit_date: set once the
  -- cow leaves the herd, removing it from active views without deleting its
  -- row or its milk_records history (spec: "Mark a cow as exited").
  exit_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.dairy_cows is 'Individually ear-tagged dairy cows registered by the family.';

create index if not exists dairy_cows_user_id_idx on public.dairy_cows (user_id);

alter table public.dairy_cows enable row level security;

create policy "dairy_cows_select_own" on public.dairy_cows
  for select using (auth.uid() = user_id);

create policy "dairy_cows_insert_own" on public.dairy_cows
  for insert with check (auth.uid() = user_id);

create policy "dairy_cows_update_own" on public.dairy_cows
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "dairy_cows_delete_own" on public.dairy_cows
  for delete using (auth.uid() = user_id);

create trigger dairy_cows_set_updated_at
  before update on public.dairy_cows
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- milk_records
-- ---------------------------------------------------------------------------
create table if not exists public.milk_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  cow_id uuid not null references public.dairy_cows (id) on delete cascade,
  record_date date not null,
  liters numeric(6, 2) not null check (liters > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Spec: "Record a daily milk total" — one total-liters record per cow per
  -- day (no AM/PM split); a second insert for the same (cow_id, record_date)
  -- MUST be rejected (23505), guiding the user to edit the existing record
  -- instead of creating a duplicate.
  unique (cow_id, record_date)
);

comment on table public.milk_records is 'Daily total-liters milk production log per dairy cow. Editable/deletable (not append-only) so a mistyped total can be corrected, same rationale as weight_checkins.';

create index if not exists milk_records_user_id_idx on public.milk_records (user_id);
create index if not exists milk_records_cow_id_idx on public.milk_records (cow_id);

alter table public.milk_records enable row level security;

create policy "milk_records_select_own" on public.milk_records
  for select using (auth.uid() = user_id);

create policy "milk_records_insert_own" on public.milk_records
  for insert with check (auth.uid() = user_id);

create policy "milk_records_update_own" on public.milk_records
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "milk_records_delete_own" on public.milk_records
  for delete using (auth.uid() = user_id);

create trigger milk_records_set_updated_at
  before update on public.milk_records
  for each row execute function public.set_updated_at();
