"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  createFarrowing,
  getFarrowing,
  updateFarrowingCounter,
  weanFarrowing,
} from "@/lib/db/queries";
import type { FarrowingActionState } from "@/lib/farrowings/form-state";
import { parseFarrowingForm, validatePigletCountUpdate } from "@/lib/farrowings/validate";
import { createClient } from "@/lib/supabase/server";

export type { FarrowingActionState } from "@/lib/farrowings/form-state";

/**
 * Server Action bound to the "record farrowing" form via
 * `.bind(null, sowId)`. Validation happens in the pure, unit-tested
 * `parseFarrowingForm` first; the mutation relies on RLS
 * (`farrowings.user_id default auth.uid()`) for farm-scoped ownership.
 */
export async function createFarrowingAction(
  sowId: string,
  _prevState: FarrowingActionState,
  formData: FormData,
): Promise<FarrowingActionState> {
  const result = parseFarrowingForm(formData, sowId);
  if (!result.ok) {
    return { errors: result.errors };
  }

  const supabase = await createClient();
  await createFarrowing(supabase, result.value);

  revalidatePath(`/sows/${sowId}`);
  redirect(`/sows/${sowId}`);
}

export type CounterActionResult = { ok: true } | { ok: false; error: string };

/**
 * Called directly from the client `PigletCounter` widget (not a form
 * submission) after its debounce window. Re-reads the current count from
 * the database before validating the decrement-only rule, so a stale
 * client value can never push the counter back up.
 */
export async function updateCounterAction(
  farrowingId: string,
  sowId: string,
  nextCount: number,
): Promise<CounterActionResult> {
  const supabase = await createClient();
  const current = await getFarrowing(supabase, farrowingId);

  const validation = validatePigletCountUpdate(current.current_piglets, nextCount);
  if (!validation.ok) {
    return validation;
  }

  await updateFarrowingCounter(supabase, farrowingId, nextCount);
  revalidatePath(`/sows/${sowId}`);
  return { ok: true };
}

/**
 * Marks a farrowing as weaned as of today, ending active lactation-feed
 * tracking for it (spec: "Wean/Close Farrowing"). Bound via
 * `.bind(null, farrowingId, sowId)` and used directly as a `<form action>`.
 */
export async function weanFarrowingAction(
  farrowingId: string,
  sowId: string,
): Promise<void> {
  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);
  await weanFarrowing(supabase, farrowingId, today);

  revalidatePath(`/sows/${sowId}`);
}
