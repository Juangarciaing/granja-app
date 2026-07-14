"use client";

import { useActionState } from "react";

import {
  initialPenActionState,
  type PenActionState,
} from "@/lib/pens/form-state";

export type PenFormDefaults = {
  name: string;
};

type PenFormProps = {
  action: (
    state: PenActionState,
    formData: FormData,
  ) => Promise<PenActionState>;
  submitLabel: string;
  /** Present when editing an existing pen's name; absent for "create". */
  defaultValues?: PenFormDefaults;
  /** Present when embedded inline as a rename form (cancel out without submitting). */
  onCancel?: () => void;
};

/**
 * "Create"/"rename" pen form — mirrors `DairyCowForm`: a plain
 * `useActionState`-bound form with no client-side validation beyond native
 * input types, deferring to the injected Server Action's `parsePenForm` for
 * the actual rules. Reused for both create (no `defaultValues`, the
 * `/pens/new` page) and rename (`defaultValues` pre-fills the pen detail
 * page's inline rename form bound to `updatePenAction`), mirroring
 * `MilkRecordForm`/`WeightCheckinForm`'s shared create/edit pattern.
 */
export function PenForm({
  action,
  submitLabel,
  defaultValues,
  onCancel,
}: PenFormProps) {
  const [state, formAction, pending] = useActionState(
    action,
    initialPenActionState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="name" className="text-sm font-medium">
          Nombre
        </label>
        <input
          id="name"
          name="name"
          defaultValue={defaultValues?.name}
          aria-invalid={Boolean(state.errors.name)}
          className="rounded border border-border bg-surface-1 px-3 py-2 text-ink"
        />
        {state.errors.name && (
          <p role="alert" className="text-sm text-critical">
            {state.errors.name}
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
