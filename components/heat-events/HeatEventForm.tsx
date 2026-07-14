"use client";

import { useActionState } from "react";

import {
  initialHeatEventActionState,
  type HeatEventActionState,
} from "@/lib/heat-events/form-state";

export type HeatEventFormDefaults = {
  observed_date: string;
  notes: string | null;
};

type HeatEventFormProps = {
  action: (
    state: HeatEventActionState,
    formData: FormData,
  ) => Promise<HeatEventActionState>;
  submitLabel: string;
  /** Present when editing an existing event; absent for "record new". */
  defaultValues?: HeatEventFormDefaults;
  /** Present when embedded inline as a row's edit form (cancel out without submitting). */
  onCancel?: () => void;
};

/**
 * "Record"/"edit" heat observation form — spec "Record a heat observation"
 * requires `observed_date`; `notes` is optional. Reused for both create (no
 * `defaultValues`, used by the cow detail page's "register new" form) and
 * edit (`defaultValues` pre-fills the row being corrected), mirroring
 * `MilkRecordForm`'s shared create/edit pattern. No client-side validation
 * beyond native input types, deferring to the injected Server Action's
 * `parseHeatEventForm`.
 */
export function HeatEventForm({
  action,
  submitLabel,
  defaultValues,
  onCancel,
}: HeatEventFormProps) {
  const [state, formAction, pending] = useActionState(
    action,
    initialHeatEventActionState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <label htmlFor="observed_date" className="text-sm font-medium">
          Fecha de observación
        </label>
        <input
          id="observed_date"
          name="observed_date"
          type="date"
          defaultValue={defaultValues?.observed_date}
          aria-invalid={Boolean(state.errors.observed_date)}
          className="rounded border border-border bg-surface-1 px-3 py-2 font-mono tabular-nums text-ink"
        />
        {state.errors.observed_date && (
          <p role="alert" className="text-sm text-critical">
            {state.errors.observed_date}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="notes" className="text-sm font-medium">
          Notas
        </label>
        <textarea
          id="notes"
          name="notes"
          defaultValue={defaultValues?.notes ?? ""}
          className="rounded border border-border bg-surface-1 px-3 py-2 text-ink"
        />
      </div>

      <div className="flex gap-2">
        <button type="submit" disabled={pending} className="btn-primary">
          {submitLabel}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn-secondary">
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}
