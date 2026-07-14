import { describe, expect, it } from "vitest";
import {
  isDuplicateEmailError,
  MIN_PASSWORD_LENGTH,
  validatePassword,
} from "@/lib/auth/validate";

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

describe("isDuplicateEmailError", () => {
  it("matches on Supabase's documented error code", () => {
    expect(
      isDuplicateEmailError({ code: "user_already_exists", message: "" }),
    ).toBe(true);
  });

  it("falls back to matching the message when code is missing or different (Supabase version drift)", () => {
    expect(
      isDuplicateEmailError({
        code: null,
        message: "User already registered",
      }),
    ).toBe(true);
    expect(
      isDuplicateEmailError({
        code: "some_other_code",
        message: "A user with this email address has already registered",
      }),
    ).toBe(true);
  });

  it("returns false for an unrelated error", () => {
    expect(
      isDuplicateEmailError({ code: "weak_password", message: "Too weak" }),
    ).toBe(false);
  });
});
