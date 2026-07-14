export type PenFormValues = {
  name: string;
};

export type PenFormErrors = {
  name?: string;
};

export type ParsePenFormResult =
  | { ok: true; value: PenFormValues }
  | { ok: false; errors: PenFormErrors };

/**
 * Pure parser/validator for the pen create/edit form. Kept side-effect-free
 * (no Next.js/Supabase imports) so it is trivially unit-testable, mirroring
 * `lib/sows/validate.ts`'s `parseSowForm`. Per design "pens (id, user_id
 * default auth.uid(), name, timestamps)": a non-empty `name` is the only
 * editable field.
 */
export function parsePenForm(formData: FormData): ParsePenFormResult {
  const errors: PenFormErrors = {};

  const name = String(formData.get("name") ?? "").trim();
  if (!name) {
    errors.name = "El nombre del corral es obligatorio.";
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  return { ok: true, value: { name } };
}

export type FeedLogFormValues = {
  log_date: string;
  kg_fed: number;
};

export type FeedLogFormErrors = {
  log_date?: string;
  kg_fed?: string;
};

export type ParseFeedLogFormResult =
  | { ok: true; value: FeedLogFormValues }
  | { ok: false; errors: FeedLogFormErrors };

/**
 * Pure parser/validator for the "log daily feed total" form. Mirrors
 * `lib/milk-records/validate.ts`'s `parseMilkRecordForm` almost exactly:
 * `log_date` and `kg_fed` are both required, and `kg_fed` must be a
 * positive number — the DB-level `check (kg_fed > 0)` constraint (migration
 * 0005) is a defense in depth, not a substitute for this app-level
 * validation. Used for both create and edit forms (`feed_logs` is
 * editable/deletable, not append-only).
 *
 * The `unique (pen_id, log_date)` constraint is intentionally NOT validated
 * here — it can only be checked against the database, so its violation
 * (Postgres `23505`) is caught and mapped to a `log_date` error one layer
 * up, in `createFeedLogAction` (same contract as `createMilkRecordAction`).
 */
export function parseFeedLogForm(formData: FormData): ParseFeedLogFormResult {
  const errors: FeedLogFormErrors = {};

  const log_date = String(formData.get("log_date") ?? "").trim();
  if (!log_date) {
    errors.log_date = "La fecha del registro es obligatoria.";
  }

  const kgFedRaw = String(formData.get("kg_fed") ?? "").trim();
  const kg_fed = Number(kgFedRaw);
  if (kgFedRaw === "" || !Number.isFinite(kg_fed) || kg_fed <= 0) {
    errors.kg_fed = "El alimento (kg) debe ser un número mayor a 0.";
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  return { ok: true, value: { log_date, kg_fed } };
}
