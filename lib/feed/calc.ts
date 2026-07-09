export type FeedingConfig = {
  base_kg: number;
  kg_per_piglet: number;
};

/**
 * Pure daily feed calculation for a lactating sow: `base_kg + kg_per_piglet
 * * currentPiglets`. Not persisted anywhere (matches the "no audit log" v1
 * scope) — always recomputed live from the current feeding_config and the
 * farrowing's live piglet count, so a config edit immediately changes the
 * result on next call with no versioning/history involved.
 */
export function calcDailyFeed(
  config: FeedingConfig,
  currentPiglets: number,
): number {
  return config.base_kg + config.kg_per_piglet * currentPiglets;
}
