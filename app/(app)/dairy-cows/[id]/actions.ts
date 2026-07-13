"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  createMilkRecord,
  deleteMilkRecord,
  getDairyCow,
  updateMilkRecord,
} from "@/lib/db/queries";
import type { MilkRecordActionState } from "@/lib/milk-records/form-state";
import { parseMilkRecordForm } from "@/lib/milk-records/validate";
import { createClient } from "@/lib/supabase/server";

export type { MilkRecordActionState } from "@/lib/milk-records/form-state";

const DUPLICATE_RECORD_DATE_MESSAGE =
  "Ya existe un registro para esta vaca en esa fecha; edítalo en lugar de crear otro.";

/** Checks for a Postgres unique-violation error (code `23505`). */
function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: unknown }).code === "23505"
  );
}

/**
 * Server Action bound to the "record daily milk total" form via
 * `.bind(null, cowId)`. Validation happens in the pure, unit-tested
 * `parseMilkRecordForm` first. The `getDairyCow` call before insert is a
 * deliberate ownership guard — `milk_records.cow_id` is a bare FK, and
 * Postgres FK checks bypass RLS, so nothing else stops this action from
 * being called directly with a `cowId` the caller doesn't own; `getDairyCow`
 * throws (RLS returns no row) if that happens, same guard
 * `createWeightCheckinAction` uses for `fatteningPigId`.
 *
 * IMPORTANT: the try/catch below wraps ONLY the `createMilkRecord` insert,
 * NOT the whole action body. `redirect()` throws internally in Next.js — a
 * catch-all around the entire action would swallow that internal throw and
 * break the happy-path redirect. The `unique (cow_id, record_date)`
 * violation (Postgres `23505`) is mapped to `errors.record_date` guidance
 * directing the user to edit the existing record instead of creating a
 * duplicate (spec: "Duplicate-date rejection"); any other error is
 * rethrown, not swallowed (design decision: "`23505` handled in create
 * action, not swallowed in query layer").
 */
export async function createMilkRecordAction(
  cowId: string,
  _prevState: MilkRecordActionState,
  formData: FormData,
): Promise<MilkRecordActionState> {
  const result = parseMilkRecordForm(formData);
  if (!result.ok) {
    return { errors: result.errors };
  }

  const supabase = await createClient();
  await getDairyCow(supabase, cowId);

  try {
    await createMilkRecord(supabase, {
      cow_id: cowId,
      record_date: result.value.record_date,
      liters: result.value.liters,
    });
  } catch (error) {
    if (isUniqueViolation(error)) {
      return { errors: { record_date: DUPLICATE_RECORD_DATE_MESSAGE } };
    }
    throw error;
  }

  revalidatePath(`/dairy-cows/${cowId}`);
  redirect(`/dairy-cows/${cowId}`);
}

/**
 * Server Action bound to a `MilkRecordRow`'s inline edit form via
 * `.bind(null, recordId, cowId)`. Corrects a mistyped daily total in place
 * (spec: "Edit an existing day's record"). Redirects back to the cow detail
 * page on success, same "reset via fresh page load" rationale as
 * `updateWeightCheckinAction`.
 */
export async function updateMilkRecordAction(
  recordId: string,
  cowId: string,
  _prevState: MilkRecordActionState,
  formData: FormData,
): Promise<MilkRecordActionState> {
  const result = parseMilkRecordForm(formData);
  if (!result.ok) {
    return { errors: result.errors };
  }

  const supabase = await createClient();
  await updateMilkRecord(supabase, recordId, result.value);

  revalidatePath(`/dairy-cows/${cowId}`);
  redirect(`/dairy-cows/${cowId}`);
}

/**
 * Deletes a milk record. Bound via `.bind(null, recordId, cowId)` and used
 * directly as a `<form action>`, mirroring `deleteWeightCheckinAction` — a
 * void action with no client-side form state, so only `revalidatePath` is
 * needed (no redirect required since the row disappears from the
 * revalidated list on next render).
 */
export async function deleteMilkRecordAction(
  recordId: string,
  cowId: string,
): Promise<void> {
  const supabase = await createClient();
  await deleteMilkRecord(supabase, recordId);

  revalidatePath(`/dairy-cows/${cowId}`);
}
