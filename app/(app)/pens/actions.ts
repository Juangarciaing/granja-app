"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createPen } from "@/lib/db/queries";
import type { PenActionState } from "@/lib/pens/form-state";
import { parsePenForm } from "@/lib/pens/validate";
import { createClient } from "@/lib/supabase/server";

export type { PenActionState } from "@/lib/pens/form-state";

/**
 * Server Action bound to the "create pen" form. Validation happens in the
 * pure, unit-tested `parsePenForm` first; the Supabase insert itself relies
 * on RLS (`pens.user_id default auth.uid()`) for farm-scoped ownership — no
 * `user_id` is ever read from the form or set here, mirroring
 * `createDairyCowAction`.
 */
export async function createPenAction(
  _prevState: PenActionState,
  formData: FormData,
): Promise<PenActionState> {
  const result = parsePenForm(formData);
  if (!result.ok) {
    return { errors: result.errors };
  }

  const supabase = await createClient();
  await createPen(supabase, result.value);

  revalidatePath("/pens");
  redirect("/pens");
}
