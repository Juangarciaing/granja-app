import type { FatteningPig, WeightCheckin } from "@/lib/db/queries";
import type { FcrPigWeight } from "@/lib/pens/fcr";

/**
 * Thin wiring between the DB query layer and pure `calcPenFcr`, analogous to
 * `buildFeedSummary`. Maps a pen's assigned pigs plus a per-pig map of their
 * `weight_checkins` (each list already ordered ascending by `checkin_date`,
 * same contract as `listWeightCheckinsForPig`) to `FcrPigWeight[]`.
 *
 * `latestWeight` is the LAST entry of each pig's ascending check-in list
 * (the most recent weigh-in), or `null` when the pig has zero check-ins yet
 * — `calcPenFcr` treats that `null` as "fall back to entryWeight" (0 gain),
 * not as a missing-data error. Kept Supabase-free so it stays trivially
 * unit-testable, same rationale as `buildFeedSummary`.
 */
export function buildFcrPigWeights(
  pigs: FatteningPig[],
  checkinsByPig: Map<string, WeightCheckin[]>,
): FcrPigWeight[] {
  return pigs.map((pig) => {
    const checkins = checkinsByPig.get(pig.id) ?? [];
    const latestWeight =
      checkins.length > 0 ? checkins[checkins.length - 1].weight : null;

    return { entryWeight: pig.entry_weight, latestWeight };
  });
}
