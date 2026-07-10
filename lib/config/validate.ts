export type FeedingConfigFormValues = {
  base_kg: number;
  kg_per_piglet: number;
};

export type FeedingConfigFormErrors = {
  base_kg?: string;
  kg_per_piglet?: string;
};

export type ParseFeedingConfigFormResult =
  | { ok: true; value: FeedingConfigFormValues }
  | { ok: false; errors: FeedingConfigFormErrors };

function parsePositiveNumber(raw: string): number | null {
  if (raw === "") return null;
  const value = Number(raw);
  if (!Number.isFinite(value) || value < 0) return null;
  return value;
}

/**
 * Pure parser/validator for the feeding-config edit form. Per spec "Edit
 * Feeding Config": the single current row's `base_kg`/`kg_per_piglet` are
 * overwritten in place — there is no versioning/history, so this only ever
 * produces the two numeric values to persist, never an id or timestamp.
 */
export function parseFeedingConfigForm(
  formData: FormData,
): ParseFeedingConfigFormResult {
  const errors: FeedingConfigFormErrors = {};

  const baseKgRaw = String(formData.get("base_kg") ?? "").trim();
  const base_kg = parsePositiveNumber(baseKgRaw);
  if (base_kg === null) {
    errors.base_kg = "La ración base debe ser un número mayor o igual a 0.";
  }

  const kgPerPigletRaw = String(formData.get("kg_per_piglet") ?? "").trim();
  const kg_per_piglet = parsePositiveNumber(kgPerPigletRaw);
  if (kg_per_piglet === null) {
    errors.kg_per_piglet =
      "El alimento por lechón debe ser un número mayor o igual a 0.";
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    value: { base_kg: base_kg as number, kg_per_piglet: kg_per_piglet as number },
  };
}
