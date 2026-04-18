import { describe, it, expect, vi, beforeEach } from "vitest";

const mockFrom = vi.fn();

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => ({ from: mockFrom }),
}));

import { getTagsByTrip, addTag, deleteTag, getAllTags } from "@/lib/models/tags";

const MOCK_TAG = {
  id: "tag-1",
  trip_id: "trip-1",
  tag_name: "europe",
  created_at: "2024-01-01",
};

describe("getTagsByTrip", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns tags for a trip", async () => {
    mockFrom.mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => ({ data: [MOCK_TAG], error: null })),
        })),
      })),
    });
    const tags = await getTagsByTrip("trip-1");
    expect(tags).toHaveLength(1);
    expect(tags[0].tag_name).toBe("europe");
  });

  it("returns empty array when no tags", async () => {
    mockFrom.mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => ({ data: null, error: null })),
        })),
      })),
    });
    expect(await getTagsByTrip("trip-1")).toHaveLength(0);
  });

  it("throws on error", async () => {
    mockFrom.mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => ({ data: null, error: { message: "DB error" } })),
        })),
      })),
    });
    await expect(getTagsByTrip("trip-1")).rejects.toMatchObject({ message: "DB error" });
  });
});

describe("addTag", () => {
  beforeEach(() => vi.clearAllMocks());

  it("normalizes tag to lowercase and trims", async () => {
    let insertedData: Record<string, string> | null = null;
    mockFrom.mockReturnValue({
      insert: vi.fn((data: Record<string, string>) => {
        insertedData = data;
        return {
          select: vi.fn(() => ({
            single: vi.fn(() => ({ data: MOCK_TAG, error: null })),
          })),
        };
      }),
    });
    await addTag("trip-1", "  Europe  ");
    expect(insertedData).toMatchObject({ tag_name: "europe" });
  });

  it("returns the created tag", async () => {
    mockFrom.mockReturnValue({
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => ({ data: MOCK_TAG, error: null })),
        })),
      })),
    });
    const tag = await addTag("trip-1", "europe");
    expect(tag.id).toBe("tag-1");
  });

  it("throws on error", async () => {
    mockFrom.mockReturnValue({
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => ({ data: null, error: { message: "Duplicate" } })),
        })),
      })),
    });
    await expect(addTag("trip-1", "europe")).rejects.toMatchObject({ message: "Duplicate" });
  });
});

describe("deleteTag", () => {
  beforeEach(() => vi.clearAllMocks());

  it("resolves without error", async () => {
    mockFrom.mockReturnValue({
      delete: vi.fn(() => ({ eq: vi.fn(() => ({ error: null })) })),
    });
    await expect(deleteTag("tag-1")).resolves.toBeUndefined();
  });

  it("throws on error", async () => {
    mockFrom.mockReturnValue({
      delete: vi.fn(() => ({
        eq: vi.fn(() => ({ error: { message: "Delete failed" } })),
      })),
    });
    await expect(deleteTag("tag-1")).rejects.toMatchObject({ message: "Delete failed" });
  });
});

describe("getAllTags", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns all tags ordered", async () => {
    mockFrom.mockReturnValue({
      select: vi.fn(() => ({
        order: vi.fn(() => ({ data: [MOCK_TAG], error: null })),
      })),
    });
    const tags = await getAllTags();
    expect(tags).toHaveLength(1);
  });
});
