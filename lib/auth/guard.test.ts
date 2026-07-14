import { describe, expect, it } from "vitest";
import { getAuthenticatedRedirect, getAuthRedirect } from "@/lib/auth/guard";

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

describe("getAuthenticatedRedirect", () => {
  const authPaths = ["/login", "/signup"];

  it("returns null when there is no session user", () => {
    expect(
      getAuthenticatedRedirect(null, "/login", authPaths, "/"),
    ).toBeNull();
  });

  it("redirects to the home path when an authenticated user is on /login", () => {
    expect(
      getAuthenticatedRedirect(
        { id: "user-123" },
        "/login",
        authPaths,
        "/",
      ),
    ).toBe("/");
  });

  it("redirects to the home path when an authenticated user is on /signup", () => {
    expect(
      getAuthenticatedRedirect(
        { id: "user-123" },
        "/signup",
        authPaths,
        "/",
      ),
    ).toBe("/");
  });

  it("returns null when an authenticated user is on an unrelated path", () => {
    expect(
      getAuthenticatedRedirect(
        { id: "user-123" },
        "/sows",
        authPaths,
        "/",
      ),
    ).toBeNull();
  });

  it("returns null for an unauthenticated user on an auth path", () => {
    expect(
      getAuthenticatedRedirect(null, "/signup", authPaths, "/"),
    ).toBeNull();
  });
});
