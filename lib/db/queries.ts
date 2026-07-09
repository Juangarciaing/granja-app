import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database, Tables, TablesInsert } from "@/types/database";

export type Sow = Tables<"sows">;

/**
 * Editable sow fields for create/update. `user_id` is intentionally
 * excluded from both types: ownership is assigned exclusively by the
 * `sows.user_id default auth.uid()` column default enforced by RLS
 * (see `supabase/migrations/0001_init.sql`). Excluding it here at the type
 * level prevents any caller (server action, form) from ever supplying or
 * overriding another user's id.
 */
export type NewSow = Omit<TablesInsert<"sows">, "user_id" | "id" | "created_at" | "updated_at">;
export type SowUpdate = Partial<NewSow>;

type SupabaseDb = SupabaseClient<Database>;

/**
 * Lists sows for the current session. No explicit `user_id` filter is
 * applied — row visibility is scoped entirely by the `sows_select_own` RLS
 * policy (`auth.uid() = user_id`), so this function only needs to ask for
 * "all sows" and Postgres returns only the caller's own rows.
 */
export async function listSows(supabase: SupabaseDb): Promise<Sow[]> {
  const { data, error } = await supabase
    .from("sows")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function getSow(supabase: SupabaseDb, id: string): Promise<Sow> {
  const { data, error } = await supabase
    .from("sows")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

export async function createSow(supabase: SupabaseDb, input: NewSow): Promise<Sow> {
  const { data, error } = await supabase.from("sows").insert(input).select().single();

  if (error) throw error;
  return data;
}

export async function updateSow(
  supabase: SupabaseDb,
  id: string,
  input: SowUpdate,
): Promise<Sow> {
  const { data, error } = await supabase
    .from("sows")
    .update(input)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export type Farrowing = Tables<"farrowings">;

/**
 * Editable fields for recording a new farrowing. `user_id`, `id`, `status`
 * and `current_piglets` are intentionally excluded: `user_id` is assigned by
 * RLS default (same contract as `NewSow`), `status` defaults to
 * `'lactating'` in the migration, and `current_piglets` is initialized from
 * `born_alive` by `createFarrowing` itself — there is no "initial mortality"
 * concept, only a live counter that starts at the born-alive count.
 */
export type NewFarrowing = Omit<
  TablesInsert<"farrowings">,
  "user_id" | "id" | "created_at" | "updated_at" | "status" | "current_piglets"
>;

/**
 * Lists a sow's farrowings, most recent first. No explicit `user_id` filter
 * — visibility is scoped by the `farrowings_select_own` RLS policy, same
 * pattern as `listSows`.
 */
export async function listFarrowingsForSow(
  supabase: SupabaseDb,
  sowId: string,
): Promise<Farrowing[]> {
  const { data, error } = await supabase
    .from("farrowings")
    .select("*")
    .eq("sow_id", sowId)
    .order("farrowing_date", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function getFarrowing(
  supabase: SupabaseDb,
  id: string,
): Promise<Farrowing> {
  const { data, error } = await supabase
    .from("farrowings")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Records a new farrowing. `current_piglets` is initialized to
 * `born_alive` here — the live counter starts equal to the count of piglets
 * born alive and can only be decremented afterward via
 * `updateFarrowingCounter` (spec: "Update Live Piglet Count").
 */
export async function createFarrowing(
  supabase: SupabaseDb,
  input: NewFarrowing,
): Promise<Farrowing> {
  const { data, error } = await supabase
    .from("farrowings")
    .insert({ ...input, current_piglets: input.born_alive })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Persists a new value for the live `current_piglets` counter. Callers MUST
 * validate the decrement-only rule (`validatePigletCountUpdate`) before
 * calling this — this function performs no history/event write, per the v1
 * "no mortality history" scope (spec: "Update Live Piglet Count").
 */
export async function updateFarrowingCounter(
  supabase: SupabaseDb,
  id: string,
  currentPiglets: number,
): Promise<Farrowing> {
  const { data, error } = await supabase
    .from("farrowings")
    .update({ current_piglets: currentPiglets })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Marks a farrowing as weaned/closed by setting its weaning date, ending
 * active lactation-feed tracking for it (spec: "Wean/Close Farrowing").
 */
export async function weanFarrowing(
  supabase: SupabaseDb,
  id: string,
  weaningDate: string,
): Promise<Farrowing> {
  const { data, error } = await supabase
    .from("farrowings")
    .update({ weaning_date: weaningDate, status: "weaned" })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Lists farrowings still under active lactation-feed tracking (status
 * `'lactating'`), excluding weaned/closed ones — spec: "Weaned farrowing
 * excluded" from active daily-feed views. Consumed by Phase 5's dashboard
 * total; exposed here as the query-layer contract this batch is responsible
 * for.
 */
export async function listActiveFarrowings(
  supabase: SupabaseDb,
): Promise<Farrowing[]> {
  const { data, error } = await supabase
    .from("farrowings")
    .select("*")
    .eq("status", "lactating");

  if (error) throw error;
  return data ?? [];
}
