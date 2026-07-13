import type { MilkRecordFormErrors } from "@/lib/milk-records/validate";

/**
 * Shared `useActionState` state shape for the "record"/"edit" milk record
 * forms — mirrors `lib/weight-checkins/form-state.ts`. Kept in its own pure
 * module (no Next.js/server imports) so the client `MilkRecordForm`
 * component never has to import the "use server" actions module just to
 * reference this type/default. The `record_date` error slot doubles as the
 * carrier for the `23505` duplicate-date guidance message returned by
 * `createMilkRecordAction` (design decision: "`23505` handled in create
 * action, not swallowed in query layer").
 */
export type MilkRecordActionState = {
  errors: MilkRecordFormErrors;
};

export const initialMilkRecordActionState: MilkRecordActionState = {
  errors: {},
};
