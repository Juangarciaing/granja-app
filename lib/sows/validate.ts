export type SowStatus = "active" | "sold" | "culled" | "dead";

export type SowFormValues = {
  name: string;
  birth_date: string | null;
  status: SowStatus;
  notes: string | null;
};

export type SowFormErrors = {
  name?: string;
  status?: string;
};

export type ParseSowFormResult =
  | { ok: true; value: SowFormValues }
  | { ok: false; errors: SowFormErrors };

const VALID_STATUSES: readonly SowStatus[] = [
  "active",
  "sold",
  "culled",
  "dead",
];

function isValidStatus(value: string): value is SowStatus {
  return (VALID_STATUSES as readonly string[]).includes(value);
}

/**
 * Pure parser/validator for the sow registration and edit forms. Kept
 * side-effect-free (no Next.js/Supabase imports) so it is trivially
 * unit-testable and reusable by both the create and update server actions.
 * Per spec "Register Sow": a name/tag is required and the lifecycle status
 * defaults to "active" when not supplied.
 */
export function parseSowForm(formData: FormData): ParseSowFormResult {
  const errors: SowFormErrors = {};

  const name = String(formData.get("name") ?? "").trim();
  if (!name) {
    errors.name = "El arete/nombre es obligatorio.";
  }

  const birthDateRaw = String(formData.get("birth_date") ?? "").trim();
  const birth_date = birthDateRaw || null;

  const statusRaw = String(formData.get("status") ?? "").trim();
  let status: SowStatus = "active";
  if (statusRaw) {
    if (isValidStatus(statusRaw)) {
      status = statusRaw;
    } else {
      errors.status = "Estado inválido.";
    }
  }

  const notesRaw = String(formData.get("notes") ?? "").trim();
  const notes = notesRaw || null;

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  return { ok: true, value: { name, birth_date, status, notes } };
}
