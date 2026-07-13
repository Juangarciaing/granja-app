import { beforeEach, describe, expect, it, vi } from "vitest";

const mockRedirect = vi.fn();
const mockRevalidatePath = vi.fn();
const mockGetDairyCow = vi.fn();
const mockCreateMilkRecord = vi.fn();
const mockUpdateMilkRecord = vi.fn();
const mockDeleteMilkRecord = vi.fn();

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
  getDairyCow: (...args: unknown[]) => mockGetDairyCow(...args),
  createMilkRecord: (...args: unknown[]) => mockCreateMilkRecord(...args),
  updateMilkRecord: (...args: unknown[]) => mockUpdateMilkRecord(...args),
  deleteMilkRecord: (...args: unknown[]) => mockDeleteMilkRecord(...args),
}));

import {
  createMilkRecordAction,
  deleteMilkRecordAction,
  updateMilkRecordAction,
} from "@/app/(app)/dairy-cows/[id]/actions";

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
  mockGetDairyCow.mockClear();
  mockCreateMilkRecord.mockClear();
  mockUpdateMilkRecord.mockClear();
  mockDeleteMilkRecord.mockClear();
});

describe("createMilkRecordAction", () => {
  it("checks cow ownership, inserts, and redirects to the cow detail page on success — proves the try/catch does not swallow the happy-path redirect", async () => {
    mockGetDairyCow.mockResolvedValue({ id: "cow-1" });
    mockCreateMilkRecord.mockResolvedValue({ id: "record-1" });

    await createMilkRecordAction(
      "cow-1",
      { errors: {} },
      formData({ record_date: "2026-07-12", liters: "18.5" }),
    );

    expect(mockGetDairyCow).toHaveBeenCalledWith(expect.anything(), "cow-1");
    expect(mockCreateMilkRecord).toHaveBeenCalledWith(expect.anything(), {
      cow_id: "cow-1",
      record_date: "2026-07-12",
      liters: 18.5,
    });
    expect(mockRevalidatePath).toHaveBeenCalledWith("/dairy-cows/cow-1");
    expect(mockRedirect).toHaveBeenCalledWith("/dairy-cows/cow-1");
  });

  it("returns record_date guidance and does NOT redirect when the insert violates unique(cow_id, record_date)", async () => {
    mockGetDairyCow.mockResolvedValue({ id: "cow-1" });
    mockCreateMilkRecord.mockRejectedValue({
      code: "23505",
      message:
        'duplicate key value violates unique constraint "milk_records_cow_id_record_date_key"',
    });

    const result = await createMilkRecordAction(
      "cow-1",
      { errors: {} },
      formData({ record_date: "2026-07-12", liters: "18.5" }),
    );

    expect(result.errors.record_date).toBe(
      "Ya existe un registro para esta vaca en esa fecha; edítalo en lugar de crear otro.",
    );
    expect(mockRedirect).not.toHaveBeenCalled();
    expect(mockRevalidatePath).not.toHaveBeenCalled();
  });

  it("rethrows a non-23505 error instead of swallowing it, and still does not redirect", async () => {
    mockGetDairyCow.mockResolvedValue({ id: "cow-1" });
    mockCreateMilkRecord.mockRejectedValue({
      code: "42501",
      message: "permission denied",
    });

    await expect(
      createMilkRecordAction(
        "cow-1",
        { errors: {} },
        formData({ record_date: "2026-07-12", liters: "18.5" }),
      ),
    ).rejects.toMatchObject({ code: "42501" });
    expect(mockRedirect).not.toHaveBeenCalled();
  });

  it("returns validation errors without ever calling getDairyCow or createMilkRecord when the form is invalid", async () => {
    const result = await createMilkRecordAction(
      "cow-1",
      { errors: {} },
      formData({ record_date: "", liters: "18.5" }),
    );

    expect(result.errors.record_date).toBe(
      "La fecha del registro es obligatoria.",
    );
    expect(mockGetDairyCow).not.toHaveBeenCalled();
    expect(mockCreateMilkRecord).not.toHaveBeenCalled();
  });
});

describe("updateMilkRecordAction", () => {
  it("updates the record and redirects to the cow detail page", async () => {
    mockUpdateMilkRecord.mockResolvedValue({ id: "record-1" });

    await updateMilkRecordAction(
      "record-1",
      "cow-1",
      { errors: {} },
      formData({ record_date: "2026-07-12", liters: "19.0" }),
    );

    expect(mockUpdateMilkRecord).toHaveBeenCalledWith(
      expect.anything(),
      "record-1",
      { record_date: "2026-07-12", liters: 19.0 },
    );
    expect(mockRevalidatePath).toHaveBeenCalledWith("/dairy-cows/cow-1");
    expect(mockRedirect).toHaveBeenCalledWith("/dairy-cows/cow-1");
  });
});

describe("deleteMilkRecordAction", () => {
  it("deletes the record and revalidates the cow detail page", async () => {
    mockDeleteMilkRecord.mockResolvedValue(undefined);

    await deleteMilkRecordAction("record-1", "cow-1");

    expect(mockDeleteMilkRecord).toHaveBeenCalledWith(
      expect.anything(),
      "record-1",
    );
    expect(mockRevalidatePath).toHaveBeenCalledWith("/dairy-cows/cow-1");
  });
});
