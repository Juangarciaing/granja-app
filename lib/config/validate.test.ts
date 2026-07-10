import { describe, expect, it } from "vitest";
import { parseFeedingConfigForm } from "@/lib/config/validate";

function formData(fields: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    fd.set(key, value);
  }
  return fd;
}

describe("parseFeedingConfigForm", () => {
  it("parses valid base_kg and kg_per_piglet as numbers", () => {
    const result = parseFeedingConfigForm(
      formData({ base_kg: "2", kg_per_piglet: "0.4" }),
    );

    expect(result).toEqual({
      ok: true,
      value: { base_kg: 2, kg_per_piglet: 0.4 },
    });
  });

  it("rejects a missing base_kg", () => {
    const result = parseFeedingConfigForm(
      formData({ base_kg: "", kg_per_piglet: "0.4" }),
    );

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.base_kg).toBeDefined();
    }
  });

  it("rejects a missing kg_per_piglet", () => {
    const result = parseFeedingConfigForm(
      formData({ base_kg: "2", kg_per_piglet: "" }),
    );

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.kg_per_piglet).toBeDefined();
    }
  });

  it("rejects a negative base_kg", () => {
    const result = parseFeedingConfigForm(
      formData({ base_kg: "-1", kg_per_piglet: "0.4" }),
    );

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.base_kg).toBeDefined();
    }
  });

  it("rejects a non-numeric kg_per_piglet", () => {
    const result = parseFeedingConfigForm(
      formData({ base_kg: "2", kg_per_piglet: "abc" }),
    );

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.kg_per_piglet).toBeDefined();
    }
  });

  it("accepts zero as a valid kg_per_piglet (a farm that only feeds a flat base ration)", () => {
    const result = parseFeedingConfigForm(
      formData({ base_kg: "2", kg_per_piglet: "0" }),
    );

    expect(result).toEqual({
      ok: true,
      value: { base_kg: 2, kg_per_piglet: 0 },
    });
  });
});
