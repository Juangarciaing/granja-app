export type DairyCowFormValues = {
  ear_tag: string;
};

export type DairyCowFormErrors = {
  ear_tag?: string;
};

export type ParseDairyCowFormResult =
  | { ok: true; value: DairyCowFormValues }
  | { ok: false; errors: DairyCowFormErrors };

/**
 * Pure parser/validator for the "register dairy cow" form. Kept
 * side-effect-free (no Next.js/Supabase imports) so it is trivially
 * unit-testable, mirroring `lib/fattening-pigs/validate.ts`. Per spec
 * "Register a dairy cow": only `ear_tag` is required — unlike
 * `fattening_pigs`, a dairy cow has no entry_date/entry_weight fields.
 */
export function parseDairyCowForm(formData: FormData): ParseDairyCowFormResult {
  const errors: DairyCowFormErrors = {};

  const ear_tag = String(formData.get("ear_tag") ?? "").trim();
  if (!ear_tag) {
    errors.ear_tag = "El ear_tag es obligatorio.";
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  return { ok: true, value: { ear_tag } };
}
