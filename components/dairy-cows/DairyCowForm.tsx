"use client";

import { useActionState } from "react";

import {
  initialDairyCowActionState,
  type DairyCowActionState,
} from "@/lib/dairy-cows/form-state";

type DairyCowFormProps = {
  action: (
    state: DairyCowActionState,
    formData: FormData,
  ) => Promise<DairyCowActionState>;
  submitLabel: string;
};

/**
 * "Register dairy cow" form — spec "Register a dairy cow" requires only
 * `ear_tag`. Mirrors `FatteningPigForm`: a plain `useActionState`-bound form
 * with no client-side validation beyond native input types, deferring to
 * the injected Server Action's `parseDairyCowForm` for the actual rules.
 */
export function DairyCowForm({ action, submitLabel }: DairyCowFormProps) {
  const [state, formAction, pending] = useActionState(
    action,
    initialDairyCowActionState,
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

      <button type="submit" disabled={pending} className="btn-primary">
        {submitLabel}
      </button>
    </form>
  );
}
