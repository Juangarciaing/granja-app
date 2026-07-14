import { describe, expect, it } from "vitest";

import { parseFeedLogForm, parsePenForm } from "@/lib/pens/validate";

function formData(fields: Record<string, string>): FormData {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    data.set(key, value);
  }
  return data;
}

describe("parsePenForm", () => {
  it("accepts a valid form", () => {
    const result = parsePenForm(formData({ name: "Corral 1" }));

    expect(result).toEqual({ ok: true, value: { name: "Corral 1" } });
  });

  it("rejects a missing name", () => {
    const result = parsePenForm(formData({ name: "" }));

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.name).toBe("El nombre del corral es obligatorio.");
    }
  });

  it("rejects a whitespace-only name", () => {
    const result = parsePenForm(formData({ name: "   " }));

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.name).toBe("El nombre del corral es obligatorio.");
    }
  });

  it("trims the name", () => {
    const result = parsePenForm(formData({ name: "  Corral 2  " }));

    expect(result).toEqual({ ok: true, value: { name: "Corral 2" } });
  });
});

describe("parseFeedLogForm", () => {
  it("accepts a valid form", () => {
    const result = parseFeedLogForm(
      formData({ log_date: "2026-07-13", kg_fed: "45.5" }),
    );

    expect(result).toEqual({
      ok: true,
      value: { log_date: "2026-07-13", kg_fed: 45.5 },
    });
  });

  it("rejects a missing log_date", () => {
    const result = parseFeedLogForm(
      formData({ log_date: "", kg_fed: "45.5" }),
    );

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.log_date).toBe(
        "La fecha del registro es obligatoria.",
      );
    }
  });

  it("rejects a non-numeric kg_fed value", () => {
    const result = parseFeedLogForm(
      formData({ log_date: "2026-07-13", kg_fed: "abc" }),
    );

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.kg_fed).toBe(
        "El alimento (kg) debe ser un número mayor a 0.",
      );
    }
  });

  it("rejects a zero kg_fed value", () => {
    const result = parseFeedLogForm(
      formData({ log_date: "2026-07-13", kg_fed: "0" }),
    );

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.kg_fed).toBe(
        "El alimento (kg) debe ser un número mayor a 0.",
      );
    }
  });

  it("rejects a negative kg_fed value", () => {
    const result = parseFeedLogForm(
      formData({ log_date: "2026-07-13", kg_fed: "-5" }),
    );

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.kg_fed).toBe(
        "El alimento (kg) debe ser un número mayor a 0.",
      );
    }
  });

  it("reports all field errors together when everything is invalid", () => {
    const result = parseFeedLogForm(formData({ log_date: "", kg_fed: "" }));

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors).toEqual({
        log_date: "La fecha del registro es obligatoria.",
        kg_fed: "El alimento (kg) debe ser un número mayor a 0.",
      });
    }
  });
});
