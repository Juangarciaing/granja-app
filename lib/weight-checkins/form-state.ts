import type { WeightCheckinFormErrors } from "@/lib/weight-checkins/validate";

/**
 * Shared `useActionState` state shape for the "record"/"edit" weight
 * check-in forms — mirrors `lib/fattening-pigs/form-state.ts`. Kept in its
 * own pure module (no Next.js/server imports) so the client
 * `WeightCheckinForm` component never has to import the "use server"
 * actions module just to reference this type/default. One shared shape is
 * reused for both create and edit since both forms submit the same
 * `checkin_date`/`weight` fields (spec: "Record Weight Check-in").
 */
export type WeightCheckinActionState = {
  errors: WeightCheckinFormErrors;
};

export const initialWeightCheckinActionState: WeightCheckinActionState = {
  errors: {},
};
