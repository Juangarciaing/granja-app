import { beforeEach, describe, expect, it, vi } from "vitest";

const mockRevalidatePath = vi.fn();
const mockGetFatteningPig = vi.fn();
const mockAssignPigToPen = vi.fn();
const mockGetPen = vi.fn();

vi.mock("next/cache", () => ({
  revalidatePath: (...args: unknown[]) => mockRevalidatePath(...args),
}));
vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({})),
}));
vi.mock("@/lib/db/queries", () => ({
  getFatteningPig: (...args: unknown[]) => mockGetFatteningPig(...args),
  assignPigToPen: (...args: unknown[]) => mockAssignPigToPen(...args),
  getPen: (...args: unknown[]) => mockGetPen(...args),
}));

import { assignPigToPenAction } from "@/app/(app)/fattening-pigs/[id]/actions";

function formData(fields: Record<string, string>): FormData {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    data.set(key, value);
  }
  return data;
}

beforeEach(() => {
  mockRevalidatePath.mockClear();
  mockGetFatteningPig.mockClear();
  mockAssignPigToPen.mockClear();
  mockGetPen.mockClear();
  mockGetPen.mockResolvedValue({ id: "pen-1", name: "Corral 1" });
});

describe("assignPigToPenAction", () => {
  it("checks pig ownership before assigning, and revalidates both the pig and the new pen's detail pages", async () => {
    mockGetFatteningPig.mockResolvedValue({ id: "pig-1", pen_id: null });
    mockAssignPigToPen.mockResolvedValue({ id: "pig-1", pen_id: "pen-1" });

    await assignPigToPenAction("pig-1", formData({ pen_id: "pen-1" }));

    expect(mockGetFatteningPig).toHaveBeenCalledWith(expect.anything(), "pig-1");
    expect(mockAssignPigToPen).toHaveBeenCalledWith(
      expect.anything(),
      "pig-1",
      "pen-1",
    );
    expect(mockRevalidatePath).toHaveBeenCalledWith("/fattening-pigs/pig-1");
    expect(mockRevalidatePath).toHaveBeenCalledWith("/pens/pen-1");
  });

  it("treats an empty pen_id as unassignment (null), and does not revalidate any pen path when the pig had no previous pen", async () => {
    mockGetFatteningPig.mockResolvedValue({ id: "pig-1", pen_id: null });
    mockAssignPigToPen.mockResolvedValue({ id: "pig-1", pen_id: null });

    await assignPigToPenAction("pig-1", formData({ pen_id: "" }));

    expect(mockAssignPigToPen).toHaveBeenCalledWith(
      expect.anything(),
      "pig-1",
      null,
    );
    expect(mockRevalidatePath).toHaveBeenCalledWith("/fattening-pigs/pig-1");
    expect(mockRevalidatePath).not.toHaveBeenCalledWith(
      expect.stringMatching(/^\/pens\//),
    );
  });

  it("revalidates the previous pen's detail page too when reassigning a pig away from it", async () => {
    mockGetFatteningPig.mockResolvedValue({ id: "pig-1", pen_id: "pen-old" });
    mockAssignPigToPen.mockResolvedValue({ id: "pig-1", pen_id: "pen-new" });

    await assignPigToPenAction("pig-1", formData({ pen_id: "pen-new" }));

    expect(mockRevalidatePath).toHaveBeenCalledWith("/pens/pen-old");
    expect(mockRevalidatePath).toHaveBeenCalledWith("/pens/pen-new");
  });

  it("verifies ownership of the TARGET pen before assigning — a bare FK bypasses RLS same as any other child insert/update", async () => {
    mockGetFatteningPig.mockResolvedValue({ id: "pig-1", pen_id: null });
    mockAssignPigToPen.mockResolvedValue({ id: "pig-1", pen_id: "pen-1" });

    await assignPigToPenAction("pig-1", formData({ pen_id: "pen-1" }));

    expect(mockGetPen).toHaveBeenCalledWith(expect.anything(), "pen-1");
  });

  it("does not call getPen when unassigning (pen_id empty) — there is no target pen to verify", async () => {
    mockGetFatteningPig.mockResolvedValue({ id: "pig-1", pen_id: "pen-old" });
    mockAssignPigToPen.mockResolvedValue({ id: "pig-1", pen_id: null });

    await assignPigToPenAction("pig-1", formData({ pen_id: "" }));

    expect(mockGetPen).not.toHaveBeenCalled();
  });

  it("calls getFatteningPig before assignPigToPen — ownership guard runs first", async () => {
    mockGetFatteningPig.mockResolvedValue({ id: "pig-1", pen_id: null });
    mockAssignPigToPen.mockResolvedValue({ id: "pig-1", pen_id: "pen-1" });

    const callOrder: string[] = [];
    mockGetFatteningPig.mockImplementation(async () => {
      callOrder.push("getFatteningPig");
      return { id: "pig-1", pen_id: null };
    });
    mockAssignPigToPen.mockImplementation(async () => {
      callOrder.push("assignPigToPen");
      return { id: "pig-1", pen_id: "pen-1" };
    });

    await assignPigToPenAction("pig-1", formData({ pen_id: "pen-1" }));

    expect(callOrder).toEqual(["getFatteningPig", "assignPigToPen"]);
  });
});
