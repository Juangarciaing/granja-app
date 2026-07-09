"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createSow, updateSow } from "@/lib/db/queries";
import type { SowActionState } from "@/lib/sows/form-state";
import { parseSowForm } from "@/lib/sows/validate";
import { createClient } from "@/lib/supabase/server";

export type { SowActionState } from "@/lib/sows/form-state";

/**
 * Server Action bound to the "new sow" form. Validation happens in the
 * pure, unit-tested `parseSowForm` first; the Supabase mutation itself
 * relies on RLS (`sows.user_id default auth.uid()`) for farm-scoped
 * ownership — no `user_id` is ever read from the form or set here.
 */
export async function createSowAction(
  _prevState: SowActionState,
  formData: FormData,
): Promise<SowActionState> {
  const result = parseSowForm(formData);
  if (!result.ok) {
    return { errors: result.errors };
  }

  const supabase = await createClient();
  await createSow(supabase, result.value);

  revalidatePath("/sows");
  redirect("/sows");
}

/**
 * Server Action bound to a specific sow id via `.bind(null, id)` in the
 * edit page, matching the `(prevState, formData)` shape `useActionState`
 * expects for the trailing arguments.
 */
export async function updateSowAction(
  id: string,
  _prevState: SowActionState,
  formData: FormData,
): Promise<SowActionState> {
  const result = parseSowForm(formData);
  if (!result.ok) {
    return { errors: result.errors };
  }

  const supabase = await createClient();
  await updateSow(supabase, id, result.value);

  revalidatePath("/sows");
  revalidatePath(`/sows/${id}`);
  redirect("/sows");
}
