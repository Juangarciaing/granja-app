export type WeightCheckinFormValues = {
  checkin_date: string;
  weight: number;
};

export type WeightCheckinFormErrors = {
  checkin_date?: string;
  weight?: string;
};

export type ParseWeightCheckinFormResult =
  | { ok: true; value: WeightCheckinFormValues }
  | { ok: false; errors: WeightCheckinFormErrors };

/**
 * Pure parser/validator for the "record weight check-in" form. Kept
 * side-effect-free (no Next.js/Supabase imports) so it is trivially
 * unit-testable, mirroring `lib/fattening-pigs/validate.ts`. Per spec
 * "Record Weight Check-in": `checkin_date` and `weight` are both required,
 * and `weight` must be a positive number — the DB-level
 * `check (weight > 0)` constraint (migration 0003) is a defense in depth,
 * not a substitute for this app-level validation. Used for both create and
 * edit forms (`weight_checkins` is editable/deletable, not append-only —
 * see decision `sdd/control-peso-engorde/design` revision 2).
 */
export function parseWeightCheckinForm(
  formData: FormData,
): ParseWeightCheckinFormResult {
  const errors: WeightCheckinFormErrors = {};

  const checkin_date = String(formData.get("checkin_date") ?? "").trim();
  if (!checkin_date) {
    errors.checkin_date = "La fecha de pesaje es obligatoria.";
  }

  const weightRaw = String(formData.get("weight") ?? "").trim();
  const weight = Number(weightRaw);
  if (weightRaw === "" || !Number.isFinite(weight) || weight <= 0) {
    errors.weight = "El peso debe ser un número mayor a 0.";
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  return { ok: true, value: { checkin_date, weight } };
}
