import type { Pen } from "@/lib/db/queries";
import { calcPenFcr, type FcrPigWeight, type FcrResult } from "@/lib/pens/fcr";

export type PenFcrRow = {
  pen: Pen;
  fcr: FcrResult;
};

/**
 * Thin wiring between the query layer and pure `calcPenFcr`, analogous to
 * `buildFeedSummary`/`buildFcrPigWeights`. Maps every pen to its own
 * `calcPenFcr` result using per-pen feed-kg lists and pig weights already
 * fetched by the caller (the pens list page) — a pen with no entry in
 * either map is treated the same as an empty list (`?? []`), which
 * `calcPenFcr` already resolves to the correct N/A reason (`no_pigs` takes
 * precedence over `no_feed_logged`, same check order as the pure function).
 * Kept Supabase-free so it stays trivially unit-testable.
 */
export function buildPenFcrRows(
  pens: Pen[],
  feedKgsByPen: Map<string, number[]>,
  pigWeightsByPen: Map<string, FcrPigWeight[]>,
): PenFcrRow[] {
  return pens.map((pen) => ({
    pen,
    fcr: calcPenFcr(
      feedKgsByPen.get(pen.id) ?? [],
      pigWeightsByPen.get(pen.id) ?? [],
    ),
  }));
}
