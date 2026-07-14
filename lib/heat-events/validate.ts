export type HeatEventFormValues = {
  observed_date: string;
  notes: string | null;
};

export type HeatEventFormErrors = {
  observed_date?: string;
};

export type ParseHeatEventFormResult =
  | { ok: true; value: HeatEventFormValues }
  | { ok: false; errors: HeatEventFormErrors };

/**
 * Pure parser/validator for the "record heat observation" form. Kept
 * side-effect-free (no Next.js/Supabase imports) so it is trivially
 * unit-testable, mirroring `lib/milk-records/validate.ts`. Per spec
 * "Record a heat observation": `observed_date` is required; `notes` is
 * optional and normalized to `null` when blank/omitted (there is no
 * duplicate-date rejection to validate here — unlike `milk_records`,
 * `heat_events` has no `unique(cow_id, observed_date)` constraint, so
 * repeated same-day observations are legitimate). Used for both create and
 * edit forms.
 */
export function parseHeatEventForm(formData: FormData): ParseHeatEventFormResult {
  const errors: HeatEventFormErrors = {};

  const observed_date = String(formData.get("observed_date") ?? "").trim();
  if (!observed_date) {
    errors.observed_date = "La fecha de observación es obligatoria.";
  }

  const notesRaw = String(formData.get("notes") ?? "").trim();
  const notes = notesRaw === "" ? null : notesRaw;

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  return { ok: true, value: { observed_date, notes } };
}
