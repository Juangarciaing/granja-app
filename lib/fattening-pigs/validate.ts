export type FatteningPigFormValues = {
  arete: string;
  fecha_ingreso: string;
  peso_inicial: number;
};

export type FatteningPigFormErrors = {
  arete?: string;
  fecha_ingreso?: string;
  peso_inicial?: string;
};

export type ParseFatteningPigFormResult =
  | { ok: true; value: FatteningPigFormValues }
  | { ok: false; errors: FatteningPigFormErrors };

/**
 * Pure parser/validator for the "register fattening pig" form. Kept
 * side-effect-free (no Next.js/Supabase imports) so it is trivially
 * unit-testable, mirroring `lib/sows/validate.ts`. Per spec "Register
 * Fattening Pig": `arete`, `fecha_ingreso` and `peso_inicial` are all
 * required, and `peso_inicial` must be a positive number — the DB-level
 * `check (peso_inicial > 0)` constraint (migration 0003) is a defense in
 * depth, not a substitute for this app-level validation.
 */
export function parseFatteningPigForm(
  formData: FormData,
): ParseFatteningPigFormResult {
  const errors: FatteningPigFormErrors = {};

  const arete = String(formData.get("arete") ?? "").trim();
  if (!arete) {
    errors.arete = "El arete es obligatorio.";
  }

  const fecha_ingreso = String(formData.get("fecha_ingreso") ?? "").trim();
  if (!fecha_ingreso) {
    errors.fecha_ingreso = "La fecha de ingreso es obligatoria.";
  }

  const pesoInicialRaw = String(formData.get("peso_inicial") ?? "").trim();
  const peso_inicial = Number(pesoInicialRaw);
  if (pesoInicialRaw === "" || !Number.isFinite(peso_inicial) || peso_inicial <= 0) {
    errors.peso_inicial = "El peso inicial debe ser un número mayor a 0.";
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  return { ok: true, value: { arete, fecha_ingreso, peso_inicial } };
}
