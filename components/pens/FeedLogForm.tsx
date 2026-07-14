"use client";

import { useActionState } from "react";

import {
  initialFeedLogActionState,
  type FeedLogActionState,
} from "@/lib/pens/form-state";

export type FeedLogFormDefaults = {
  log_date: string;
  kg_fed: number;
};

type FeedLogFormProps = {
  action: (
    state: FeedLogActionState,
    formData: FormData,
  ) => Promise<FeedLogActionState>;
  submitLabel: string;
  /** Present when editing an existing feed log; absent for "log new". */
  defaultValues?: FeedLogFormDefaults;
  /** Present when embedded inline as a row's edit form (cancel out without submitting). */
  onCancel?: () => void;
};

/**
 * "Log"/"edit" daily feed total form, mirroring `MilkRecordForm` almost
 * exactly (spec-equivalent fields: a date + a positive quantity). Reused
 * for both create (no `defaultValues`, the pen detail page's "log feed"
 * form) and edit (`defaultValues` pre-fills the row being corrected). No
 * client-side validation beyond native input types, deferring to the
 * injected Server Action's `parseFeedLogForm` (and, for create, the
 * DB-level `unique (pen_id, log_date)` guard surfaced as a `log_date`
 * error, same contract as `MilkRecordForm`'s `record_date`).
 */
export function FeedLogForm({
  action,
  submitLabel,
  defaultValues,
  onCancel,
}: FeedLogFormProps) {
  const [state, formAction, pending] = useActionState(
    action,
    initialFeedLogActionState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <label htmlFor="log_date" className="text-sm font-medium">
          Fecha del registro
        </label>
        <input
          id="log_date"
          name="log_date"
          type="date"
          defaultValue={defaultValues?.log_date}
          aria-invalid={Boolean(state.errors.log_date)}
          className="rounded border border-border bg-surface-1 px-3 py-2 font-mono tabular-nums text-ink"
        />
        {state.errors.log_date && (
          <p role="alert" className="text-sm text-critical">
            {state.errors.log_date}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="kg_fed" className="text-sm font-medium">
          Alimento (kg)
        </label>
        <input
          id="kg_fed"
          name="kg_fed"
          type="number"
          min={0}
          step="any"
          defaultValue={defaultValues?.kg_fed}
          aria-invalid={Boolean(state.errors.kg_fed)}
          className="rounded border border-border bg-surface-1 px-3 py-2 font-mono tabular-nums text-ink"
        />
        {state.errors.kg_fed && (
          <p role="alert" className="text-sm text-critical">
            {state.errors.kg_fed}
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
