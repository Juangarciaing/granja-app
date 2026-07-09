import { describe, expect, it } from "vitest";
import { getSupabasePublicEnv } from "@/lib/env";

describe("getSupabasePublicEnv", () => {
  it("returns url and anonKey when both env vars are present", () => {
    const result = getSupabasePublicEnv({
      NEXT_PUBLIC_SUPABASE_URL: "https://project.supabase.co",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-key-abc",
    });

    expect(result).toEqual({
      url: "https://project.supabase.co",
      anonKey: "anon-key-abc",
    });
  });

  it("throws a descriptive error when NEXT_PUBLIC_SUPABASE_URL is missing", () => {
    expect(() =>
      getSupabasePublicEnv({
        NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-key-abc",
      }),
    ).toThrow("NEXT_PUBLIC_SUPABASE_URL");
  });

  it("throws a descriptive error when NEXT_PUBLIC_SUPABASE_ANON_KEY is missing", () => {
    expect(() =>
      getSupabasePublicEnv({
        NEXT_PUBLIC_SUPABASE_URL: "https://project.supabase.co",
      }),
    ).toThrow("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  });

  it("throws when both env vars are empty strings", () => {
    expect(() =>
      getSupabasePublicEnv({
        NEXT_PUBLIC_SUPABASE_URL: "",
        NEXT_PUBLIC_SUPABASE_ANON_KEY: "",
      }),
    ).toThrow("NEXT_PUBLIC_SUPABASE_URL");
  });
});
