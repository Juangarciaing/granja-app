/**
 * Binary sale-readiness classifier (spec: "Binary 'Listo para vender' Chip").
 * A pig is ready for sale when its latest known weight is greater than or
 * equal to the account's target weight — inclusive boundary, not `>`. There
 * is no intermediate/"approaching" state; this is a pure, two-valued
 * classifier only.
 */
export function isReadyForSale(
  latestKnownWeight: number,
  targetWeightKg: number,
): boolean {
  return latestKnownWeight >= targetWeightKg;
}
