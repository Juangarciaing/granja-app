import { describe, expect, it } from "vitest";

import { calcPenFcr, type FcrPigWeight } from "@/lib/pens/fcr";

function pig(overrides: Partial<FcrPigWeight> = {}): FcrPigWeight {
  return { entryWeight: 20, latestWeight: null, ...overrides };
}

describe("calcPenFcr", () => {
  it('returns "no_pigs" when the pen has zero assigned pigs, regardless of feed logged', () => {
    const result = calcPenFcr([50, 30], []);

    expect(result).toEqual({ ok: false, reason: "no_pigs" });
  });

  it('returns "no_feed_logged" when the pen has pigs but zero feed_logs (empty feedKgs array)', () => {
    const result = calcPenFcr([], [pig()]);

    expect(result).toEqual({ ok: false, reason: "no_feed_logged" });
  });

  it('returns "no_feed_logged" when total fed sums to exactly 0 (e.g. feedKgs of zeros)', () => {
    const result = calcPenFcr([0, 0], [pig()]);

    expect(result).toEqual({ ok: false, reason: "no_feed_logged" });
  });

  it('returns "no_weight_gain_yet" when pigs are present and feed is logged, but summed gain is exactly 0 (all pigs unweighed since entry)', () => {
    const result = calcPenFcr(
      [50, 30],
      [pig({ entryWeight: 20, latestWeight: null }), pig({ entryWeight: 25, latestWeight: null })],
    );

    expect(result).toEqual({ ok: false, reason: "no_weight_gain_yet" });
  });

  it('returns "no_weight_gain_yet" when a weighed pig\'s latest check-in equals its entry weight (zero net gain)', () => {
    const result = calcPenFcr([50], [pig({ entryWeight: 20, latestWeight: 20 })]);

    expect(result).toEqual({ ok: false, reason: "no_weight_gain_yet" });
  });

  it("computes the real ratio (fed / gain) rounded to 2 decimals for a mixed set of pigs (some weighed, some not)", () => {
    // totalFedKg = 50 + 30 = 80
    // pig 1: gain = 35 - 20 = 15 (weighed)
    // pig 2: gain = 25 (entryWeight) - 25 (fallback, no check-ins) = 0 (unweighed)
    // totalGainKg = 15
    // fcr = 80 / 15 = 5.3333... -> round2 = 5.33
    const result = calcPenFcr(
      [50, 30],
      [pig({ entryWeight: 20, latestWeight: 35 }), pig({ entryWeight: 25, latestWeight: null })],
    );

    expect(result).toEqual({
      ok: true,
      totalFedKg: 80,
      totalGainKg: 15,
      fcr: 5.33,
    });
  });

  it("sums feed and gain across multiple weighed pigs and avoids floating-point drift", () => {
    // totalFedKg = 10.5 + 10.5 = 21
    // pig 1: gain = 12.3 - 10 = 2.3
    // pig 2: gain = 12.4 - 10 = 2.4
    // totalGainKg = 4.7
    // fcr = 21 / 4.7 = 4.4680... -> round2 = 4.47
    const result = calcPenFcr(
      [10.5, 10.5],
      [pig({ entryWeight: 10, latestWeight: 12.3 }), pig({ entryWeight: 10, latestWeight: 12.4 })],
    );

    expect(result).toEqual({
      ok: true,
      totalFedKg: 21,
      totalGainKg: 4.7,
      fcr: 4.47,
    });
  });

  it("checks no_pigs before no_feed_logged (empty pigs with zero feed still reports no_pigs)", () => {
    const result = calcPenFcr([], []);

    expect(result).toEqual({ ok: false, reason: "no_pigs" });
  });
});
