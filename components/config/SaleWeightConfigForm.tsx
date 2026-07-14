"use client";

import { useActionState } from "react";

import {
  initialSaleWeightConfigActionState,
  type SaleWeightConfigActionState,
} from "@/lib/config/sale-weight-form-state";

export type SaleWeightConfigFormDefaults = {
  target_weight_kg: number;
};

type SaleWeightConfigFormProps = {
  action: (
    state: SaleWeightConfigActionState,
    formData: FormData,
  ) => Promise<SaleWeightConfigActionState>;
  defaultValues: SaleWeightConfigFormDefaults;
};

/**
 * Edit form for the singleton `sale_weight_config` row. Mirrors `ConfigForm`
 * — there is no "create" flow, migration 0006's auto-provisioning trigger
 * plus backfill guarantee exactly one row always exists, so this form only
 * ever overwrites `target_weight_kg` in place (spec: "Farmer edits the
 * target"). Owns its own `useActionState`, independent of `ConfigForm`'s.
 */
export function SaleWeightConfigForm({
  action,
  defaultValues,
}: SaleWeightConfigFormProps) {
  const [state, formAction, pending] = useActionState(
    action,
    initialSaleWeightConfigActionState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="target_weight_kg" className="text-sm font-medium">
          Peso objetivo de venta (kg)
        </label>
        <input
          id="target_weight_kg"
          name="target_weight_kg"
          type="number"
          step="0.01"
          min="0"
          defaultValue={defaultValues.target_weight_kg}
          aria-invalid={Boolean(state.errors.target_weight_kg)}
          className="rounded border border-border bg-surface-1 px-3 py-2 font-mono tabular-nums text-ink"
        />
        {state.errors.target_weight_kg && (
          <p role="alert" className="text-sm text-critical">
            {state.errors.target_weight_kg}
          </p>
        )}
      </div>

      <button type="submit" disabled={pending} className="btn-primary">
        Guardar cambios
      </button>
    </form>
  );
}
