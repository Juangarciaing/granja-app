"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createFatteningPig, markFatteningPigSold } from "@/lib/db/queries";
import type { FatteningPigActionState } from "@/lib/fattening-pigs/form-state";
import { parseFatteningPigForm } from "@/lib/fattening-pigs/validate";
import { createClient } from "@/lib/supabase/server";

export type { FatteningPigActionState } from "@/lib/fattening-pigs/form-state";

/**
 * Server Action bound to the "register fattening pig" form. Validation
 * happens in the pure, unit-tested `parseFatteningPigForm` first; the
 * Supabase mutation itself relies on RLS (`fattening_pigs.user_id default
 * auth.uid()`) for farm-scoped ownership and on the partial unique index
 * `fattening_pigs_active_arete_per_user` (migration 0003) to reject a
 * duplicate active arete — no `user_id` is ever read from the form or set
 * here, mirroring `createSowAction`.
 */
export async function createFatteningPigAction(
  _prevState: FatteningPigActionState,
  formData: FormData,
): Promise<FatteningPigActionState> {
  const result = parseFatteningPigForm(formData);
  if (!result.ok) {
    return { errors: result.errors };
  }

  const supabase = await createClient();
  await createFatteningPig(supabase, result.value);

  revalidatePath("/fattening-pigs");
  redirect("/fattening-pigs");
}

/**
 * Marks a pig as sold as of today, ending active tracking for it (spec:
 * "Mark Pig as Sold/Exited"). Bound via `.bind(null, id)` and used directly
 * as a `<form action>`, mirroring `weanFarrowingAction`.
 */
export async function markFatteningPigSoldAction(id: string): Promise<void> {
  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);
  await markFatteningPigSold(supabase, id, today);

  revalidatePath("/fattening-pigs");
  revalidatePath(`/fattening-pigs/${id}`);
}
