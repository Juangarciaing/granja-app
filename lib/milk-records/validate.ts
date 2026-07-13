export type MilkRecordFormValues = {
  record_date: string;
  liters: number;
};

export type MilkRecordFormErrors = {
  record_date?: string;
  liters?: string;
};

export type ParseMilkRecordFormResult =
  | { ok: true; value: MilkRecordFormValues }
  | { ok: false; errors: MilkRecordFormErrors };

/**
 * Pure parser/validator for the "record daily milk total" form. Kept
 * side-effect-free (no Next.js/Supabase imports) so it is trivially
 * unit-testable, mirroring `lib/weight-checkins/validate.ts`. Per spec
 * "Record a daily milk total": `record_date` and `liters` are both
 * required, and `liters` must be a positive number — the DB-level
 * `check (liters > 0)` constraint (migration 0004) is a defense in depth,
 * not a substitute for this app-level validation. Used for both create and
 * edit forms (`milk_records` is editable/deletable, not append-only).
 *
 * The `unique (cow_id, record_date)` constraint is intentionally NOT
 * validated here — it can only be checked against the database, so its
 * violation (Postgres `23505`) is caught and mapped to a `record_date`
 * error one layer up, in `createMilkRecordAction`.
 */
export function parseMilkRecordForm(
  formData: FormData,
): ParseMilkRecordFormResult {
  const errors: MilkRecordFormErrors = {};

  const record_date = String(formData.get("record_date") ?? "").trim();
  if (!record_date) {
    errors.record_date = "La fecha del registro es obligatoria.";
  }

  const litersRaw = String(formData.get("liters") ?? "").trim();
  const liters = Number(litersRaw);
  if (litersRaw === "" || !Number.isFinite(liters) || liters <= 0) {
    errors.liters = "Los litros deben ser un número mayor a 0.";
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  return { ok: true, value: { record_date, liters } };
}
