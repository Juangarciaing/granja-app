import { describe, expect, it } from "vitest";

import { buildFeedSummary } from "@/lib/dashboard/feed-summary";
import type { Farrowing, Sow } from "@/lib/db/queries";

function sow(overrides: Partial<Sow> = {}): Sow {
  return {
    id: "sow-1",
    user_id: "user-1",
    name: "Cerda 12",
    birth_date: null,
    status: "active",
    notes: null,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

function farrowing(overrides: Partial<Farrowing> = {}): Farrowing {
  return {
    id: "farrowing-1",
    user_id: "user-1",
    sow_id: "sow-1",
    farrowing_date: "2026-06-01",
    born_alive: 8,
    current_piglets: 8,
    status: "lactating",
    weaning_date: null,
    created_at: "2026-06-01T00:00:00Z",
    updated_at: "2026-06-01T00:00:00Z",
    ...overrides,
  };
}

describe("buildFeedSummary", () => {
  it("maps each active farrowing to its sow name, live piglet count, and computed daily feed", () => {
    const result = buildFeedSummary(
      [farrowing({ current_piglets: 8 })],
      [sow()],
      { base_kg: 2, kg_per_piglet: 0.4 },
    );

    expect(result).toEqual([
      {
        farrowingId: "farrowing-1",
        sowName: "Cerda 12",
        currentPiglets: 8,
        dailyFeedKg: 5.2,
      },
    ]);
  });

  it("handles multiple active farrowings across different sows", () => {
    const result = buildFeedSummary(
      [
        farrowing({ id: "f-1", sow_id: "sow-1", current_piglets: 8 }),
        farrowing({ id: "f-2", sow_id: "sow-2", current_piglets: 0 }),
      ],
      [sow({ id: "sow-1", name: "Cerda 12" }), sow({ id: "sow-2", name: "Cerda 7" })],
      { base_kg: 2, kg_per_piglet: 0.4 },
    );

    expect(result).toEqual([
      { farrowingId: "f-1", sowName: "Cerda 12", currentPiglets: 8, dailyFeedKg: 5.2 },
      { farrowingId: "f-2", sowName: "Cerda 7", currentPiglets: 0, dailyFeedKg: 2 },
    ]);
  });

  it("immediately reflects a changed feeding_config for the same farrowings — no stored/stale value", () => {
    const farrowings = [farrowing({ current_piglets: 8 })];
    const sows = [sow()];

    const before = buildFeedSummary(farrowings, sows, {
      base_kg: 2,
      kg_per_piglet: 0.4,
    });
    const after = buildFeedSummary(farrowings, sows, {
      base_kg: 2.5,
      kg_per_piglet: 0.5,
    });

    expect(before[0].dailyFeedKg).toBe(5.2);
    expect(after[0].dailyFeedKg).toBe(6.5);
  });

  it("falls back to a placeholder label when a farrowing's sow cannot be found", () => {
    const result = buildFeedSummary(
      [farrowing({ sow_id: "missing-sow" })],
      [sow()],
      { base_kg: 2, kg_per_piglet: 0.4 },
    );

    expect(result[0].sowName).toBe("Desconocida");
  });

  it("returns an empty list when there are no active farrowings", () => {
    const result = buildFeedSummary([], [sow()], {
      base_kg: 2,
      kg_per_piglet: 0.4,
    });

    expect(result).toEqual([]);
  });
});
