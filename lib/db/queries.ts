import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database, Tables, TablesInsert, TablesUpdate } from "@/types/database";

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

export type FeedingConfigRow = Tables<"feeding_config">;

/**
 * Editable fields for the feeding config edit form. `id`, `user_id` and
 * `updated_at` are excluded: `user_id` is assigned by RLS default (same
 * ownership contract as `NewSow`/`NewFarrowing`), and there is exactly one
 * row per user (PR1's auto-provisioning trigger + `feeding_config.user_id
 * unique` constraint), so there is never a caller-supplied id to target.
 */
export type FeedingConfigUpdate = Pick<
  TablesUpdate<"feeding_config">,
  "base_kg" | "kg_per_piglet"
>;

/**
 * Fetches the single current feeding-config row for the session. No
 * explicit `user_id`/`id` filter is applied — PR1's auto-provisioning
 * trigger plus the `user_id unique` constraint guarantee exactly one row is
 * ever visible under RLS, so "select the row" and "select my row" are the
 * same query (spec: "Single Current Feeding Config").
 */
export async function getFeedingConfig(
  supabase: SupabaseDb,
): Promise<FeedingConfigRow> {
  const { data, error } = await supabase
    .from("feeding_config")
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

/**
 * Overwrites `base_kg`/`kg_per_piglet` on the current row in place. Per spec
 * "Edit Feeding Config", there is no versioning/history — this update never
 * touches `id`/`user_id` in its input payload, and the previous values are
 * not retained anywhere (no separate insert, no audit table).
 *
 * The `eq("user_id", ...)` filter below is NOT a redundant ownership check
 * duplicating RLS — it's required because Supabase enables the pg-safeupdate
 * extension by default, which rejects any UPDATE with no WHERE clause at the
 * DB level ("UPDATE requires a WHERE clause"), even when RLS alone would
 * already scope the statement to exactly one row.
 */
export async function updateFeedingConfig(
  supabase: SupabaseDb,
  input: FeedingConfigUpdate,
): Promise<FeedingConfigRow> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("updateFeedingConfig requires an authenticated user");
  }

  const { data, error } = await supabase
    .from("feeding_config")
    .update(input)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export type FatteningPig = Tables<"fattening_pigs">;

/**
 * Editable fattening-pig fields for registration. `user_id`, `id`,
 * `created_at`/`updated_at` and `fecha_salida` are intentionally excluded:
 * `user_id` is assigned by RLS default (same ownership contract as `NewSow`),
 * and `fecha_salida` is only ever set later via `markFatteningPigSold` —
 * there is no "pre-sold" registration path (spec: "Register Fattening Pig").
 */
export type NewFatteningPig = Omit<
  TablesInsert<"fattening_pigs">,
  "user_id" | "id" | "created_at" | "updated_at" | "fecha_salida"
>;

/**
 * Lists pigs still under active tracking (`fecha_salida is null`), newest
 * first. No explicit `user_id` filter — visibility is scoped by the
 * `fattening_pigs_select_own` RLS policy, same pattern as `listSows` (spec:
 * "Mark Pig as Sold/Exited" — sold pigs must not appear in the active list).
 */
export async function listActiveFatteningPigs(
  supabase: SupabaseDb,
): Promise<FatteningPig[]> {
  const { data, error } = await supabase
    .from("fattening_pigs")
    .select("*")
    .is("fecha_salida", null)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function getFatteningPig(
  supabase: SupabaseDb,
  id: string,
): Promise<FatteningPig> {
  const { data, error } = await supabase
    .from("fattening_pigs")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Registers a new fattening pig. Per spec "Duplicate arete for same user",
 * a second active pig with the same `arete` is rejected — enforced by the
 * partial unique index `fattening_pigs_active_arete_per_user` (migration
 * 0003), whose Postgres unique-violation error (code `23505`) is propagated
 * here rather than swallowed, same "trust the DB, don't duplicate it"
 * contract as the other query functions' error handling.
 */
export async function createFatteningPig(
  supabase: SupabaseDb,
  input: NewFatteningPig,
): Promise<FatteningPig> {
  const { data, error } = await supabase
    .from("fattening_pigs")
    .insert(input)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Marks a pig as sold/exited by setting `fecha_salida`, mirroring
 * `weanFarrowing`. Unlike `updateFeedingConfig`'s singleton-table special
 * case, a bare `.eq('id', id)` filter alone is sufficient to satisfy
 * Supabase's pg-safeupdate "UPDATE requires a WHERE clause" requirement —
 * there is no need to additionally filter by `user_id` here, since `id` is
 * already a unique per-row target (RLS still scopes which rows are visible
 * to update in the first place).
 */
export async function markFatteningPigSold(
  supabase: SupabaseDb,
  id: string,
  fechaSalida: string,
): Promise<FatteningPig> {
  const { data, error } = await supabase
    .from("fattening_pigs")
    .update({ fecha_salida: fechaSalida })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}
