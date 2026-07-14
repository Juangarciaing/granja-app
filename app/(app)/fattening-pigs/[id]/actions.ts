"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  assignPigToPen,
  createWeightCheckin,
  deleteWeightCheckin,
  getFatteningPig,
  updateWeightCheckin,
} from "@/lib/db/queries";
import type { WeightCheckinActionState } from "@/lib/weight-checkins/form-state";
import { parseWeightCheckinForm } from "@/lib/weight-checkins/validate";
import { createClient } from "@/lib/supabase/server";

export type { WeightCheckinActionState } from "@/lib/weight-checkins/form-state";

/**
 * Server Action bound to the "record weight check-in" form via
 * `.bind(null, fatteningPigId)`. Validation happens in the pure,
 * unit-tested `parseWeightCheckinForm` first. The `getFatteningPig` call
 * before insert is a deliberate ownership guard — `weight_checkins.
 * fattening_pig_id` is a bare FK, and Postgres FK checks bypass RLS, so
 * nothing else stops this action from being called directly with a
 * `fatteningPigId` the caller doesn't own; `getFatteningPig` throws (RLS
 * returns no row) if that happens, same guard `createFarrowingAction` uses
 * for `sowId`. On success, redirects back to the pig detail page — this
 * also has the effect of resetting any client-side row edit-toggle state
 * on the next page load, so no extra "close the form" plumbing is needed.
 */
export async function createWeightCheckinAction(
  fatteningPigId: string,
  _prevState: WeightCheckinActionState,
  formData: FormData,
): Promise<WeightCheckinActionState> {
  const result = parseWeightCheckinForm(formData);
  if (!result.ok) {
    return { errors: result.errors };
  }

  const supabase = await createClient();
  await getFatteningPig(supabase, fatteningPigId);
  await createWeightCheckin(supabase, {
    fattening_pig_id: fatteningPigId,
    checkin_date: result.value.checkin_date,
    weight: result.value.weight,
  });

  revalidatePath(`/fattening-pigs/${fatteningPigId}`);
  redirect(`/fattening-pigs/${fatteningPigId}`);
}

/**
 * Server Action bound to a `WeightCheckinRow`'s inline edit form via
 * `.bind(null, checkinId, fatteningPigId)`. Corrects a mistyped check-in in
 * place (spec: `weight_checkins` is editable, not append-only — design
 * revision 2). Redirects back to the pig detail page on success, same
 * "reset via fresh page load" rationale as `createWeightCheckinAction`.
 */
export async function updateWeightCheckinAction(
  checkinId: string,
  fatteningPigId: string,
  _prevState: WeightCheckinActionState,
  formData: FormData,
): Promise<WeightCheckinActionState> {
  const result = parseWeightCheckinForm(formData);
  if (!result.ok) {
    return { errors: result.errors };
  }

  const supabase = await createClient();
  await updateWeightCheckin(supabase, checkinId, result.value);

  revalidatePath(`/fattening-pigs/${fatteningPigId}`);
  redirect(`/fattening-pigs/${fatteningPigId}`);
}

/**
 * Deletes a check-in row. Bound via `.bind(null, checkinId,
 * fatteningPigId)` and used directly as a `<form action>`, mirroring
 * `markFatteningPigSoldAction`/`weanFarrowingAction` — a void action with
 * no client-side form state, so only `revalidatePath` is needed (no
 * redirect required since the row disappears from the revalidated list on
 * next render).
 */
export async function deleteWeightCheckinAction(
  checkinId: string,
  fatteningPigId: string,
): Promise<void> {
  const supabase = await createClient();
  await deleteWeightCheckin(supabase, checkinId);

  revalidatePath(`/fattening-pigs/${fatteningPigId}`);
}

/**
 * Server Action bound to the pig detail page's pen `<select>` via
 * `.bind(null, fatteningPigId)`, used directly as a `<form action>` (void,
 * no client-side form state — same "reset via fresh page load" shape as
 * `markFatteningPigSoldAction`). An empty `pen_id` value (the "Sin corral"
 * option) is treated as unassignment. `getFatteningPig` before the update is
 * the same ownership guard `createWeightCheckinAction` uses for `sowId`/
 * `fatteningPigId`: `assignPigToPen` is a bare `.eq('id', id)` update, so
 * nothing else stops this action from being invoked with a pig the caller
 * doesn't own. Revalidates the pig's own page plus both the pig's previous
 * pen (if any) and its newly assigned pen (if any) detail pages, since both
 * list their assigned pigs (design: "assignment surface = pig detail page
 * (canonical)").
 */
export async function assignPigToPenAction(
  fatteningPigId: string,
  formData: FormData,
): Promise<void> {
  const penIdRaw = String(formData.get("pen_id") ?? "").trim();
  const penId = penIdRaw === "" ? null : penIdRaw;

  const supabase = await createClient();
  const pig = await getFatteningPig(supabase, fatteningPigId);
  await assignPigToPen(supabase, fatteningPigId, penId);

  revalidatePath(`/fattening-pigs/${fatteningPigId}`);
  if (pig.pen_id) {
    revalidatePath(`/pens/${pig.pen_id}`);
  }
  if (penId) {
    revalidatePath(`/pens/${penId}`);
  }
}
