"use client";

import { useActionState } from "react";

import { initialSowActionState, type SowActionState } from "@/lib/sows/form-state";

const STATUS_OPTIONS: Array<{ value: string; label: string }> = [
  { value: "active", label: "Activa" },
  { value: "sold", label: "Vendida" },
  { value: "culled", label: "Descartada" },
  { value: "dead", label: "Muerta" },
];

export type SowFormDefaults = {
  name?: string;
  birth_date?: string | null;
  status?: string;
  notes?: string | null;
};

type SowFormProps = {
  action: (
    state: SowActionState,
    formData: FormData,
  ) => Promise<SowActionState>;
  defaultValues?: SowFormDefaults;
  submitLabel: string;
};

export function SowForm({ action, defaultValues, submitLabel }: SowFormProps) {
  const [state, formAction, pending] = useActionState(
    action,
    initialSowActionState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="name" className="text-sm font-medium">
          Arete
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

      <div className="flex flex-col gap-1">
        <label htmlFor="birth_date" className="text-sm font-medium">
          Fecha de nacimiento
        </label>
        <input
          id="birth_date"
          name="birth_date"
          type="date"
          defaultValue={defaultValues?.birth_date ?? ""}
          className="rounded border border-border bg-surface-1 px-3 py-2 font-mono tabular-nums text-ink"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="status" className="text-sm font-medium">
          Estado
        </label>
        <select
          id="status"
          name="status"
          defaultValue={defaultValues?.status ?? "active"}
          className="rounded border border-border bg-surface-1 px-3 py-2 text-ink"
        >
          {STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {state.errors.status && (
          <p role="alert" className="text-sm text-critical">
            {state.errors.status}
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

      <button type="submit" disabled={pending} className="btn-primary">
        {submitLabel}
      </button>
    </form>
  );
}
