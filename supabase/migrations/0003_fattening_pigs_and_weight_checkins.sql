-- Weight & Growth Tracking for Fattening Pigs (Module 2)
-- Tables: fattening_pigs, weight_checkins
-- Ownership model: same as module 1, `user_id = auth.uid()` (see
-- supabase/migrations/0001_init.sql). Column names follow the spec's own
-- domain vocabulary (ear_tag, entry_date, entry_weight, checkin_date, weight)
-- rather than translating them, since the spec and tasks artifacts for this
-- module define these as the literal field identifiers, not just UI copy.
--
-- weight_checkins is edit/delete-able (full 4 RLS policies), NOT
-- append-only — see Engram `sdd/control-peso-engorde/design` (revision 2):
-- the farm is a single-user/family login used by hand in the field, and a
-- mistyped weigh-in needs to be correctable. This differs from module 1's
-- `current_piglets` counter, which has an actual business rule
-- (decrement-only) justifying its extra trigger; there is no equivalent
-- rule here.

-- ---------------------------------------------------------------------------
-- fattening_pigs
-- ---------------------------------------------------------------------------
create table if not exists public.fattening_pigs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  ear_tag text not null,
  entry_date date not null,
  entry_weight numeric(6, 2) not null check (entry_weight > 0),
  -- Exit/sold marker, mirrors farrowings.weaning_date: set once the pig is
  -- sold/exited, removing it from active tracking without deleting its row
  -- or its weight_checkins history (spec: "Mark Pig as Sold/Exited").
  exit_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.fattening_pigs is 'Individually ear-tagged fattening pigs registered by the family.';

create index if not exists fattening_pigs_user_id_idx on public.fattening_pigs (user_id);

-- Spec: "Duplicate ear_tag for same user" is only rejected while the earlier
-- pig with that ear_tag is still active (exit_date is null) — a sold pig's
-- ear_tag may be reused by a new pig entering the herd.
create unique index if not exists fattening_pigs_active_ear_tag_per_user
  on public.fattening_pigs (user_id, ear_tag)
  where (exit_date is null);

alter table public.fattening_pigs enable row level security;

create policy "fattening_pigs_select_own" on public.fattening_pigs
  for select using (auth.uid() = user_id);

create policy "fattening_pigs_insert_own" on public.fattening_pigs
  for insert with check (auth.uid() = user_id);

create policy "fattening_pigs_update_own" on public.fattening_pigs
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "fattening_pigs_delete_own" on public.fattening_pigs
  for delete using (auth.uid() = user_id);

create trigger fattening_pigs_set_updated_at
  before update on public.fattening_pigs
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- weight_checkins
-- ---------------------------------------------------------------------------
create table if not exists public.weight_checkins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  fattening_pig_id uuid not null references public.fattening_pigs (id) on delete cascade,
  checkin_date date not null,
  weight numeric(6, 2) not null check (weight > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.weight_checkins is 'Chronological weigh-in log per fattening pig, forming its growth curve. Editable/deletable (not append-only) so a mistyped weigh-in can be corrected — see table comment history in sdd/control-peso-engorde/design.';

create index if not exists weight_checkins_user_id_idx on public.weight_checkins (user_id);
create index if not exists weight_checkins_fattening_pig_id_idx on public.weight_checkins (fattening_pig_id);

alter table public.weight_checkins enable row level security;

-- Full CRUD RLS (select/insert/update/delete), NOT the append-only
-- select+insert-only pattern originally proposed — see the design
-- correction note above.
create policy "weight_checkins_select_own" on public.weight_checkins
  for select using (auth.uid() = user_id);

create policy "weight_checkins_insert_own" on public.weight_checkins
  for insert with check (auth.uid() = user_id);

create policy "weight_checkins_update_own" on public.weight_checkins
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "weight_checkins_delete_own" on public.weight_checkins
  for delete using (auth.uid() = user_id);

create trigger weight_checkins_set_updated_at
  before update on public.weight_checkins
  for each row execute function public.set_updated_at();
