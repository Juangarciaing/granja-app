export type SaleWeightConfigFormValues = {
  target_weight_kg: number;
};

export type SaleWeightConfigFormErrors = {
  target_weight_kg?: string;
};

export type ParseSaleWeightConfigFormResult =
  | { ok: true; value: SaleWeightConfigFormValues }
  | { ok: false; errors: SaleWeightConfigFormErrors };

function parsePositiveNumberExclusive(raw: string): number | null {
  if (raw === "") return null;
  const value = Number(raw);
  if (!Number.isFinite(value) || value <= 0) return null;
  return value;
}

/**
 * Pure parser/validator for the sale-weight-config edit form. Mirrors
 * `parseFeedingConfigForm` in shape, but per spec "Invalid target rejected"
 * `target_weight_kg` must be strictly greater than 0 (unlike
 * `parseFeedingConfigForm`'s `>= 0`, which allows a flat-ration farm to set
 * 0). Per spec "Farmer edits the target", there is no versioning/history —
 * this only ever produces the single numeric value to persist, never an id
 * or timestamp.
 */
export function parseSaleWeightConfigForm(
  formData: FormData,
): ParseSaleWeightConfigFormResult {
  const errors: SaleWeightConfigFormErrors = {};

  const targetWeightKgRaw = String(formData.get("target_weight_kg") ?? "").trim();
  const target_weight_kg = parsePositiveNumberExclusive(targetWeightKgRaw);
  if (target_weight_kg === null) {
    errors.target_weight_kg =
      "El peso objetivo debe ser un número mayor a 0.";
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    value: { target_weight_kg: target_weight_kg as number },
  };
}
