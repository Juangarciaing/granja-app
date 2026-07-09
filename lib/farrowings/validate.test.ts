import { describe, expect, it } from "vitest";

import {
  parseFarrowingForm,
  validatePigletCountUpdate,
} from "@/lib/farrowings/validate";

describe("parseFarrowingForm", () => {
  it("parses a valid farrowing date and live piglet count", () => {
    const formData = new FormData();
    formData.set("farrowing_date", "2026-06-01");
    formData.set("born_alive", "8");

    const result = parseFarrowingForm(formData, "sow-1");

    expect(result).toEqual({
      ok: true,
      value: { sow_id: "sow-1", farrowing_date: "2026-06-01", born_alive: 8 },
    });
  });

  it("rejects a missing farrowing date", () => {
    const formData = new FormData();
    formData.set("born_alive", "8");

    const result = parseFarrowingForm(formData, "sow-1");

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.farrowing_date).toBeDefined();
    }
  });

  it("rejects a negative live piglet count", () => {
    const formData = new FormData();
    formData.set("farrowing_date", "2026-06-01");
    formData.set("born_alive", "-1");

    const result = parseFarrowingForm(formData, "sow-1");

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.born_alive).toBeDefined();
    }
  });

  it("rejects a non-numeric live piglet count", () => {
    const formData = new FormData();
    formData.set("farrowing_date", "2026-06-01");
    formData.set("born_alive", "ocho");

    const result = parseFarrowingForm(formData, "sow-1");

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.born_alive).toBeDefined();
    }
  });
});

describe("validatePigletCountUpdate", () => {
  it("accepts a decrement (piglet died)", () => {
    const result = validatePigletCountUpdate(8, 7);
    expect(result).toEqual({ ok: true });
  });

  it("accepts dropping to zero (all piglets lost)", () => {
    const result = validatePigletCountUpdate(3, 0);
    expect(result).toEqual({ ok: true });
  });

  it("rejects an increase — the counter is decrement-only, no history to justify a rise", () => {
    const result = validatePigletCountUpdate(7, 8);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toMatch(/disminuir/i);
    }
  });

  it("rejects a negative target count", () => {
    const result = validatePigletCountUpdate(3, -1);
    expect(result.ok).toBe(false);
  });
});
