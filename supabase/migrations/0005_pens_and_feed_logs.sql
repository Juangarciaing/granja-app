-- FCR Tracking for Fattening Pigs (Module 4)
-- Tables: pens, feed_logs
-- ALTER: fattening_pigs gains a nullable pen_id (current-only assignment)
-- Ownership model: same as modules 1-3, `user_id = auth.uid()` (see
-- supabase/migrations/0001_init.sql). Mirrors 0004's dairy_cows/milk_records
-- shape (parent entity + editable child event-log with a UNIQUE
-- (parent_id, date) constraint) — see Engram
-- `sdd/conversion-alimento-engorde/design`.
--
-- FK on-delete semantics differ per child by design: deleting a pen must NOT
-- destroy its pigs' herd data (fattening_pigs.pen_id ... on delete set null,
-- pigs revert to "sin corral"/unassigned), but feed_logs are meaningless
-- without their pen, so they cascade (mirrors weight_checkins ->
-- fattening_pigs cascade in 0003).
--
-- FCR itself is never stored here — it stays a pure, live-recomputed value
-- (lib/pens/fcr.ts), same contract as buildFeedSummary/calcDailyFeed.

-- ---------------------------------------------------------------------------
-- pens
-- ---------------------------------------------------------------------------
create table if not exists public.pens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.pens is 'Fattening pens/corrales the family assigns pigs to for feed-conversion (FCR) tracking.';

create index if not exists pens_user_id_idx on public.pens (user_id);

alter table public.pens enable row level security;

create policy "pens_select_own" on public.pens
  for select using (auth.uid() = user_id);

create policy "pens_insert_own" on public.pens
  for insert with check (auth.uid() = user_id);

create policy "pens_update_own" on public.pens
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "pens_delete_own" on public.pens
  for delete using (auth.uid() = user_id);

create trigger pens_set_updated_at
  before update on public.pens
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- feed_logs
-- ---------------------------------------------------------------------------
create table if not exists public.feed_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  pen_id uuid not null references public.pens (id) on delete cascade,
  log_date date not null,
  kg_fed numeric(6, 2) not null check (kg_fed > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Spec: one daily feed total per pen per day (no AM/PM split) — mirrors
  -- milk_records' "Record a daily milk total" contract. A second insert for
  -- the same (pen_id, log_date) MUST be rejected (23505), guiding the user
  -- to edit the existing record instead of creating a duplicate.
  unique (pen_id, log_date)
);

comment on table public.feed_logs is 'Daily total-kg feed log per pen, the numerator for the pen''s FCR calculation. Editable/deletable (not append-only) so a mistyped total can be corrected, same rationale as milk_records.';

create index if not exists feed_logs_user_id_idx on public.feed_logs (user_id);
create index if not exists feed_logs_pen_id_idx on public.feed_logs (pen_id);

alter table public.feed_logs enable row level security;

create policy "feed_logs_select_own" on public.feed_logs
  for select using (auth.uid() = user_id);

create policy "feed_logs_insert_own" on public.feed_logs
  for insert with check (auth.uid() = user_id);

create policy "feed_logs_update_own" on public.feed_logs
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "feed_logs_delete_own" on public.feed_logs
  for delete using (auth.uid() = user_id);

create trigger feed_logs_set_updated_at
  before update on public.feed_logs
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- fattening_pigs.pen_id (current-only assignment)
-- ---------------------------------------------------------------------------
-- Nullable, no default: existing pig rows from modules 1-3 are left
-- completely untouched ("sin corral"/unassigned) by this ALTER — there is no
-- backfill and no NOT NULL constraint. Deleting a pen must NOT destroy its
-- pigs' herd data, so this FK reverts assigned pigs to unassigned (set null)
-- rather than cascading, in contrast to feed_logs.pen_id above.
alter table public.fattening_pigs
  add column if not exists pen_id uuid references public.pens (id) on delete set null;

create index if not exists fattening_pigs_pen_id_idx on public.fattening_pigs (pen_id);
