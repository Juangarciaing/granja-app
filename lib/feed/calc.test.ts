import { describe, expect, it } from "vitest";
import { calcDailyFeed } from "@/lib/feed/calc";

describe("calcDailyFeed", () => {
  it("computes base_kg + kg_per_piglet * current_piglets (standard calculation)", () => {
    expect(calcDailyFeed({ base_kg: 2, kg_per_piglet: 0.4 }, 8)).toBeCloseTo(
      5.2,
    );
  });

  it("returns base_kg only when there are zero live piglets", () => {
    expect(calcDailyFeed({ base_kg: 2, kg_per_piglet: 0.4 }, 0)).toBe(2);
  });

  it("immediately reflects a changed feeding_config for the same piglet count", () => {
    const oldConfig = { base_kg: 2, kg_per_piglet: 0.4 };
    const newConfig = { base_kg: 2.5, kg_per_piglet: 0.5 };

    expect(calcDailyFeed(oldConfig, 8)).toBeCloseTo(5.2);
    expect(calcDailyFeed(newConfig, 8)).toBeCloseTo(6.5);
  });

  it("rounds to 2 decimals, avoiding floating-point drift for realistic configs", () => {
    expect(calcDailyFeed({ base_kg: 2, kg_per_piglet: 0.35 }, 7)).toBe(4.45);
  });
});
