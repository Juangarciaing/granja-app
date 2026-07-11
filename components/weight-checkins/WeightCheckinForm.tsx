"use client";

import { useActionState } from "react";

import {
  initialWeightCheckinActionState,
  type WeightCheckinActionState,
} from "@/lib/weight-checkins/form-state";

export type WeightCheckinFormDefaults = {
  checkin_date: string;
  weight: number;
};

type WeightCheckinFormProps = {
  action: (
    state: WeightCheckinActionState,
    formData: FormData,
  ) => Promise<WeightCheckinActionState>;
  submitLabel: string;
  /** Present when editing an existing check-in; absent for "record new". */
  defaultValues?: WeightCheckinFormDefaults;
  /** Present when embedded inline as a row's edit form (cancel out without submitting). */
  onCancel?: () => void;
};

/**
 * "Record"/"edit" weight check-in form — spec "Record Weight Check-in"
 * requires `checkin_date` and `weight`. Reused for both create (no
 * `defaultValues`, used by the top-level "register" form) and edit
 * (`defaultValues` pre-fills the row being corrected), mirroring how
 * `SowForm`/`ConfigForm` share one component across create/edit via the
 * same `defaultValues` pattern. No client-side validation beyond native
 * input types, deferring to the injected Server Action's
 * `parseWeightCheckinForm`.
 */
export function WeightCheckinForm({
  action,
  submitLabel,
  defaultValues,
  onCancel,
}: WeightCheckinFormProps) {
  const [state, formAction, pending] = useActionState(
    action,
    initialWeightCheckinActionState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <label htmlFor="checkin_date" className="text-sm font-medium">
          Fecha de pesaje
        </label>
        <input
          id="checkin_date"
          name="checkin_date"
          type="date"
          defaultValue={defaultValues?.checkin_date}
          aria-invalid={Boolean(state.errors.checkin_date)}
          className="rounded border border-border bg-surface-1 px-3 py-2 font-mono tabular-nums text-ink"
        />
        {state.errors.checkin_date && (
          <p role="alert" className="text-sm text-critical">
            {state.errors.checkin_date}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="weight" className="text-sm font-medium">
          Peso (kg)
        </label>
        <input
          id="weight"
          name="weight"
          type="number"
          min={0}
          step="any"
          defaultValue={defaultValues?.weight}
          aria-invalid={Boolean(state.errors.weight)}
          className="rounded border border-border bg-surface-1 px-3 py-2 font-mono tabular-nums text-ink"
        />
        {state.errors.weight && (
          <p role="alert" className="text-sm text-critical">
            {state.errors.weight}
          </p>
        )}
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
