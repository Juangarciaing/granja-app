import type { WeightCheckin } from "@/lib/db/queries";

/**
 * Returns a pig's most recent recorded weight from its `weight_checkins`
 * list, or `null` when the pig has zero check-ins yet. The list MUST already
 * be ordered ascending by `checkin_date` (same contract as
 * `listWeightCheckinsForPig`) — the most recent check-in is therefore the
 * last entry.
 *
 * Single source of truth shared by `lib/pens/fcr-summary.ts`,
 * `lib/pens/fcr.ts` and the `/fattening-pigs` sale-readiness indicator — this
 * logic previously existed duplicated in the first two (spec: "Single Source
 * of Truth for Latest Known Weight").
 */
export function latestCheckinWeight(checkins: WeightCheckin[]): number | null {
  return checkins.length > 0 ? checkins[checkins.length - 1].weight : null;
}

/**
 * Resolves a pig's latest KNOWN weight: the most recent check-in weight if
 * one exists, otherwise the pig's `entry_weight`. Every fattening pig always
 * has an `entryWeight` (DB `entry_weight not null check (entry_weight > 0)`,
 * migration 0003), so this always returns a real number.
 */
export function resolveLatestKnownWeight(
  entryWeight: number,
  latestWeight: number | null,
): number {
  return latestWeight ?? entryWeight;
}
