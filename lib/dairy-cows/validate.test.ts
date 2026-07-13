import { describe, expect, it } from "vitest";
import { parseDairyCowForm } from "@/lib/dairy-cows/validate";

function formData(fields: Record<string, string>): FormData {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    data.set(key, value);
  }
  return data;
}

describe("parseDairyCowForm", () => {
  it("accepts a valid form", () => {
    const result = parseDairyCowForm(formData({ ear_tag: "C-104" }));

    expect(result).toEqual({
      ok: true,
      value: { ear_tag: "C-104" },
    });
  });

  it("trims the ear_tag", () => {
    const result = parseDairyCowForm(formData({ ear_tag: "  C-104  " }));

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.ear_tag).toBe("C-104");
    }
  });

  it("rejects a missing ear_tag", () => {
    const result = parseDairyCowForm(formData({ ear_tag: "" }));

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.ear_tag).toBe("El ear_tag es obligatorio.");
    }
  });

  it("rejects a whitespace-only ear_tag", () => {
    const result = parseDairyCowForm(formData({ ear_tag: "   " }));

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.ear_tag).toBe("El ear_tag es obligatorio.");
    }
  });
});
