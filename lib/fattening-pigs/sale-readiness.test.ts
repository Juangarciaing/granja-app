import { describe, expect, it } from "vitest";

import { isReadyForSale } from "@/lib/fattening-pigs/sale-readiness";

describe("isReadyForSale", () => {
  it("returns true when the latest known weight is above the target", () => {
    expect(isReadyForSale(105, 100)).toBe(true);
  });

  it("returns false when the latest known weight is below the target", () => {
    expect(isReadyForSale(95, 100)).toBe(false);
  });

  it("returns true when the latest known weight equals the target exactly (inclusive boundary)", () => {
    expect(isReadyForSale(100, 100)).toBe(true);
  });
});
