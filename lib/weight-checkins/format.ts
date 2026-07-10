/**
 * Formats a weight check-in's delta versus the pig's `entry_weight` for
 * display in the growth history table (v1 scope: plain table, no chart —
 * see `sdd/control-peso-engorde/tasks` Phase 4.1). Always shows an explicit
 * sign so a loss vs. entry weight isn't visually indistinguishable from a
 * gain — a bare "1.50 kg" reads as ambiguous, "+1.50 kg"/"-1.50 kg" do not.
 */
export function formatWeightDelta(deltaKg: number): string {
  const sign = deltaKg > 0 ? "+" : deltaKg < 0 ? "-" : "";
  return `${sign}${Math.abs(deltaKg).toFixed(2)} kg`;
}
