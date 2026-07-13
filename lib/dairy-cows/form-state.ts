import type { DairyCowFormErrors } from "@/lib/dairy-cows/validate";

/**
 * Shared `useActionState` state shape for the "register dairy cow" form.
 * Kept in its own pure module (no Next.js/server imports) — mirrors
 * `lib/fattening-pigs/form-state.ts` — so the client `DairyCowForm`
 * component never has to import the "use server" actions module just to
 * reference this type/default.
 */
export type DairyCowActionState = {
  errors: DairyCowFormErrors;
};

export const initialDairyCowActionState: DairyCowActionState = {
  errors: {},
};
