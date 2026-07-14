-- Global Target Sale Weight — sale_weight_config
-- Mirrors the feeding_config singleton recipe (0001_init.sql): exactly one
-- row per user, RLS-scoped, auto-provisioned for future signups via trigger.
--
-- IMPORTANT: unlike feeding_config (which shipped inside 0001 before any
-- production user existed), this table is introduced after the app already
-- has a live production user account. The provisioning trigger below only
-- fires for FUTURE `auth.users` inserts, so a one-time backfill is required
-- in this same migration to give the existing account a row immediately —
-- see the load-bearing backfill statement at the bottom of this file.

-- ---------------------------------------------------------------------------
-- sale_weight_config
-- ---------------------------------------------------------------------------
create table if not exists public.sale_weight_config (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique default auth.uid() references auth.users (id) on delete cascade,
  target_weight_kg numeric(6, 2) not null default 100 check (target_weight_kg > 0),
  updated_at timestamptz not null default now()
);

comment on table public.sale_weight_config is 'Exactly one current sale-weight target row per user; no historical versions (v1 scope), mirrors feeding_config.';

alter table public.sale_weight_config enable row level security;

create policy "sale_weight_config_select_own" on public.sale_weight_config
  for select using (auth.uid() = user_id);

create policy "sale_weight_config_insert_own" on public.sale_weight_config
  for insert with check (auth.uid() = user_id);

create policy "sale_weight_config_update_own" on public.sale_weight_config
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "sale_weight_config_delete_own" on public.sale_weight_config
  for delete using (auth.uid() = user_id);

create trigger sale_weight_config_set_updated_at
  before update on public.sale_weight_config
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Default sale_weight_config provisioning (mirrors handle_new_user_feeding_config)
-- ---------------------------------------------------------------------------
-- Every NEW authenticated user gets a default sale_weight_config row created
-- automatically, so the app can always assume exactly one current row exists
-- per user without a "create on first read" race in application code.
create or replace function public.handle_new_user_sale_weight_config()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.sale_weight_config (user_id)
  values (new.id)
  on conflict (user_id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created_sale_weight_config
  after insert on auth.users
  for each row execute function public.handle_new_user_sale_weight_config();

-- ---------------------------------------------------------------------------
-- [LOAD-BEARING] Backfill for EXISTING users
-- ---------------------------------------------------------------------------
-- The trigger above only fires for auth.users rows inserted AFTER this
-- migration runs. The existing production account was created before this
-- migration and has no sale_weight_config row — without this backfill,
-- getSaleWeightConfig().single() would throw PGRST116 (no row found) for
-- that account. This statement is idempotent (on conflict do nothing) so
-- re-running the migration is always safe.
--
-- Acceptance: after this migration runs, every existing row in auth.users
-- has exactly one corresponding sale_weight_config row with
-- target_weight_kg = 100 (the column default).
insert into public.sale_weight_config (user_id)
select id from auth.users
on conflict (user_id) do nothing;
