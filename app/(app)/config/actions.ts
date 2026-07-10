"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { updateFeedingConfig } from "@/lib/db/queries";
import type { ConfigActionState } from "@/lib/config/form-state";
import { parseFeedingConfigForm } from "@/lib/config/validate";
import { createClient } from "@/lib/supabase/server";

export type { ConfigActionState } from "@/lib/config/form-state";

/**
 * Server Action bound to the feeding-config edit form. There is no id to
 * bind — the singleton row is targeted implicitly through RLS (same
 * "trust RLS, don't duplicate it" contract as `updateFeedingConfig`).
 * Every farrowing's live daily feed reads this row on next render, so no
 * separate recompute/cascade step is needed after the update.
 */
export async function updateConfigAction(
  _prevState: ConfigActionState,
  formData: FormData,
): Promise<ConfigActionState> {
  const result = parseFeedingConfigForm(formData);
  if (!result.ok) {
    return { errors: result.errors };
  }

  const supabase = await createClient();
  await updateFeedingConfig(supabase, result.value);

  revalidatePath("/config");
  revalidatePath("/");
  redirect("/config");
}
