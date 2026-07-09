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
