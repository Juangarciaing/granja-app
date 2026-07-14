"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  createFeedLog,
  deleteFeedLog,
  getPen,
  updateFeedLog,
  updatePen,
} from "@/lib/db/queries";
import type {
  FeedLogActionState,
  PenActionState,
} from "@/lib/pens/form-state";
import { parseFeedLogForm, parsePenForm } from "@/lib/pens/validate";
import { createClient } from "@/lib/supabase/server";

export type { FeedLogActionState, PenActionState } from "@/lib/pens/form-state";

const DUPLICATE_LOG_DATE_MESSAGE =
  "Ya existe un registro de alimento para este corral en esa fecha; edítalo en lugar de crear otro.";

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
 * Server Action bound to the "log daily feed total" form via
 * `.bind(null, penId)`. Validation happens in the pure, unit-tested
 * `parseFeedLogForm` first. The `getPen` call before insert is a deliberate
 * ownership guard — `feed_logs.pen_id` is a bare FK, and Postgres FK checks
 * bypass RLS, so nothing else stops this action from being called directly
 * with a `penId` the caller doesn't own; `getPen` throws (RLS returns no
 * row) if that happens, same guard `createMilkRecordAction` uses for
 * `cowId`.
 *
 * IMPORTANT: the try/catch below wraps ONLY the `createFeedLog` insert, NOT
 * the whole action body — `redirect()` throws internally in Next.js, and a
 * catch-all around the entire action would swallow that internal throw and
 * break the happy-path redirect. The `unique (pen_id, log_date)` violation
 * (Postgres `23505`) is mapped to `errors.log_date` guidance directing the
 * user to edit the existing record instead of creating a duplicate, same
 * contract as `createMilkRecordAction`; any other error is rethrown, not
 * swallowed.
 */
export async function createFeedLogAction(
  penId: string,
  _prevState: FeedLogActionState,
  formData: FormData,
): Promise<FeedLogActionState> {
  const result = parseFeedLogForm(formData);
  if (!result.ok) {
    return { errors: result.errors };
  }

  const supabase = await createClient();
  await getPen(supabase, penId);

  try {
    await createFeedLog(supabase, {
      pen_id: penId,
      log_date: result.value.log_date,
      kg_fed: result.value.kg_fed,
    });
  } catch (error) {
    if (isUniqueViolation(error)) {
      return { errors: { log_date: DUPLICATE_LOG_DATE_MESSAGE } };
    }
    throw error;
  }

  revalidatePath(`/pens/${penId}`);
  redirect(`/pens/${penId}`);
}

/**
 * Server Action bound to a `FeedLogRow`'s inline edit form via
 * `.bind(null, feedLogId, penId)`. Corrects a mistyped daily total in place
 * (feed_logs is fully editable/deletable, not append-only, same as
 * `milk_records`). Redirects back to the pen detail page on success, same
 * "reset via fresh page load" rationale as `updateMilkRecordAction`.
 */
export async function updateFeedLogAction(
  feedLogId: string,
  penId: string,
  _prevState: FeedLogActionState,
  formData: FormData,
): Promise<FeedLogActionState> {
  const result = parseFeedLogForm(formData);
  if (!result.ok) {
    return { errors: result.errors };
  }

  const supabase = await createClient();
  await updateFeedLog(supabase, feedLogId, result.value);

  revalidatePath(`/pens/${penId}`);
  redirect(`/pens/${penId}`);
}

/**
 * Deletes a feed log. Bound via `.bind(null, feedLogId, penId)` and used
 * directly as a `<form action>`, mirroring `deleteMilkRecordAction` — a
 * void action with no client-side form state, so only `revalidatePath` is
 * needed (no redirect required since the row disappears from the
 * revalidated list on next render).
 */
export async function deleteFeedLogAction(
  feedLogId: string,
  penId: string,
): Promise<void> {
  const supabase = await createClient();
  await deleteFeedLog(supabase, feedLogId);

  revalidatePath(`/pens/${penId}`);
}

/**
 * Server Action bound to the pen detail page's inline rename form via
 * `.bind(null, penId)` (mirrors `WeightCheckinRow`'s edit-toggle pattern,
 * applied to the pen's own `name` field rather than a child row). No
 * separate ownership guard is needed before the update itself — `updatePen`
 * targets `pens.id` directly (not a bare FK on a child table), so RLS alone
 * (`pens_update_own`) already scopes which row this can touch.
 */
export async function updatePenAction(
  penId: string,
  _prevState: PenActionState,
  formData: FormData,
): Promise<PenActionState> {
  const result = parsePenForm(formData);
  if (!result.ok) {
    return { errors: result.errors };
  }

  const supabase = await createClient();
  await updatePen(supabase, penId, result.value);

  revalidatePath(`/pens/${penId}`);
  redirect(`/pens/${penId}`);
}
