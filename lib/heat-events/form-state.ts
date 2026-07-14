import type { HeatEventFormErrors } from "@/lib/heat-events/validate";

/**
 * Shared `useActionState` state shape for the "record"/"edit" heat event
 * forms — mirrors `lib/milk-records/form-state.ts`. Kept in its own pure
 * module (no Next.js/server imports) so the client `HeatEventForm`
 * component never has to import the "use server" actions module just to
 * reference this type/default.
 */
export type HeatEventActionState = {
  errors: HeatEventFormErrors;
};

export const initialHeatEventActionState: HeatEventActionState = {
  errors: {},
};
