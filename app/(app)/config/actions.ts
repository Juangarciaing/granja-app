"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { updateFeedingConfig, updateSaleWeightConfig } from "@/lib/db/queries";
import type { ConfigActionState } from "@/lib/config/form-state";
import { parseFeedingConfigForm } from "@/lib/config/validate";
import type { SaleWeightConfigActionState } from "@/lib/config/sale-weight-form-state";
import { parseSaleWeightConfigForm } from "@/lib/config/sale-weight-validate";
import { createClient } from "@/lib/supabase/server";

export type { ConfigActionState } from "@/lib/config/form-state";
export type { SaleWeightConfigActionState } from "@/lib/config/sale-weight-form-state";

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
  revalidatePath("/dashboard");
  redirect("/config");
}

/**
 * Server Action bound to the sale-weight-config edit form. Independent of
 * `updateConfigAction` — separate section, separate state, separate
 * `revalidatePath` targets. No id to bind — the singleton row is targeted
 * implicitly through RLS (same "trust RLS, don't duplicate it" contract as
 * `updateSaleWeightConfig`). The `/fattening-pigs` readiness indicator reads
 * this row on next render, so it is also revalidated here.
 */
export async function updateSaleWeightConfigAction(
  _prevState: SaleWeightConfigActionState,
  formData: FormData,
): Promise<SaleWeightConfigActionState> {
  const result = parseSaleWeightConfigForm(formData);
  if (!result.ok) {
    return { errors: result.errors };
  }

  const supabase = await createClient();
  await updateSaleWeightConfig(supabase, result.value);

  revalidatePath("/config");
  revalidatePath("/fattening-pigs");
  redirect("/config");
}
