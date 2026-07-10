import { calcDailyFeed, type FeedingConfig } from "@/lib/feed/calc";
import type { Farrowing, Sow } from "@/lib/db/queries";

export type FeedSummaryRow = {
  farrowingId: string;
  sowName: string;
  currentPiglets: number;
  dailyFeedKg: number;
};

/**
 * Wires `calcDailyFeed` (PR2) against `listActiveFarrowings` (PR4, already
 * excludes weaned farrowings — spec: "Weaned farrowing excluded") and the
 * current `feeding_config`. Pure and side-effect-free so the live-recompute
 * contract (spec: "Config changed mid-lactation" — no stored/stale value,
 * always derived from the current config) is trivially unit-testable
 * without touching Supabase/Next.js. Callers (the dashboard RSC) pass in
 * fresh reads on every request; there is nothing to invalidate/cascade.
 */
export function buildFeedSummary(
  activeFarrowings: Farrowing[],
  sows: Sow[],
  config: FeedingConfig,
): FeedSummaryRow[] {
  const sowNameById = new Map(sows.map((sow) => [sow.id, sow.name]));

  return activeFarrowings.map((farrowing) => ({
    farrowingId: farrowing.id,
    sowName: sowNameById.get(farrowing.sow_id) ?? "Desconocida",
    currentPiglets: farrowing.current_piglets,
    dailyFeedKg: calcDailyFeed(config, farrowing.current_piglets),
  }));
}
