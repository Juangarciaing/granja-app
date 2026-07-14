import { describe, expect, it } from "vitest";

import { buildPenFcrRows } from "@/lib/pens/list-fcr";
import type { Pen } from "@/lib/db/queries";

function pen(id: string, name: string): Pen {
  return {
    id,
    user_id: "user-1",
    name,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  };
}

describe("buildPenFcrRows", () => {
  it("computes each pen's FCR from its own feed-kg list and pig weights", () => {
    const pens = [pen("pen-1", "Corral 1"), pen("pen-2", "Corral 2")];
    const feedKgsByPen = new Map([
      ["pen-1", [50, 50]],
      ["pen-2", []],
    ]);
    const pigWeightsByPen = new Map([
      ["pen-1", [{ entryWeight: 20, latestWeight: 60 }]],
      ["pen-2", []],
    ]);

    const rows = buildPenFcrRows(pens, feedKgsByPen, pigWeightsByPen);

    expect(rows).toEqual([
      {
        pen: pens[0],
        fcr: { ok: true, totalFedKg: 100, totalGainKg: 40, fcr: 2.5 },
      },
      { pen: pens[1], fcr: { ok: false, reason: "no_pigs" } },
    ]);
  });

  it("treats a pen missing from either map as having no data logged/assigned", () => {
    const pens = [pen("pen-1", "Corral 1")];

    const rows = buildPenFcrRows(pens, new Map(), new Map());

    expect(rows).toEqual([
      { pen: pens[0], fcr: { ok: false, reason: "no_pigs" } },
    ]);
  });
});
