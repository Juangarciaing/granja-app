import { describe, expect, it } from "vitest";

import {
  latestCheckinWeight,
  resolveLatestKnownWeight,
} from "@/lib/fattening-pigs/latest-weight";
import type { WeightCheckin } from "@/lib/db/queries";

function checkin(overrides: Partial<WeightCheckin> = {}): WeightCheckin {
  return {
    id: "checkin-1",
    user_id: "user-1",
    fattening_pig_id: "pig-1",
    checkin_date: "2026-07-15",
    weight: 22.3,
    created_at: "2026-07-15T00:00:00Z",
    updated_at: "2026-07-15T00:00:00Z",
    ...overrides,
  };
}

describe("latestCheckinWeight", () => {
  it("returns the last (most recent, ascending-order) check-in's weight when check-ins exist", () => {
    const checkins = [
      checkin({ id: "c-1", checkin_date: "2026-07-05", weight: 25 }),
      checkin({ id: "c-2", checkin_date: "2026-07-10", weight: 30 }),
      checkin({ id: "c-3", checkin_date: "2026-07-15", weight: 35 }),
    ];

    expect(latestCheckinWeight(checkins)).toBe(35);
  });

  it("returns null when the check-in list is empty", () => {
    expect(latestCheckinWeight([])).toBeNull();
  });
});

describe("resolveLatestKnownWeight", () => {
  it("returns the latest check-in weight when one is present", () => {
    expect(resolveLatestKnownWeight(20, 35)).toBe(35);
  });

  it("falls back to entryWeight when latestWeight is null (no check-ins yet)", () => {
    expect(resolveLatestKnownWeight(20, null)).toBe(20);
  });
});
