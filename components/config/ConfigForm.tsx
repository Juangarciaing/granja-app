"use client";

import { useActionState } from "react";

import {
  initialConfigActionState,
  type ConfigActionState,
} from "@/lib/config/form-state";

export type ConfigFormDefaults = {
  base_kg: number;
  kg_per_piglet: number;
};

type ConfigFormProps = {
  action: (
    state: ConfigActionState,
    formData: FormData,
  ) => Promise<ConfigActionState>;
  defaultValues: ConfigFormDefaults;
};

/**
 * Edit form for the singleton `feeding_config` row. There is no "create"
 * flow here — PR1's auto-provisioning trigger guarantees exactly one row
 * always exists, so this form only ever overwrites `base_kg`/
 * `kg_per_piglet` in place (spec: "Edit Feeding Config").
 */
export function ConfigForm({ action, defaultValues }: ConfigFormProps) {
  const [state, formAction, pending] = useActionState(
    action,
    initialConfigActionState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="base_kg" className="text-sm font-medium">
          Ración base (kg)
        </label>
        <input
          id="base_kg"
          name="base_kg"
          type="number"
          step="0.01"
          min="0"
          defaultValue={defaultValues.base_kg}
          aria-invalid={Boolean(state.errors.base_kg)}
          className="rounded border border-border bg-surface-1 px-3 py-2 font-mono tabular-nums text-ink"
        />
        {state.errors.base_kg && (
          <p role="alert" className="text-sm text-critical">
            {state.errors.base_kg}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="kg_per_piglet" className="text-sm font-medium">
          Alimento por lechón (kg)
        </label>
        <input
          id="kg_per_piglet"
          name="kg_per_piglet"
          type="number"
          step="0.01"
          min="0"
          defaultValue={defaultValues.kg_per_piglet}
          aria-invalid={Boolean(state.errors.kg_per_piglet)}
          className="rounded border border-border bg-surface-1 px-3 py-2 font-mono tabular-nums text-ink"
        />
        {state.errors.kg_per_piglet && (
          <p role="alert" className="text-sm text-critical">
            {state.errors.kg_per_piglet}
          </p>
        )}
      </div>

      <button type="submit" disabled={pending} className="btn-primary">
        Guardar cambios
      </button>
    </form>
  );
}
