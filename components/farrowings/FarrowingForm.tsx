"use client";

import { useActionState } from "react";

import {
  initialFarrowingActionState,
  type FarrowingActionState,
} from "@/lib/farrowings/form-state";

type FarrowingFormProps = {
  action: (
    state: FarrowingActionState,
    formData: FormData,
  ) => Promise<FarrowingActionState>;
};

/**
 * "Record farrowing" form — spec "Record Farrowing" only requires a
 * farrowing date and the initial live piglet count (`born_alive`); the
 * live `current_piglets` counter is initialized from that value server-side
 * (see `createFarrowing`), so this form never asks for it directly.
 */
export function FarrowingForm({ action }: FarrowingFormProps) {
  const [state, formAction, pending] = useActionState(
    action,
    initialFarrowingActionState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="farrowing_date" className="text-sm font-medium">
          Fecha de parto
        </label>
        <input
          id="farrowing_date"
          name="farrowing_date"
          type="date"
          aria-invalid={Boolean(state.errors.farrowing_date)}
          className="rounded border border-border bg-surface-1 px-3 py-2 font-mono tabular-nums text-ink"
        />
        {state.errors.farrowing_date && (
          <p role="alert" className="text-sm text-critical">
            {state.errors.farrowing_date}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="born_alive" className="text-sm font-medium">
          Lechones nacidos vivos
        </label>
        <input
          id="born_alive"
          name="born_alive"
          type="number"
          min={0}
          step={1}
          aria-invalid={Boolean(state.errors.born_alive)}
          className="rounded border border-border bg-surface-1 px-3 py-2 font-mono tabular-nums text-ink"
        />
        {state.errors.born_alive && (
          <p role="alert" className="text-sm text-critical">
            {state.errors.born_alive}
          </p>
        )}
      </div>

      <button type="submit" disabled={pending} className="btn-primary">
        Registrar parto
      </button>
    </form>
  );
}
