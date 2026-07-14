-- Heat (Celo) Event Tracking for Dairy Cows (Module 6)
-- Table: heat_events
-- Ownership model: same as prior modules, `user_id = auth.uid()` (see
-- supabase/migrations/0001_init.sql). Mirrors 0004's milk_records shape
-- (parent entity + editable child event-log) minus the unique constraint:
-- a heat observation is a point-in-time event, not a daily aggregate, so
-- same-day duplicate observations are legitimate — see Engram
-- `sdd/registro-celo/design`.

create table if not exists public.heat_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  cow_id uuid not null references public.dairy_cows (id) on delete cascade,
  observed_date date not null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.heat_events is 'Point-in-time heat (celo) observations per dairy cow. Editable/deletable, no unique(cow_id, observed_date) constraint — multiple observations on the same day are legitimate.';

create index if not exists heat_events_user_id_idx on public.heat_events (user_id);
create index if not exists heat_events_cow_id_idx on public.heat_events (cow_id);

alter table public.heat_events enable row level security;

create policy "heat_events_select_own" on public.heat_events
  for select using (auth.uid() = user_id);

create policy "heat_events_insert_own" on public.heat_events
  for insert with check (auth.uid() = user_id);

create policy "heat_events_update_own" on public.heat_events
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "heat_events_delete_own" on public.heat_events
  for delete using (auth.uid() = user_id);

create trigger heat_events_set_updated_at
  before update on public.heat_events
  for each row execute function public.set_updated_at();
