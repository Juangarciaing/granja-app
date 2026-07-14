import { describe, expect, it } from "vitest";

import { buildFcrPigWeights } from "@/lib/pens/fcr-summary";
import type { FatteningPig, WeightCheckin } from "@/lib/db/queries";

function fatteningPig(overrides: Partial<FatteningPig> = {}): FatteningPig {
  return {
    id: "pig-1",
    user_id: "user-1",
    ear_tag: "A12",
    entry_date: "2026-07-01",
    entry_weight: 18.5,
    exit_date: null,
    pen_id: "pen-1",
    created_at: "2026-07-01T00:00:00Z",
    updated_at: "2026-07-01T00:00:00Z",
    ...overrides,
  };
}

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

describe("buildFcrPigWeights", () => {
  it("maps each pig to its entryWeight plus the latest (last, ascending-order) check-in weight", () => {
    const pigs = [fatteningPig({ id: "pig-1", entry_weight: 18.5 })];
    const checkinsByPig = new Map([
      [
        "pig-1",
        [
          checkin({ id: "c-1", checkin_date: "2026-07-05", weight: 20 }),
          checkin({ id: "c-2", checkin_date: "2026-07-15", weight: 23.4 }),
        ],
      ],
    ]);

    const result = buildFcrPigWeights(pigs, checkinsByPig);

    expect(result).toEqual([{ entryWeight: 18.5, latestWeight: 23.4 }]);
  });

  it("maps a pig with zero check-ins to latestWeight: null", () => {
    const pigs = [fatteningPig({ id: "pig-2", entry_weight: 20 })];
    const checkinsByPig = new Map<string, WeightCheckin[]>();

    const result = buildFcrPigWeights(pigs, checkinsByPig);

    expect(result).toEqual([{ entryWeight: 20, latestWeight: null }]);
  });

  it("maps multiple pigs independently, some weighed and some not", () => {
    const pigs = [
      fatteningPig({ id: "pig-1", entry_weight: 18.5 }),
      fatteningPig({ id: "pig-2", entry_weight: 20 }),
    ];
    const checkinsByPig = new Map([
      ["pig-1", [checkin({ id: "c-1", fattening_pig_id: "pig-1", weight: 22.3 })]],
    ]);

    const result = buildFcrPigWeights(pigs, checkinsByPig);

    expect(result).toEqual([
      { entryWeight: 18.5, latestWeight: 22.3 },
      { entryWeight: 20, latestWeight: null },
    ]);
  });

  it("returns an empty list when there are no pigs", () => {
    const result = buildFcrPigWeights([], new Map());

    expect(result).toEqual([]);
  });
});
