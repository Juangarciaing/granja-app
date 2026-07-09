import { describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";

import { createSow, getSow, listSows, updateSow } from "@/lib/db/queries";
import type { Database, Tables } from "@/types/database";

type Sow = Tables<"sows">;
type Call = { method: string; args: unknown[] };

/**
 * Minimal thenable fake for the Supabase fluent query builder. Real RLS
 * enforcement (that inserts/reads are scoped to `auth.uid() = user_id`) can
 * only be verified against a live Postgres instance, which is unavailable
 * in this environment (no Docker — same constraint documented for PR1's
 * migration trigger). This fake instead verifies the query-layer CONTRACT
 * that makes farm isolation possible: the app code must never read/write an
 * explicit `user_id` itself, relying entirely on the RLS default/policy.
 */
function fakeSupabase(response: { data: unknown; error: unknown }) {
  const calls: Call[] = [];
  const record =
    (method: string) =>
    (...args: unknown[]) => {
      calls.push({ method, args });
      return builder;
    };

  type Response = { data: unknown; error: unknown };
  type Builder = PromiseLike<Response> & {
    select: (...args: unknown[]) => Builder;
    insert: (...args: unknown[]) => Builder;
    update: (...args: unknown[]) => Builder;
    eq: (...args: unknown[]) => Builder;
    order: (...args: unknown[]) => Builder;
    single: (...args: unknown[]) => Builder;
  };

  const builder = {
    select: record("select"),
    insert: record("insert"),
    update: record("update"),
    eq: record("eq"),
    order: record("order"),
    single: record("single"),
    then: (resolve: (value: Response) => unknown) => resolve(response),
  } as Builder;

  const from = vi.fn((table: string) => {
    calls.push({ method: "from", args: [table] });
    return builder;
  });

  const supabase = { from } as unknown as SupabaseClient<Database>;
  return { supabase, calls };
}

const sampleSow: Sow = {
  id: "sow-1",
  user_id: "user-1",
  name: "Cerda 12",
  birth_date: "2024-01-15",
  status: "active",
  notes: null,
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-01T00:00:00Z",
};

describe("listSows", () => {
  it("selects from sows ordered by newest first without any explicit user_id filter", async () => {
    const { supabase, calls } = fakeSupabase({ data: [sampleSow], error: null });

    const result = await listSows(supabase);

    expect(result).toEqual([sampleSow]);
    expect(calls).toEqual([
      { method: "from", args: ["sows"] },
      { method: "select", args: ["*"] },
      { method: "order", args: ["created_at", { ascending: false }] },
    ]);
    // Farm isolation is enforced by the RLS policy (auth.uid() = user_id),
    // NOT by an app-level filter — asserting no "eq" call on user_id proves
    // the query layer trusts RLS instead of duplicating/bypassing it.
    expect(calls.some((call) => call.method === "eq")).toBe(false);
  });

  it("propagates a Postgres/RLS error instead of swallowing it", async () => {
    const { supabase } = fakeSupabase({
      data: null,
      error: { message: "permission denied for table sows" },
    });

    await expect(listSows(supabase)).rejects.toEqual({
      message: "permission denied for table sows",
    });
  });
});

describe("getSow", () => {
  it("fetches a single sow scoped by id", async () => {
    const { supabase, calls } = fakeSupabase({ data: sampleSow, error: null });

    const result = await getSow(supabase, "sow-1");

    expect(result).toEqual(sampleSow);
    expect(calls).toEqual([
      { method: "from", args: ["sows"] },
      { method: "select", args: ["*"] },
      { method: "eq", args: ["id", "sow-1"] },
      { method: "single", args: [] },
    ]);
  });
});

describe("createSow", () => {
  it("inserts only the editable fields, never a caller-supplied user_id", async () => {
    const { supabase, calls } = fakeSupabase({ data: sampleSow, error: null });

    const result = await createSow(supabase, {
      name: "Cerda 12",
      birth_date: "2024-01-15",
      status: "active",
      notes: null,
    });

    expect(result).toEqual(sampleSow);
    const insertCall = calls.find((call) => call.method === "insert");
    expect(insertCall?.args[0]).toEqual({
      name: "Cerda 12",
      birth_date: "2024-01-15",
      status: "active",
      notes: null,
    });
    expect(insertCall?.args[0]).not.toHaveProperty("user_id");
  });
});

describe("updateSow", () => {
  it("updates only the provided fields for the given id, scoped by eq", async () => {
    const { supabase, calls } = fakeSupabase({
      data: { ...sampleSow, status: "sold" },
      error: null,
    });

    const result = await updateSow(supabase, "sow-1", { status: "sold" });

    expect(result.status).toBe("sold");
    expect(calls).toEqual([
      { method: "from", args: ["sows"] },
      { method: "update", args: [{ status: "sold" }] },
      { method: "eq", args: ["id", "sow-1"] },
      { method: "select", args: [] },
      { method: "single", args: [] },
    ]);
  });
});
