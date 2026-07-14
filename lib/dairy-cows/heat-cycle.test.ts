import { describe, expect, it } from "vitest";

import {
  HEAT_CYCLE_DAYS,
  heatStatus,
  nextExpectedHeatDate,
} from "@/lib/dairy-cows/heat-cycle";

describe("HEAT_CYCLE_DAYS", () => {
  it("is 21 days, the standard bovine estrus cycle length", () => {
    expect(HEAT_CYCLE_DAYS).toBe(21);
  });
});

describe("nextExpectedHeatDate", () => {
  it("adds 21 days within the same month (spec: 'Standard projection')", () => {
    expect(nextExpectedHeatDate("2026-07-01")).toBe("2026-07-22");
  });

  it("rolls over a month/year boundary without timezone drift (spec: 'Month/year boundary')", () => {
    expect(nextExpectedHeatDate("2026-12-15")).toBe("2027-01-05");
  });

  it("rolls over a plain month boundary that does not cross a year", () => {
    expect(nextExpectedHeatDate("2026-01-20")).toBe("2026-02-10");
  });

  it("handles a leap-year February correctly (Feb 2028 has 29 days)", () => {
    expect(nextExpectedHeatDate("2028-02-10")).toBe("2028-03-02");
  });
});

describe("heatStatus", () => {
  it("is 'upcoming' the day before the expected date", () => {
    expect(heatStatus("2026-07-22", "2026-07-21")).toBe("upcoming");
  });

  it("is 'upcoming' ON the expected date itself — the day to watch, not yet missed (corrected boundary)", () => {
    expect(heatStatus("2026-07-22", "2026-07-22")).toBe("upcoming");
  });

  it("is 'overdue' the day after the expected date", () => {
    expect(heatStatus("2026-07-22", "2026-07-23")).toBe("overdue");
  });

  it("is 'overdue' when clearly past the expected date", () => {
    expect(heatStatus("2026-07-22", "2026-07-25")).toBe("overdue");
  });
});
