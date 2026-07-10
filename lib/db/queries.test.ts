import { describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";

import {
  createFarrowing,
  createSow,
  getFarrowing,
  getFeedingConfig,
  getSow,
  listActiveFarrowings,
  listFarrowingsForSow,
  listSows,
  updateFarrowingCounter,
  updateFeedingConfig,
  updateSow,
  weanFarrowing,
} from "@/lib/db/queries";
import type { Database, Tables } from "@/types/database";

type Sow = Tables<"sows">;
type Farrowing = Tables<"farrowings">;
type FeedingConfigRow = Tables<"feeding_config">;
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

const sampleFarrowing: Farrowing = {
  id: "farrowing-1",
  user_id: "user-1",
  sow_id: "sow-1",
  farrowing_date: "2026-06-01",
  born_alive: 8,
  current_piglets: 8,
  status: "lactating",
  weaning_date: null,
  created_at: "2026-06-01T00:00:00Z",
  updated_at: "2026-06-01T00:00:00Z",
};

describe("listFarrowingsForSow", () => {
  it("selects farrowings for the given sow, newest first, without an explicit user_id filter", async () => {
    const { supabase, calls } = fakeSupabase({
      data: [sampleFarrowing],
      error: null,
    });

    const result = await listFarrowingsForSow(supabase, "sow-1");

    expect(result).toEqual([sampleFarrowing]);
    expect(calls).toEqual([
      { method: "from", args: ["farrowings"] },
      { method: "select", args: ["*"] },
      { method: "eq", args: ["sow_id", "sow-1"] },
      { method: "order", args: ["farrowing_date", { ascending: false }] },
    ]);
    // Farm isolation relies on RLS (auth.uid() = user_id), never an
    // app-level user_id filter — same contract as the sow queries.
    expect(
      calls.some((call) => call.method === "eq" && call.args[0] === "user_id"),
    ).toBe(false);
  });
});

describe("getFarrowing", () => {
  it("fetches a single farrowing scoped by id", async () => {
    const { supabase, calls } = fakeSupabase({
      data: sampleFarrowing,
      error: null,
    });

    const result = await getFarrowing(supabase, "farrowing-1");

    expect(result).toEqual(sampleFarrowing);
    expect(calls).toEqual([
      { method: "from", args: ["farrowings"] },
      { method: "select", args: ["*"] },
      { method: "eq", args: ["id", "farrowing-1"] },
      { method: "single", args: [] },
    ]);
  });
});

describe("createFarrowing", () => {
  it("inserts current_piglets initialized from born_alive, never a caller-supplied user_id or status", async () => {
    const { supabase, calls } = fakeSupabase({
      data: sampleFarrowing,
      error: null,
    });

    const result = await createFarrowing(supabase, {
      sow_id: "sow-1",
      farrowing_date: "2026-06-01",
      born_alive: 8,
    });

    expect(result).toEqual(sampleFarrowing);
    const insertCall = calls.find((call) => call.method === "insert");
    expect(insertCall?.args[0]).toEqual({
      sow_id: "sow-1",
      farrowing_date: "2026-06-01",
      born_alive: 8,
      current_piglets: 8,
    });
    expect(insertCall?.args[0]).not.toHaveProperty("user_id");
    expect(insertCall?.args[0]).not.toHaveProperty("status");
  });
});

describe("updateFarrowingCounter", () => {
  it("updates only current_piglets for the given id — no mortality event/history columns written", async () => {
    const { supabase, calls } = fakeSupabase({
      data: { ...sampleFarrowing, current_piglets: 7 },
      error: null,
    });

    const result = await updateFarrowingCounter(supabase, "farrowing-1", 7);

    expect(result.current_piglets).toBe(7);
    const updateCall = calls.find((call) => call.method === "update");
    expect(updateCall?.args[0]).toEqual({ current_piglets: 7 });
    expect(calls).toEqual([
      { method: "from", args: ["farrowings"] },
      { method: "update", args: [{ current_piglets: 7 }] },
      { method: "eq", args: ["id", "farrowing-1"] },
      { method: "select", args: [] },
      { method: "single", args: [] },
    ]);
  });

  it("accepts zero as a valid target count (all piglets lost)", async () => {
    const { supabase } = fakeSupabase({
      data: { ...sampleFarrowing, current_piglets: 0 },
      error: null,
    });

    const result = await updateFarrowingCounter(supabase, "farrowing-1", 0);

    expect(result.current_piglets).toBe(0);
  });
});

describe("weanFarrowing", () => {
  it("sets weaning_date and status=weaned, closing out the farrowing", async () => {
    const { supabase, calls } = fakeSupabase({
      data: { ...sampleFarrowing, status: "weaned", weaning_date: "2026-07-01" },
      error: null,
    });

    const result = await weanFarrowing(supabase, "farrowing-1", "2026-07-01");

    expect(result.status).toBe("weaned");
    expect(result.weaning_date).toBe("2026-07-01");
    const updateCall = calls.find((call) => call.method === "update");
    expect(updateCall?.args[0]).toEqual({
      weaning_date: "2026-07-01",
      status: "weaned",
    });
  });
});

describe("listActiveFarrowings", () => {
  it("selects only lactating farrowings, excluding weaned ones from active views", async () => {
    const { supabase, calls } = fakeSupabase({
      data: [sampleFarrowing],
      error: null,
    });

    const result = await listActiveFarrowings(supabase);

    expect(result).toEqual([sampleFarrowing]);
    expect(calls).toEqual([
      { method: "from", args: ["farrowings"] },
      { method: "select", args: ["*"] },
      { method: "eq", args: ["status", "lactating"] },
    ]);
  });
});

const sampleFeedingConfig: FeedingConfigRow = {
  id: "config-1",
  user_id: "user-1",
  base_kg: 2,
  kg_per_piglet: 0.4,
  updated_at: "2026-01-01T00:00:00Z",
};

describe("getFeedingConfig", () => {
  it("fetches the single current config row without any explicit user_id or id filter", async () => {
    const { supabase, calls } = fakeSupabase({
      data: sampleFeedingConfig,
      error: null,
    });

    const result = await getFeedingConfig(supabase);

    expect(result).toEqual(sampleFeedingConfig);
    expect(calls).toEqual([
      { method: "from", args: ["feeding_config"] },
      { method: "select", args: ["*"] },
      { method: "single", args: [] },
    ]);
    // Exactly one row is ever visible per user (unique user_id + RLS), so no
    // extra filter is needed — same "trust RLS, don't duplicate it" contract
    // as the sow/farrowing queries.
    expect(calls.some((call) => call.method === "eq")).toBe(false);
  });
});

describe("updateFeedingConfig", () => {
  it("overwrites base_kg and kg_per_piglet on the current row in place — no history/versioning columns written", async () => {
    const { supabase, calls } = fakeSupabase({
      data: { ...sampleFeedingConfig, base_kg: 2.5, kg_per_piglet: 0.5 },
      error: null,
    });

    const result = await updateFeedingConfig(supabase, {
      base_kg: 2.5,
      kg_per_piglet: 0.5,
    });

    expect(result.base_kg).toBe(2.5);
    expect(result.kg_per_piglet).toBe(0.5);
    const updateCall = calls.find((call) => call.method === "update");
    expect(updateCall?.args[0]).toEqual({ base_kg: 2.5, kg_per_piglet: 0.5 });
    expect(updateCall?.args[0]).not.toHaveProperty("id");
    expect(updateCall?.args[0]).not.toHaveProperty("user_id");
    expect(calls).toEqual([
      { method: "from", args: ["feeding_config"] },
      { method: "update", args: [{ base_kg: 2.5, kg_per_piglet: 0.5 }] },
      { method: "select", args: [] },
      { method: "single", args: [] },
    ]);
    // No `eq`/id filter, same singleton-scoped-by-RLS contract as
    // getFeedingConfig — there is only ever one reachable row to update.
    expect(calls.some((call) => call.method === "eq")).toBe(false);
  });
});
