export type FatteningPigFormValues = {
  ear_tag: string;
  entry_date: string;
  entry_weight: number;
  pen_id: string | null;
};

export type FatteningPigFormErrors = {
  ear_tag?: string;
  entry_date?: string;
  entry_weight?: string;
};

export type ParseFatteningPigFormResult =
  | { ok: true; value: FatteningPigFormValues }
  | { ok: false; errors: FatteningPigFormErrors };

/**
 * Pure parser/validator for the "register fattening pig" form. Kept
 * side-effect-free (no Next.js/Supabase imports) so it is trivially
 * unit-testable, mirroring `lib/sows/validate.ts`. Per spec "Register
 * Fattening Pig": `ear_tag`, `entry_date` and `entry_weight` are all
 * required, and `entry_weight` must be a positive number — the DB-level
 * `check (entry_weight > 0)` constraint (migration 0003) is a defense in
 * depth, not a substitute for this app-level validation. `pen_id` is
 * optional (design: "register form also accepts an optional initial pen") —
 * an empty/missing value means "no initial pen" (`null`), never a
 * validation error.
 */
export function parseFatteningPigForm(
  formData: FormData,
): ParseFatteningPigFormResult {
  const errors: FatteningPigFormErrors = {};

  const ear_tag = String(formData.get("ear_tag") ?? "").trim();
  if (!ear_tag) {
    errors.ear_tag = "El ear_tag es obligatorio.";
  }

  const entry_date = String(formData.get("entry_date") ?? "").trim();
  if (!entry_date) {
    errors.entry_date = "La fecha de ingreso es obligatoria.";
  }

  const entryWeightRaw = String(formData.get("entry_weight") ?? "").trim();
  const entry_weight = Number(entryWeightRaw);
  if (entryWeightRaw === "" || !Number.isFinite(entry_weight) || entry_weight <= 0) {
    errors.entry_weight = "El peso inicial debe ser un número mayor a 0.";
  }

  const penIdRaw = String(formData.get("pen_id") ?? "").trim();
  const pen_id = penIdRaw === "" ? null : penIdRaw;

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  return { ok: true, value: { ear_tag, entry_date, entry_weight, pen_id } };
}
