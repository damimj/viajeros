import { describe, it, expect, vi, beforeEach } from "vitest";

// ---- Supabase admin client mock ----
const mockSingle = vi.fn();
const mockSelect = vi.fn(() => ({ single: mockSingle, eq: mockEq, order: mockOrder }));
const mockEq = vi.fn(() => ({ single: mockSingle, select: mockSelect, order: mockOrder }));
const mockOrder = vi.fn(() => ({ data: [], error: null, single: mockSingle, eq: mockEq }));
const mockInsert = vi.fn(() => ({ select: mockSelect }));
const mockUpdate = vi.fn(() => ({ eq: mockEq }));
const mockDelete = vi.fn(() => ({ eq: mockEq }));
const mockFrom = vi.fn(() => ({
  select: mockSelect,
  insert: mockInsert,
  update: mockUpdate,
  delete: mockDelete,
  order: mockOrder,
  eq: mockEq,
}));

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => ({ from: mockFrom }),
}));

import { getTrips, getTripById, createTrip, updateTrip, deleteTrip } from "@/lib/models/trips";

const MOCK_TRIP = {
  id: "trip-1",
  title: "Europe 2024",
  status: "published",
  color_hex: "#ff4444",
  start_date: "2024-06-01",
  end_date: "2024-06-30",
  description: "A great trip",
  created_at: "2024-01-01",
  updated_at: "2024-01-01",
};

describe("getTrips", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns array of trips on success", async () => {
    mockFrom.mockReturnValue({
      select: vi.fn(() => ({
        order: vi.fn(() => ({ data: [MOCK_TRIP], error: null })),
      })),
    });
    const trips = await getTrips();
    expect(trips).toHaveLength(1);
    expect(trips[0].id).toBe("trip-1");
  });

  it("returns empty array when no trips", async () => {
    mockFrom.mockReturnValue({
      select: vi.fn(() => ({
        order: vi.fn(() => ({ data: null, error: null })),
      })),
    });
    const trips = await getTrips();
    expect(trips).toHaveLength(0);
  });

  it("throws when Supabase returns an error", async () => {
    mockFrom.mockReturnValue({
      select: vi.fn(() => ({
        order: vi.fn(() => ({ data: null, error: { message: "DB error" } })),
      })),
    });
    await expect(getTrips()).rejects.toMatchObject({ message: "DB error" });
  });
});

describe("getTripById", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns a trip when found", async () => {
    mockFrom.mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => ({ data: MOCK_TRIP, error: null })),
        })),
      })),
    });
    const trip = await getTripById("trip-1");
    expect(trip).not.toBeNull();
    expect(trip?.id).toBe("trip-1");
  });

  it("returns null when not found", async () => {
    mockFrom.mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => ({ data: null, error: { code: "PGRST116" } })),
        })),
      })),
    });
    const trip = await getTripById("nonexistent");
    expect(trip).toBeNull();
  });
});

describe("createTrip", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns the created trip", async () => {
    mockFrom.mockReturnValue({
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => ({ data: MOCK_TRIP, error: null })),
        })),
      })),
    });
    const trip = await createTrip({ title: "Europe 2024" });
    expect(trip.id).toBe("trip-1");
    expect(trip.title).toBe("Europe 2024");
  });

  it("throws on error", async () => {
    mockFrom.mockReturnValue({
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => ({ data: null, error: { message: "Insert failed" } })),
        })),
      })),
    });
    await expect(createTrip({ title: "Bad Trip" })).rejects.toMatchObject({
      message: "Insert failed",
    });
  });
});

describe("updateTrip", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns the updated trip", async () => {
    const updated = { ...MOCK_TRIP, title: "Updated Title" };
    mockFrom.mockReturnValue({
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => ({ data: updated, error: null })),
          })),
        })),
      })),
    });
    const trip = await updateTrip("trip-1", { title: "Updated Title" });
    expect(trip.title).toBe("Updated Title");
  });

  it("throws on error", async () => {
    mockFrom.mockReturnValue({
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => ({ data: null, error: { message: "Update failed" } })),
          })),
        })),
      })),
    });
    await expect(updateTrip("trip-1", {})).rejects.toMatchObject({ message: "Update failed" });
  });
});

describe("deleteTrip", () => {
  beforeEach(() => vi.clearAllMocks());

  it("resolves without error", async () => {
    mockFrom.mockReturnValue({
      delete: vi.fn(() => ({
        eq: vi.fn(() => ({ error: null })),
      })),
    });
    await expect(deleteTrip("trip-1")).resolves.toBeUndefined();
  });

  it("throws on error", async () => {
    mockFrom.mockReturnValue({
      delete: vi.fn(() => ({
        eq: vi.fn(() => ({ error: { message: "Delete failed" } })),
      })),
    });
    await expect(deleteTrip("trip-1")).rejects.toMatchObject({ message: "Delete failed" });
  });
});
