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
      formData({ arete: "A12", fecha_ingreso: "2026-07-01", peso_inicial: "18.5" }),
    );

    expect(result).toEqual({
      ok: true,
      value: { arete: "A12", fecha_ingreso: "2026-07-01", peso_inicial: 18.5 },
    });
  });

  it("trims the arete", () => {
    const result = parseFatteningPigForm(
      formData({ arete: "  A12  ", fecha_ingreso: "2026-07-01", peso_inicial: "18.5" }),
    );

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.arete).toBe("A12");
    }
  });

  it("rejects a missing arete", () => {
    const result = parseFatteningPigForm(
      formData({ arete: "", fecha_ingreso: "2026-07-01", peso_inicial: "18.5" }),
    );

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.arete).toBe("El arete es obligatorio.");
    }
  });

  it("rejects a whitespace-only arete", () => {
    const result = parseFatteningPigForm(
      formData({ arete: "   ", fecha_ingreso: "2026-07-01", peso_inicial: "18.5" }),
    );

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.arete).toBe("El arete es obligatorio.");
    }
  });

  it("rejects a missing fecha_ingreso", () => {
    const result = parseFatteningPigForm(
      formData({ arete: "A12", fecha_ingreso: "", peso_inicial: "18.5" }),
    );

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.fecha_ingreso).toBe(
        "La fecha de ingreso es obligatoria.",
      );
    }
  });

  it("rejects a non-numeric peso_inicial", () => {
    const result = parseFatteningPigForm(
      formData({ arete: "A12", fecha_ingreso: "2026-07-01", peso_inicial: "abc" }),
    );

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.peso_inicial).toBe(
        "El peso inicial debe ser un número mayor a 0.",
      );
    }
  });

  it("rejects a zero peso_inicial", () => {
    const result = parseFatteningPigForm(
      formData({ arete: "A12", fecha_ingreso: "2026-07-01", peso_inicial: "0" }),
    );

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.peso_inicial).toBe(
        "El peso inicial debe ser un número mayor a 0.",
      );
    }
  });

  it("rejects a negative peso_inicial", () => {
    const result = parseFatteningPigForm(
      formData({ arete: "A12", fecha_ingreso: "2026-07-01", peso_inicial: "-5" }),
    );

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.peso_inicial).toBe(
        "El peso inicial debe ser un número mayor a 0.",
      );
    }
  });

  it("reports all field errors together when everything is invalid", () => {
    const result = parseFatteningPigForm(
      formData({ arete: "", fecha_ingreso: "", peso_inicial: "" }),
    );

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors).toEqual({
        arete: "El arete es obligatorio.",
        fecha_ingreso: "La fecha de ingreso es obligatoria.",
        peso_inicial: "El peso inicial debe ser un número mayor a 0.",
      });
    }
  });
});
