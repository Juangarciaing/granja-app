import type { FeedLogFormErrors, PenFormErrors } from "@/lib/pens/validate";

/**
 * Shared `useActionState` state shape for the pen create/edit form — mirrors
 * `lib/sows/form-state.ts`.
 */
export type PenActionState = {
  errors: PenFormErrors;
};

export const initialPenActionState: PenActionState = {
  errors: {},
};

/**
 * Shared `useActionState` state shape for the "log"/"edit" feed-log forms —
 * mirrors `lib/milk-records/form-state.ts`. The `log_date` error slot
 * doubles as the carrier for the `23505` duplicate-date guidance message
 * returned by `createFeedLogAction` (same contract as
 * `createMilkRecordAction`).
 */
export type FeedLogActionState = {
  errors: FeedLogFormErrors;
};

export const initialFeedLogActionState: FeedLogActionState = {
  errors: {},
};
