import { describe, expect, it } from "vitest";
import { parseFatteningPigForm } from "@/lib/fattening-pigs/validate";

function formData(fields: Record<string, string>): FormData {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    data.set(key, value);
  }
  return data;
}

describe("parseFatteningPigForm", () => {
  it("accepts a valid form", () => {
    const result = parseFatteningPigForm(
      formData({ ear_tag: "A12", entry_date: "2026-07-01", entry_weight: "18.5" }),
    );

    expect(result).toEqual({
      ok: true,
      value: { ear_tag: "A12", entry_date: "2026-07-01", entry_weight: 18.5 },
    });
  });

  it("trims the ear_tag", () => {
    const result = parseFatteningPigForm(
      formData({ ear_tag: "  A12  ", entry_date: "2026-07-01", entry_weight: "18.5" }),
    );

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.ear_tag).toBe("A12");
    }
  });

  it("rejects a missing ear_tag", () => {
    const result = parseFatteningPigForm(
      formData({ ear_tag: "", entry_date: "2026-07-01", entry_weight: "18.5" }),
    );

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.ear_tag).toBe("El ear_tag es obligatorio.");
    }
  });

  it("rejects a whitespace-only ear_tag", () => {
    const result = parseFatteningPigForm(
      formData({ ear_tag: "   ", entry_date: "2026-07-01", entry_weight: "18.5" }),
    );

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.ear_tag).toBe("El ear_tag es obligatorio.");
    }
  });

  it("rejects a missing entry_date", () => {
    const result = parseFatteningPigForm(
      formData({ ear_tag: "A12", entry_date: "", entry_weight: "18.5" }),
    );

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.entry_date).toBe(
        "La fecha de ingreso es obligatoria.",
      );
    }
  });

  it("rejects a non-numeric entry_weight", () => {
    const result = parseFatteningPigForm(
      formData({ ear_tag: "A12", entry_date: "2026-07-01", entry_weight: "abc" }),
    );

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.entry_weight).toBe(
        "El peso inicial debe ser un número mayor a 0.",
      );
    }
  });

  it("rejects a zero entry_weight", () => {
    const result = parseFatteningPigForm(
      formData({ ear_tag: "A12", entry_date: "2026-07-01", entry_weight: "0" }),
    );

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.entry_weight).toBe(
        "El peso inicial debe ser un número mayor a 0.",
      );
    }
  });

  it("rejects a negative entry_weight", () => {
    const result = parseFatteningPigForm(
      formData({ ear_tag: "A12", entry_date: "2026-07-01", entry_weight: "-5" }),
    );

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.entry_weight).toBe(
        "El peso inicial debe ser un número mayor a 0.",
      );
    }
  });

  it("reports all field errors together when everything is invalid", () => {
    const result = parseFatteningPigForm(
      formData({ ear_tag: "", entry_date: "", entry_weight: "" }),
    );

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors).toEqual({
        ear_tag: "El ear_tag es obligatorio.",
        entry_date: "La fecha de ingreso es obligatoria.",
        entry_weight: "El peso inicial debe ser un número mayor a 0.",
      });
    }
  });
});
