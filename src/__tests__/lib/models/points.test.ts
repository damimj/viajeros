import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => ({ from: mockFrom }),
}));

const mockFrom = vi.fn();

import {
  getPointsByTrip,
  getPointById,
  createPoint,
  updatePoint,
  deletePoint,
} from "@/lib/models/points";

const MOCK_POINT = {
  id: "point-1",
  trip_id: "trip-1",
  title: "Sagrada Familia",
  description: "Famous church",
  type: "visit" as const,
  latitude: 41.4036,
  longitude: 2.1744,
  visit_date: "2024-06-05",
  image_path: null,
  created_at: "2024-01-01",
  updated_at: "2024-01-01",
};

describe("getPointsByTrip", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns points for a trip", async () => {
    mockFrom.mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => ({ data: [MOCK_POINT], error: null })),
        })),
      })),
    });
    const points = await getPointsByTrip("trip-1");
    expect(points).toHaveLength(1);
    expect(points[0].title).toBe("Sagrada Familia");
  });

  it("returns empty array when no points", async () => {
    mockFrom.mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => ({ data: null, error: null })),
        })),
      })),
    });
    const points = await getPointsByTrip("trip-1");
    expect(points).toHaveLength(0);
  });

  it("throws on error", async () => {
    mockFrom.mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => ({ data: null, error: { message: "DB error" } })),
        })),
      })),
    });
    await expect(getPointsByTrip("trip-1")).rejects.toMatchObject({ message: "DB error" });
  });
});

describe("getPointById", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns point when found", async () => {
    mockFrom.mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => ({ data: MOCK_POINT, error: null })),
        })),
      })),
    });
    const point = await getPointById("point-1");
    expect(point?.id).toBe("point-1");
  });

  it("returns null when not found", async () => {
    mockFrom.mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => ({ data: null, error: { code: "PGRST116" } })),
        })),
      })),
    });
    expect(await getPointById("nope")).toBeNull();
  });
});

describe("createPoint", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns the created point", async () => {
    mockFrom.mockReturnValue({
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => ({ data: MOCK_POINT, error: null })),
        })),
      })),
    });
    const point = await createPoint({
      trip_id: "trip-1",
      title: "Sagrada Familia",
      type: "visit",
      latitude: 41.4036,
      longitude: 2.1744,
    });
    expect(point.title).toBe("Sagrada Familia");
  });

  it("throws on error", async () => {
    mockFrom.mockReturnValue({
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => ({ data: null, error: { message: "Insert failed" } })),
        })),
      })),
    });
    await expect(
      createPoint({ trip_id: "t", title: "X", type: "visit", latitude: 0, longitude: 0 }),
    ).rejects.toMatchObject({ message: "Insert failed" });
  });
});

describe("updatePoint", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns the updated point", async () => {
    const updated = { ...MOCK_POINT, title: "Park Güell" };
    mockFrom.mockReturnValue({
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => ({ data: updated, error: null })),
          })),
        })),
      })),
    });
    const point = await updatePoint("point-1", { title: "Park Güell" });
    expect(point.title).toBe("Park Güell");
  });

  it("throws on error", async () => {
    mockFrom.mockReturnValue({
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => ({ data: null, error: { message: "Fail" } })),
          })),
        })),
      })),
    });
    await expect(updatePoint("p", {})).rejects.toMatchObject({ message: "Fail" });
  });
});

describe("deletePoint", () => {
  beforeEach(() => vi.clearAllMocks());

  it("resolves without error", async () => {
    mockFrom.mockReturnValue({
      delete: vi.fn(() => ({ eq: vi.fn(() => ({ error: null })) })),
    });
    await expect(deletePoint("point-1")).resolves.toBeUndefined();
  });

  it("throws on error", async () => {
    mockFrom.mockReturnValue({
      delete: vi.fn(() => ({
        eq: vi.fn(() => ({ error: { message: "Delete failed" } })),
      })),
    });
    await expect(deletePoint("p")).rejects.toMatchObject({ message: "Delete failed" });
  });
});
