import { describe, expect, it } from "vitest";
import { parseMilkRecordForm } from "@/lib/milk-records/validate";

function formData(fields: Record<string, string>): FormData {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    data.set(key, value);
  }
  return data;
}

describe("parseMilkRecordForm", () => {
  it("accepts a valid form", () => {
    const result = parseMilkRecordForm(
      formData({ record_date: "2026-07-12", liters: "18.5" }),
    );

    expect(result).toEqual({
      ok: true,
      value: { record_date: "2026-07-12", liters: 18.5 },
    });
  });

  it("rejects a missing record_date", () => {
    const result = parseMilkRecordForm(
      formData({ record_date: "", liters: "18.5" }),
    );

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.record_date).toBe(
        "La fecha del registro es obligatoria.",
      );
    }
  });

  it("rejects a non-numeric liters value", () => {
    const result = parseMilkRecordForm(
      formData({ record_date: "2026-07-12", liters: "abc" }),
    );

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.liters).toBe(
        "Los litros deben ser un número mayor a 0.",
      );
    }
  });

  it("rejects a zero liters value", () => {
    const result = parseMilkRecordForm(
      formData({ record_date: "2026-07-12", liters: "0" }),
    );

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.liters).toBe(
        "Los litros deben ser un número mayor a 0.",
      );
    }
  });

  it("rejects a negative liters value", () => {
    const result = parseMilkRecordForm(
      formData({ record_date: "2026-07-12", liters: "-3" }),
    );

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.liters).toBe(
        "Los litros deben ser un número mayor a 0.",
      );
    }
  });

  it("reports all field errors together when everything is invalid", () => {
    const result = parseMilkRecordForm(formData({ record_date: "", liters: "" }));

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors).toEqual({
        record_date: "La fecha del registro es obligatoria.",
        liters: "Los litros deben ser un número mayor a 0.",
      });
    }
  });
});
