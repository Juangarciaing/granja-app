import { describe, expect, it } from "vitest";
import { parseWeightCheckinForm } from "@/lib/weight-checkins/validate";

function formData(fields: Record<string, string>): FormData {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    data.set(key, value);
  }
  return data;
}

describe("parseWeightCheckinForm", () => {
  it("accepts a valid form", () => {
    const result = parseWeightCheckinForm(
      formData({ checkin_date: "2026-07-10", weight: "22.3" }),
    );

    expect(result).toEqual({
      ok: true,
      value: { checkin_date: "2026-07-10", weight: 22.3 },
    });
  });

  it("rejects a missing checkin_date", () => {
    const result = parseWeightCheckinForm(
      formData({ checkin_date: "", weight: "22.3" }),
    );

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.checkin_date).toBe(
        "La fecha de pesaje es obligatoria.",
      );
    }
  });

  it("rejects a non-numeric weight", () => {
    const result = parseWeightCheckinForm(
      formData({ checkin_date: "2026-07-10", weight: "abc" }),
    );

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.weight).toBe("El peso debe ser un número mayor a 0.");
    }
  });

  it("rejects a zero weight", () => {
    const result = parseWeightCheckinForm(
      formData({ checkin_date: "2026-07-10", weight: "0" }),
    );

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.weight).toBe("El peso debe ser un número mayor a 0.");
    }
  });

  it("rejects a negative weight", () => {
    const result = parseWeightCheckinForm(
      formData({ checkin_date: "2026-07-10", weight: "-3" }),
    );

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.weight).toBe("El peso debe ser un número mayor a 0.");
    }
  });

  it("reports all field errors together when everything is invalid", () => {
    const result = parseWeightCheckinForm(
      formData({ checkin_date: "", weight: "" }),
    );

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors).toEqual({
        checkin_date: "La fecha de pesaje es obligatoria.",
        weight: "El peso debe ser un número mayor a 0.",
      });
    }
  });
});
