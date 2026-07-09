export type FarrowingFormValues = {
  sow_id: string;
  farrowing_date: string;
  born_alive: number;
};

export type FarrowingFormErrors = {
  farrowing_date?: string;
  born_alive?: string;
};

export type ParseFarrowingFormResult =
  | { ok: true; value: FarrowingFormValues }
  | { ok: false; errors: FarrowingFormErrors };

/**
 * Pure parser/validator for the "record farrowing" form. Only
 * `farrowing_date` and `born_alive` are user input — per spec "Record
 * Farrowing", the live `current_piglets` counter is initialized from
 * `born_alive` by the query layer, never entered directly at creation time.
 */
export function parseFarrowingForm(
  formData: FormData,
  sowId: string,
): ParseFarrowingFormResult {
  const errors: FarrowingFormErrors = {};

  const farrowing_date = String(formData.get("farrowing_date") ?? "").trim();
  if (!farrowing_date) {
    errors.farrowing_date = "La fecha de parto es obligatoria.";
  }

  const bornAliveRaw = String(formData.get("born_alive") ?? "").trim();
  const born_alive = Number(bornAliveRaw);
  if (
    bornAliveRaw === "" ||
    !Number.isInteger(born_alive) ||
    born_alive < 0
  ) {
    errors.born_alive = "El número de lechones nacidos vivos debe ser un entero mayor o igual a 0.";
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  return { ok: true, value: { sow_id: sowId, farrowing_date, born_alive } };
}

export type CounterUpdateResult = { ok: true } | { ok: false; error: string };

/**
 * `current_piglets` is a live counter with no mortality event history
 * (spec: "Update Live Piglet Count") — per the approved v1 scope it may
 * only decrease (deaths) or stay the same, never increase, since there is
 * no event log to justify or audit a rise.
 */
export function validatePigletCountUpdate(
  current: number,
  next: number,
): CounterUpdateResult {
  if (next < 0) {
    return { ok: false, error: "El conteo de lechones no puede ser negativo." };
  }
  if (next > current) {
    return {
      ok: false,
      error: "El conteo de lechones solo puede disminuir (no hay historial de eventos).",
    };
  }
  return { ok: true };
}
