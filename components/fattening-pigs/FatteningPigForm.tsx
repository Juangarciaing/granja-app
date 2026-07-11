"use client";

import { useActionState } from "react";

import {
  initialFatteningPigActionState,
  type FatteningPigActionState,
} from "@/lib/fattening-pigs/form-state";

type FatteningPigFormProps = {
  action: (
    state: FatteningPigActionState,
    formData: FormData,
  ) => Promise<FatteningPigActionState>;
  submitLabel: string;
};

/**
 * "Register fattening pig" form — spec "Register Fattening Pig" requires
 * ear_tag, entry_date and entry_weight. Mirrors `SowForm`/`FarrowingForm`:
 * a plain `useActionState`-bound form with no client-side validation beyond
 * native input types, deferring to the injected Server Action's
 * `parseFatteningPigForm` for the actual rules.
 */
export function FatteningPigForm({ action, submitLabel }: FatteningPigFormProps) {
  const [state, formAction, pending] = useActionState(
    action,
    initialFatteningPigActionState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="ear_tag" className="text-sm font-medium">
          Arete
        </label>
        <input
          id="ear_tag"
          name="ear_tag"
          aria-invalid={Boolean(state.errors.ear_tag)}
          className="rounded border border-border bg-surface-1 px-3 py-2 text-ink"
        />
        {state.errors.ear_tag && (
          <p role="alert" className="text-sm text-critical">
            {state.errors.ear_tag}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="entry_date" className="text-sm font-medium">
          Fecha de ingreso
        </label>
        <input
          id="entry_date"
          name="entry_date"
          type="date"
          aria-invalid={Boolean(state.errors.entry_date)}
          className="rounded border border-border bg-surface-1 px-3 py-2 font-mono tabular-nums text-ink"
        />
        {state.errors.entry_date && (
          <p role="alert" className="text-sm text-critical">
            {state.errors.entry_date}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="entry_weight" className="text-sm font-medium">
          Peso inicial (kg)
        </label>
        <input
          id="entry_weight"
          name="entry_weight"
          type="number"
          min={0}
          step="any"
          aria-invalid={Boolean(state.errors.entry_weight)}
          className="rounded border border-border bg-surface-1 px-3 py-2 font-mono tabular-nums text-ink"
        />
        {state.errors.entry_weight && (
          <p role="alert" className="text-sm text-critical">
            {state.errors.entry_weight}
          </p>
        )}
      </div>

      <button type="submit" disabled={pending} className="btn-primary">
        {submitLabel}
      </button>
    </form>
  );
}
