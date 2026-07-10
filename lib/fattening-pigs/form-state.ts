import type { FatteningPigFormErrors } from "@/lib/fattening-pigs/validate";

/**
 * Shared `useActionState` state shape for the "register fattening pig"
 * form. Kept in its own pure module (no Next.js/server imports) — mirrors
 * `lib/sows/form-state.ts` — so the client `FatteningPigForm` component
 * never has to import the "use server" actions module just to reference
 * this type/default.
 */
export type FatteningPigActionState = {
  errors: FatteningPigFormErrors;
};

export const initialFatteningPigActionState: FatteningPigActionState = {
  errors: {},
};
