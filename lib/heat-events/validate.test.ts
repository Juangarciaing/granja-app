import { describe, expect, it } from "vitest";
import { parseHeatEventForm } from "@/lib/heat-events/validate";

function formData(fields: Record<string, string>): FormData {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    data.set(key, value);
  }
  return data;
}

describe("parseHeatEventForm", () => {
  it("accepts a valid form with notes", () => {
    const result = parseHeatEventForm(
      formData({ observed_date: "2026-07-10", notes: "Monta observada" }),
    );

    expect(result).toEqual({
      ok: true,
      value: { observed_date: "2026-07-10", notes: "Monta observada" },
    });
  });

  it("accepts a valid form with notes omitted, defaulting to null", () => {
    const result = parseHeatEventForm(formData({ observed_date: "2026-07-10" }));

    expect(result).toEqual({
      ok: true,
      value: { observed_date: "2026-07-10", notes: null },
    });
  });

  it("accepts a valid form with blank notes, normalized to null", () => {
    const result = parseHeatEventForm(
      formData({ observed_date: "2026-07-10", notes: "   " }),
    );

    expect(result).toEqual({
      ok: true,
      value: { observed_date: "2026-07-10", notes: null },
    });
  });

  it("rejects a missing observed_date", () => {
    const result = parseHeatEventForm(formData({ observed_date: "" }));

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.observed_date).toBe(
        "La fecha de observación es obligatoria.",
      );
    }
  });
});
