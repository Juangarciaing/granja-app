import type { FatteningPig, WeightCheckin } from "@/lib/db/queries";
import { latestCheckinWeight } from "@/lib/fattening-pigs/latest-weight";
import type { FcrPigWeight } from "@/lib/pens/fcr";

/**
 * Thin wiring between the DB query layer and pure `calcPenFcr`, analogous to
 * `buildFeedSummary`. Maps a pen's assigned pigs plus a per-pig map of their
 * `weight_checkins` (each list already ordered ascending by `checkin_date`,
 * same contract as `listWeightCheckinsForPig`) to `FcrPigWeight[]`.
 *
 * `latestWeight` comes from the shared `latestCheckinWeight` helper (single
 * source of truth for "latest known weight", spec: "Single Source of Truth
 * for Latest Known Weight") — `null` when the pig has zero check-ins yet,
 * which `calcPenFcr` treats as "fall back to entryWeight" (0 gain), not as a
 * missing-data error. Kept Supabase-free so it stays trivially unit-testable,
 * same rationale as `buildFeedSummary`.
 */
export function buildFcrPigWeights(
  pigs: FatteningPig[],
  checkinsByPig: Map<string, WeightCheckin[]>,
): FcrPigWeight[] {
  return pigs.map((pig) => {
    const checkins = checkinsByPig.get(pig.id) ?? [];
    const latestWeight = latestCheckinWeight(checkins);

    return { entryWeight: pig.entry_weight, latestWeight };
  });
}
