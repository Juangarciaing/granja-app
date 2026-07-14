import { beforeEach, describe, expect, it, vi } from "vitest";

const mockRedirect = vi.fn();
const mockRevalidatePath = vi.fn();
const mockGetPen = vi.fn();
const mockCreateFeedLog = vi.fn();
const mockUpdateFeedLog = vi.fn();
const mockDeleteFeedLog = vi.fn();
const mockUpdatePen = vi.fn();

vi.mock("next/navigation", () => ({
  redirect: (...args: unknown[]) => mockRedirect(...args),
}));
vi.mock("next/cache", () => ({
  revalidatePath: (...args: unknown[]) => mockRevalidatePath(...args),
}));
vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({})),
}));
vi.mock("@/lib/db/queries", () => ({
  getPen: (...args: unknown[]) => mockGetPen(...args),
  createFeedLog: (...args: unknown[]) => mockCreateFeedLog(...args),
  updateFeedLog: (...args: unknown[]) => mockUpdateFeedLog(...args),
  deleteFeedLog: (...args: unknown[]) => mockDeleteFeedLog(...args),
  updatePen: (...args: unknown[]) => mockUpdatePen(...args),
}));

import {
  createFeedLogAction,
  deleteFeedLogAction,
  updateFeedLogAction,
  updatePenAction,
} from "@/app/(app)/pens/[id]/actions";

function formData(fields: Record<string, string>): FormData {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    data.set(key, value);
  }
  return data;
}

beforeEach(() => {
  mockRedirect.mockClear();
  mockRevalidatePath.mockClear();
  mockGetPen.mockClear();
  mockCreateFeedLog.mockClear();
  mockUpdateFeedLog.mockClear();
  mockDeleteFeedLog.mockClear();
  mockUpdatePen.mockClear();
});

describe("createFeedLogAction", () => {
  it("checks pen ownership, inserts, and redirects to the pen detail page on success", async () => {
    mockGetPen.mockResolvedValue({ id: "pen-1" });
    mockCreateFeedLog.mockResolvedValue({ id: "log-1" });

    await createFeedLogAction(
      "pen-1",
      { errors: {} },
      formData({ log_date: "2026-07-12", kg_fed: "50" }),
    );

    expect(mockGetPen).toHaveBeenCalledWith(expect.anything(), "pen-1");
    expect(mockCreateFeedLog).toHaveBeenCalledWith(expect.anything(), {
      pen_id: "pen-1",
      log_date: "2026-07-12",
      kg_fed: 50,
    });
    expect(mockRevalidatePath).toHaveBeenCalledWith("/pens/pen-1");
    expect(mockRedirect).toHaveBeenCalledWith("/pens/pen-1");
  });

  it("returns log_date guidance and does NOT redirect when the insert violates unique(pen_id, log_date)", async () => {
    mockGetPen.mockResolvedValue({ id: "pen-1" });
    mockCreateFeedLog.mockRejectedValue({
      code: "23505",
      message:
        'duplicate key value violates unique constraint "feed_logs_pen_id_log_date_key"',
    });

    const result = await createFeedLogAction(
      "pen-1",
      { errors: {} },
      formData({ log_date: "2026-07-12", kg_fed: "50" }),
    );

    expect(result.errors.log_date).toBe(
      "Ya existe un registro de alimento para este corral en esa fecha; edítalo en lugar de crear otro.",
    );
    expect(mockRedirect).not.toHaveBeenCalled();
    expect(mockRevalidatePath).not.toHaveBeenCalled();
  });

  it("rethrows a non-23505 error instead of swallowing it, and still does not redirect", async () => {
    mockGetPen.mockResolvedValue({ id: "pen-1" });
    mockCreateFeedLog.mockRejectedValue({
      code: "42501",
      message: "permission denied",
    });

    await expect(
      createFeedLogAction(
        "pen-1",
        { errors: {} },
        formData({ log_date: "2026-07-12", kg_fed: "50" }),
      ),
    ).rejects.toMatchObject({ code: "42501" });
    expect(mockRedirect).not.toHaveBeenCalled();
  });

  it("returns validation errors without ever calling getPen or createFeedLog when the form is invalid", async () => {
    const result = await createFeedLogAction(
      "pen-1",
      { errors: {} },
      formData({ log_date: "", kg_fed: "50" }),
    );

    expect(result.errors.log_date).toBe("La fecha del registro es obligatoria.");
    expect(mockGetPen).not.toHaveBeenCalled();
    expect(mockCreateFeedLog).not.toHaveBeenCalled();
  });
});

describe("updateFeedLogAction", () => {
  it("updates the feed log and redirects to the pen detail page", async () => {
    mockUpdateFeedLog.mockResolvedValue({ id: "log-1" });

    await updateFeedLogAction(
      "log-1",
      "pen-1",
      { errors: {} },
      formData({ log_date: "2026-07-12", kg_fed: "55" }),
    );

    expect(mockUpdateFeedLog).toHaveBeenCalledWith(expect.anything(), "log-1", {
      log_date: "2026-07-12",
      kg_fed: 55,
    });
    expect(mockRevalidatePath).toHaveBeenCalledWith("/pens/pen-1");
    expect(mockRedirect).toHaveBeenCalledWith("/pens/pen-1");
  });
});

describe("deleteFeedLogAction", () => {
  it("deletes the feed log and revalidates the pen detail page", async () => {
    mockDeleteFeedLog.mockResolvedValue(undefined);

    await deleteFeedLogAction("log-1", "pen-1");

    expect(mockDeleteFeedLog).toHaveBeenCalledWith(expect.anything(), "log-1");
    expect(mockRevalidatePath).toHaveBeenCalledWith("/pens/pen-1");
  });
});

describe("updatePenAction", () => {
  it("renames the pen and redirects to the pen detail page", async () => {
    mockUpdatePen.mockResolvedValue({ id: "pen-1", name: "Corral A" });

    await updatePenAction(
      "pen-1",
      { errors: {} },
      formData({ name: "Corral A" }),
    );

    expect(mockUpdatePen).toHaveBeenCalledWith(expect.anything(), "pen-1", {
      name: "Corral A",
    });
    expect(mockRevalidatePath).toHaveBeenCalledWith("/pens/pen-1");
    expect(mockRedirect).toHaveBeenCalledWith("/pens/pen-1");
  });

  it("returns validation errors without calling updatePen when the name is empty", async () => {
    const result = await updatePenAction(
      "pen-1",
      { errors: {} },
      formData({ name: "" }),
    );

    expect(result.errors.name).toBe("El nombre del corral es obligatorio.");
    expect(mockUpdatePen).not.toHaveBeenCalled();
  });
});
