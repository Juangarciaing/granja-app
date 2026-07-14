import { beforeEach, describe, expect, it, vi } from "vitest";

const mockRedirect = vi.fn();
const mockSignOut = vi.fn();

vi.mock("next/navigation", () => ({
  redirect: (...args: unknown[]) => mockRedirect(...args),
}));
vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: { signOut: (...args: unknown[]) => mockSignOut(...args) },
  })),
}));

import { signOutAction } from "@/app/(app)/actions";

beforeEach(() => {
  mockRedirect.mockClear();
  mockSignOut.mockClear();
  mockSignOut.mockResolvedValue({ error: null });
});

describe("signOutAction", () => {
  it("ends the session and redirects to /login", async () => {
    await signOutAction();

    expect(mockSignOut).toHaveBeenCalled();
    expect(mockRedirect).toHaveBeenCalledWith("/login");
  });
});
