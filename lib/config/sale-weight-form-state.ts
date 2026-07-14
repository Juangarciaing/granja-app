import type { SaleWeightConfigFormErrors } from "@/lib/config/sale-weight-validate";

/**
 * Shared `useActionState` state shape for the sale-weight-config edit form.
 * Mirrors `lib/config/form-state.ts` — kept in its own pure module (no
 * Next.js/server imports) so the client `SaleWeightConfigForm` component
 * never has to import the "use server" actions module just to reference
 * this type.
 */
export type SaleWeightConfigActionState = {
  errors: SaleWeightConfigFormErrors;
};

export const initialSaleWeightConfigActionState: SaleWeightConfigActionState = {
  errors: {},
};
