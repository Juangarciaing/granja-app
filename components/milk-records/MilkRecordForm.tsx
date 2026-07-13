"use client";

import { useActionState } from "react";

import {
  initialMilkRecordActionState,
  type MilkRecordActionState,
} from "@/lib/milk-records/form-state";

export type MilkRecordFormDefaults = {
  record_date: string;
  liters: number;
};

type MilkRecordFormProps = {
  action: (
    state: MilkRecordActionState,
    formData: FormData,
  ) => Promise<MilkRecordActionState>;
  submitLabel: string;
  /** Present when editing an existing record; absent for "record new". */
  defaultValues?: MilkRecordFormDefaults;
  /** Present when embedded inline as a row's edit form (cancel out without submitting). */
  onCancel?: () => void;
};

/**
 * "Record"/"edit" daily milk total form — spec "Record a daily milk total"
 * requires `record_date` and `liters`. Reused for both create (no
 * `defaultValues`, used by the cow detail page's "register new" form) and
 * edit (`defaultValues` pre-fills the row being corrected), mirroring
 * `WeightCheckinForm`'s shared create/edit pattern. No client-side
 * validation beyond native input types, deferring to the injected Server
 * Action's `parseMilkRecordForm` (and, for create, the DB-level
 * `unique (cow_id, record_date)` guard surfaced as a `record_date` error).
 */
export function MilkRecordForm({
  action,
  submitLabel,
  defaultValues,
  onCancel,
}: MilkRecordFormProps) {
  const [state, formAction, pending] = useActionState(
    action,
    initialMilkRecordActionState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <label htmlFor="record_date" className="text-sm font-medium">
          Fecha del registro
        </label>
        <input
          id="record_date"
          name="record_date"
          type="date"
          defaultValue={defaultValues?.record_date}
          aria-invalid={Boolean(state.errors.record_date)}
          className="rounded border border-border bg-surface-1 px-3 py-2 font-mono tabular-nums text-ink"
        />
        {state.errors.record_date && (
          <p role="alert" className="text-sm text-critical">
            {state.errors.record_date}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="liters" className="text-sm font-medium">
          Litros
        </label>
        <input
          id="liters"
          name="liters"
          type="number"
          min={0}
          step="any"
          defaultValue={defaultValues?.liters}
          aria-invalid={Boolean(state.errors.liters)}
          className="rounded border border-border bg-surface-1 px-3 py-2 font-mono tabular-nums text-ink"
        />
        {state.errors.liters && (
          <p role="alert" className="text-sm text-critical">
            {state.errors.liters}
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
