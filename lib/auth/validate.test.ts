import { describe, expect, it } from "vitest";
import { MIN_PASSWORD_LENGTH, validatePassword } from "@/lib/auth/validate";

describe("validatePassword", () => {
  it("rejects an empty password", () => {
    expect(validatePassword("")).toBe(
      "La contraseña debe tener al menos 8 caracteres.",
    );
  });

  it("rejects a password shorter than 8 characters", () => {
    expect(validatePassword("abc1234")).toBe(
      "La contraseña debe tener al menos 8 caracteres.",
    );
  });

  it("accepts a password of exactly 8 characters", () => {
    expect(validatePassword("abcd1234")).toBeNull();
  });

  it("accepts a password longer than 8 characters", () => {
    expect(validatePassword("abcd12345678")).toBeNull();
  });

  it("exposes the minimum length constant used by the rule", () => {
    expect(MIN_PASSWORD_LENGTH).toBe(8);
  });
});
