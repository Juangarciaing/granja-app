import { describe, expect, it } from "vitest";
import { getAuthRedirect } from "@/lib/auth/guard";

describe("getAuthRedirect", () => {
  it("redirects to /login when there is no session user", () => {
    expect(getAuthRedirect(null, "/login")).toBe("/login");
  });

  it("returns null when a session user is present (no redirect needed)", () => {
    expect(getAuthRedirect({ id: "user-123" }, "/login")).toBeNull();
  });

  it("uses the provided login path for the redirect target", () => {
    expect(getAuthRedirect(null, "/(auth)/login")).toBe("/(auth)/login");
  });
});
