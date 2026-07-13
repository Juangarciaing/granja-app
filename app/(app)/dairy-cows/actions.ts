"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createDairyCow, markDairyCowExited } from "@/lib/db/queries";
import type { DairyCowActionState } from "@/lib/dairy-cows/form-state";
import { parseDairyCowForm } from "@/lib/dairy-cows/validate";
import { createClient } from "@/lib/supabase/server";

export type { DairyCowActionState } from "@/lib/dairy-cows/form-state";

/**
 * Server Action bound to the "register dairy cow" form. Validation happens
 * in the pure, unit-tested `parseDairyCowForm` first; the Supabase mutation
 * itself relies on RLS (`dairy_cows.user_id default auth.uid()`) for
 * farm-scoped ownership — no `user_id` is ever read from the form or set
 * here, mirroring `createFatteningPigAction`.
 */
export async function createDairyCowAction(
  _prevState: DairyCowActionState,
  formData: FormData,
): Promise<DairyCowActionState> {
  const result = parseDairyCowForm(formData);
  if (!result.ok) {
    return { errors: result.errors };
  }

  const supabase = await createClient();
  await createDairyCow(supabase, result.value);

  revalidatePath("/dairy-cows");
  redirect("/dairy-cows");
}

/**
 * Marks a cow as exited as of today, ending active tracking for it (spec:
 * "Mark a cow as exited"). Bound via `.bind(null, id)` and used directly as
 * a `<form action>`, mirroring `markFatteningPigSoldAction`.
 */
export async function markDairyCowExitedAction(id: string): Promise<void> {
  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);
  await markDairyCowExited(supabase, id, today);

  revalidatePath("/dairy-cows");
  revalidatePath(`/dairy-cows/${id}`);
}
