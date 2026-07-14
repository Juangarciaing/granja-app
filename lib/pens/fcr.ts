/**
 * Per-pig weight input for `calcPenFcr`. Every fattening pig always has an
 * `entryWeight` (DB `entry_weight not null check (entry_weight > 0)`,
 * migration 0003) — there is no "missing entry weight" state. `latestWeight`
 * is `null` only when the pig has zero `weight_checkins` yet; in that case
 * its gain contribution is 0, not a missing-data condition (see
 * `calcPenFcr`'s per-pig gain formula below).
 */
export type FcrPigWeight = {
  entryWeight: number;
  latestWeight: number | null;
};

/**
 * `calcPenFcr`'s result is exactly one of 4 shapes: 3 "not applicable"
 * reasons or a real computed ratio. `no_weight_gain_yet` is a genuine
 * computable state (Σ gain === 0, e.g. every assigned pig is still
 * unweighed since entry, or has weighed in at exactly its entry weight) —
 * NOT a data-quality problem, unlike a hypothetical "missing weight" state
 * that can never actually occur (every pig always has `entryWeight`).
 */
export type FcrResult =
  | { ok: false; reason: "no_pigs" | "no_feed_logged" | "no_weight_gain_yet" }
  | { ok: true; totalFedKg: number; totalGainKg: number; fcr: number };

/**
 * Rounds to 2 decimals (kg precision a farmer would actually measure),
 * same convention/precedent as `lib/feed/calc.ts`'s `calcDailyFeed`.
 */
function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Pure FCR (feed conversion ratio) calculation for a pen: total kg fed
 * divided by total kg gained across the pen's assigned pigs. Never stored —
 * always recomputed live from already-fetched data (mirrors
 * `buildFeedSummary`'s live-recompute contract), so this function makes no
 * Supabase/DB calls of its own; callers (`buildFcrPigWeights` + the pen
 * detail page) fetch feed_logs and pigs/weight_checkins first.
 *
 * Check order matters (spec-mandated, evaluated top to bottom):
 *   1. `pigs.length === 0` -> `no_pigs` (nothing assigned to the pen yet).
 *   2. `Σ feedKgs === 0` -> `no_feed_logged` (pen has pigs but no feed_logs
 *      rows yet, so there is nothing to divide).
 *   3. Per-pig gain = `(latestWeight ?? entryWeight) - entryWeight` — a pig
 *      with zero weight_checkins falls back to its own entryWeight, so it
 *      contributes exactly 0 gain (not a missing-data branch). If the
 *      summed gain across all assigned pigs is `<= 0` -> `no_weight_gain_yet`
 *      (division by zero would otherwise occur; this is a real, computable
 *      "not yet meaningful" state, not a data-quality error).
 *   4. Otherwise: `fcr = totalFedKg / totalGainKg`, rounded to 2 decimals.
 *      `totalFedKg`/`totalGainKg` are also rounded to 2 decimals in the
 *      success result to avoid surfacing floating-point summation drift
 *      (e.g. summing several `numeric(6,2)` feed/weight rows) — the `<= 0`
 *      gain check above is performed on the unrounded sum so a genuinely
 *      tiny positive gain is never misclassified as `no_weight_gain_yet`.
 */
export function calcPenFcr(
  feedKgs: number[],
  pigs: FcrPigWeight[],
): FcrResult {
  if (pigs.length === 0) {
    return { ok: false, reason: "no_pigs" };
  }

  const totalFedKgRaw = feedKgs.reduce((sum, kg) => sum + kg, 0);
  if (totalFedKgRaw === 0) {
    return { ok: false, reason: "no_feed_logged" };
  }

  const totalGainKgRaw = pigs.reduce((sum, pig) => {
    const latestKnownWeight = pig.latestWeight ?? pig.entryWeight;
    return sum + (latestKnownWeight - pig.entryWeight);
  }, 0);
  if (totalGainKgRaw <= 0) {
    return { ok: false, reason: "no_weight_gain_yet" };
  }

  return {
    ok: true,
    totalFedKg: round2(totalFedKgRaw),
    totalGainKg: round2(totalGainKgRaw),
    fcr: round2(totalFedKgRaw / totalGainKgRaw),
  };
}
