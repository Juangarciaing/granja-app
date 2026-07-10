import type { FeedingConfigFormErrors } from "@/lib/config/validate";

/**
 * Shared `useActionState` state shape for the feeding-config edit form.
 * Mirrors `lib/sows/form-state.ts` — kept in its own pure module (no
 * Next.js/server imports) so the client `ConfigForm` component never has to
 * import the "use server" actions module just to reference this type.
 */
export type ConfigActionState = {
  errors: FeedingConfigFormErrors;
};

export const initialConfigActionState: ConfigActionState = { errors: {} };
