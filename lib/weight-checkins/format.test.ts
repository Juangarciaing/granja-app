import { describe, expect, it } from "vitest";
import { formatWeightDelta } from "@/lib/weight-checkins/format";

describe("formatWeightDelta", () => {
  it("formats a weight gain vs. entry_weight with an explicit + sign", () => {
    expect(formatWeightDelta(3.2)).toBe("+3.20 kg");
  });

  it("formats a weight loss vs. entry_weight with an explicit - sign", () => {
    expect(formatWeightDelta(-1.5)).toBe("-1.50 kg");
  });

  it("formats no change vs. entry_weight with no sign", () => {
    expect(formatWeightDelta(0)).toBe("0.00 kg");
  });
});
