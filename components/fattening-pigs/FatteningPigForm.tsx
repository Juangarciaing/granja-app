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
 * arete, fecha_ingreso and peso_inicial. Mirrors `SowForm`/`FarrowingForm`:
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
        <label htmlFor="arete" className="text-sm font-medium">
          Arete
        </label>
        <input
          id="arete"
          name="arete"
          aria-invalid={Boolean(state.errors.arete)}
          className="rounded border px-3 py-2"
        />
        {state.errors.arete && (
          <p role="alert" className="text-sm text-red-600">
            {state.errors.arete}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="fecha_ingreso" className="text-sm font-medium">
          Fecha de ingreso
        </label>
        <input
          id="fecha_ingreso"
          name="fecha_ingreso"
          type="date"
          aria-invalid={Boolean(state.errors.fecha_ingreso)}
          className="rounded border px-3 py-2"
        />
        {state.errors.fecha_ingreso && (
          <p role="alert" className="text-sm text-red-600">
            {state.errors.fecha_ingreso}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="peso_inicial" className="text-sm font-medium">
          Peso inicial (kg)
        </label>
        <input
          id="peso_inicial"
          name="peso_inicial"
          type="number"
          min={0}
          step="any"
          aria-invalid={Boolean(state.errors.peso_inicial)}
          className="rounded border px-3 py-2"
        />
        {state.errors.peso_inicial && (
          <p role="alert" className="text-sm text-red-600">
            {state.errors.peso_inicial}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={pending}
        className="rounded bg-zinc-900 px-4 py-2 text-sm text-white disabled:opacity-60 dark:bg-white dark:text-zinc-900"
      >
        {submitLabel}
      </button>
    </form>
  );
}
