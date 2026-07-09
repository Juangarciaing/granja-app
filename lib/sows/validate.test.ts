import { describe, expect, it } from "vitest";
import { parseSowForm } from "@/lib/sows/validate";

function formData(fields: Record<string, string>): FormData {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    data.set(key, value);
  }
  return data;
}

describe("parseSowForm", () => {
  it("accepts a valid form and defaults status to active when omitted", () => {
    const result = parseSowForm(
      formData({ name: "Cerda 12", birth_date: "2024-01-15", notes: "Buena madre" }),
    );

    expect(result).toEqual({
      ok: true,
      value: {
        name: "Cerda 12",
        birth_date: "2024-01-15",
        status: "active",
        notes: "Buena madre",
      },
    });
  });

  it("rejects a missing name", () => {
    const result = parseSowForm(formData({ name: "" }));

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.name).toBe("El arete/nombre es obligatorio.");
    }
  });

  it("rejects a whitespace-only name", () => {
    const result = parseSowForm(formData({ name: "   " }));

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.name).toBe("El arete/nombre es obligatorio.");
    }
  });

  it("rejects an invalid status value", () => {
    const result = parseSowForm(formData({ name: "Cerda 12", status: "hibernating" }));

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.status).toBe("Estado inválido.");
    }
  });

  it("normalizes blank optional fields to null and trims the name", () => {
    const result = parseSowForm(
      formData({ name: "  Cerda 7  ", birth_date: "", notes: "" }),
    );

    expect(result).toEqual({
      ok: true,
      value: { name: "Cerda 7", birth_date: null, status: "active", notes: null },
    });
  });
});
