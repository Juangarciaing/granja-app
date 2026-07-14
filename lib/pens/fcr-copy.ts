import type { FcrResult } from "@/lib/pens/fcr";

/** What to render for a `FcrResult` — always a human Spanish message, never a raw code or generic "N/A". */
export type FcrDisplay = {
  text: string;
  chipClass: string;
};

/**
 * Maps each of `calcPenFcr`'s 3 N/A reasons to a clear Spanish explanation
 * of WHY the FCR can't be computed yet, rather than a raw reason code or a
 * generic "N/A" — the farmer needs to know what to do next (assign pigs,
 * log feed, or wait for a weigh-in), not just that a value is missing.
 */
const REASON_MESSAGES: Record<
  Extract<FcrResult, { ok: false }>["reason"],
  string
> = {
  no_pigs: "Este corral no tiene cerdos asignados",
  no_feed_logged: "Todavía no se registró alimento para este corral",
  no_weight_gain_yet:
    "Los cerdos de este corral todavía no tienen pesajes recientes",
};

/**
 * Pure UI-copy mapping for `calcPenFcr`'s result — kept side-effect-free so
 * it is trivially unit-testable, mirroring `formatWeightDelta`. `chipClass`
 * reuses the existing `.chip-good`/`.chip-neutral` design-system classes
 * (`app/globals.css`), same convention as the sow/farrowing status chips.
 */
export function describeFcrResult(result: FcrResult): FcrDisplay {
  if (result.ok) {
    return { text: `FCR ${result.fcr.toFixed(2)}`, chipClass: "chip-good" };
  }

  return { text: REASON_MESSAGES[result.reason], chipClass: "chip-neutral" };
}
