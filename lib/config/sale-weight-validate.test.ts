import { describe, expect, it } from "vitest";
import { parseSaleWeightConfigForm } from "@/lib/config/sale-weight-validate";

function formData(fields: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    fd.set(key, value);
  }
  return fd;
}

describe("parseSaleWeightConfigForm", () => {
  it("parses a valid positive target_weight_kg as a number", () => {
    const result = parseSaleWeightConfigForm(formData({ target_weight_kg: "105" }));

    expect(result).toEqual({
      ok: true,
      value: { target_weight_kg: 105 },
    });
  });

  it("rejects target_weight_kg of exactly 0 (must be strictly greater than 0)", () => {
    const result = parseSaleWeightConfigForm(formData({ target_weight_kg: "0" }));

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.target_weight_kg).toBeDefined();
    }
  });

  it("rejects a negative target_weight_kg", () => {
    const result = parseSaleWeightConfigForm(formData({ target_weight_kg: "-5" }));

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.target_weight_kg).toBeDefined();
    }
  });

  it("rejects a non-numeric target_weight_kg", () => {
    const result = parseSaleWeightConfigForm(formData({ target_weight_kg: "abc" }));

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.target_weight_kg).toBeDefined();
    }
  });

  it("rejects a missing target_weight_kg", () => {
    const result = parseSaleWeightConfigForm(formData({}));

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.target_weight_kg).toBeDefined();
    }
  });
});
