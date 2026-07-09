import type { SowFormErrors } from "@/lib/sows/validate";

/**
 * Shared `useActionState` state shape for the sow create/edit forms. Kept
 * in its own pure module (no Next.js/server imports) so the client
 * `SowForm` component never has to import the "use server" actions module
 * just to reference this type/default — it only depends on this and an
 * injected `action` prop.
 */
export type SowActionState = {
  errors: SowFormErrors;
};

export const initialSowActionState: SowActionState = { errors: {} };
