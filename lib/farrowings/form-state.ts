import type { FarrowingFormErrors } from "@/lib/farrowings/validate";

/**
 * Shared `useActionState` state shape for the "record farrowing" form. Kept
 * in its own pure module — mirrors `lib/sows/form-state.ts` — so the client
 * `FarrowingForm` component never has to import the "use server" actions
 * module just to reference this type/default.
 */
export type FarrowingActionState = {
  errors: FarrowingFormErrors;
};

export const initialFarrowingActionState: FarrowingActionState = {
  errors: {},
};
