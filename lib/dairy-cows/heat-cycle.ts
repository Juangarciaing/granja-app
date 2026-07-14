/**
 * Pure, UTC-safe date arithmetic for the heat (celo) cycle projection
 * (spec: "Compute next expected heat date", "Classify upcoming vs.
 * overdue"). This is the first pure date-arithmetic module in the codebase
 * — dates are always parsed by UTC component (`Date.UTC(y, m-1, d)`), never
 * via `new Date(dateString)`, so month/year rollover is handled by
 * `setUTCDate` and there is no DST/timezone drift (design decision:
 * "UTC-safe date arithmetic").
 */

/** Standard bovine estrus cycle length, in days. */
export const HEAT_CYCLE_DAYS = 21;

/** Parses a `YYYY-MM-DD` string into UTC date components. */
function parseUtcDateComponents(dateString: string): {
  year: number;
  month: number;
  day: number;
} {
  const [year, month, day] = dateString.split("-").map(Number);
  return { year, month, day };
}

/** Formats a `Date` back to `YYYY-MM-DD` using its UTC components. */
function formatUtcDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/**
 * Computes the next expected heat date from the most recent observation:
 * `lastObservedDate + HEAT_CYCLE_DAYS` (spec: "Compute next expected heat
 * date"). Uses `Date.UTC` component parsing plus `setUTCDate` so
 * month/year rollover (including leap years) is handled correctly with no
 * timezone drift.
 */
export function nextExpectedHeatDate(lastObservedDate: string): string {
  const { year, month, day } = parseUtcDateComponents(lastObservedDate);
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() + HEAT_CYCLE_DAYS);
  return formatUtcDate(date);
}

export type HeatStatus = "upcoming" | "overdue";

/**
 * Classifies a computed next-expected-heat date against `today` (an
 * explicit parameter for determinism/testability — design decision:
 * "`today` is derived UTC + explicit function param"). The expected date
 * itself is still "upcoming" — it is the day to watch, not yet missed;
 * only strictly after it does the status become "overdue" (design
 * decision: "'upcoming' vs 'overdue' boundary — inclusive on the expected
 * day").
 */
export function heatStatus(
  nextExpectedDate: string,
  today: string,
): HeatStatus {
  const { year: ey, month: em, day: ed } = parseUtcDateComponents(nextExpectedDate);
  const { year: ty, month: tm, day: td } = parseUtcDateComponents(today);

  const expectedMs = Date.UTC(ey, em - 1, ed);
  const todayMs = Date.UTC(ty, tm - 1, td);

  return todayMs > expectedMs ? "overdue" : "upcoming";
}
