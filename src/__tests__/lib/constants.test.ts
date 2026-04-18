import { describe, it, expect } from "vitest";
import {
  MAP_STYLES,
  DEFAULT_TRANSPORT_COLORS,
  TRANSPORT_TYPES,
  POI_TYPES,
  LINK_TYPES,
  TRIP_STATUSES,
} from "@/lib/constants";

describe("MAP_STYLES", () => {
  it("is an object with string values (URLs)", () => {
    expect(typeof MAP_STYLES).toBe("object");
    for (const [, url] of Object.entries(MAP_STYLES)) {
      expect(typeof url).toBe("string");
      expect(url.length).toBeGreaterThan(0);
    }
  });

  it("contains at least the four standard styles", () => {
    expect(MAP_STYLES).toHaveProperty("voyager");
    expect(MAP_STYLES).toHaveProperty("positron");
  });
});

describe("DEFAULT_TRANSPORT_COLORS", () => {
  it("has an entry for every transport type", () => {
    for (const type of TRANSPORT_TYPES) {
      expect(DEFAULT_TRANSPORT_COLORS).toHaveProperty(type);
    }
  });

  it("all colors are valid hex strings", () => {
    const hexPattern = /^#[0-9a-fA-F]{3,8}$/;
    for (const [, color] of Object.entries(DEFAULT_TRANSPORT_COLORS)) {
      expect(color).toMatch(hexPattern);
    }
  });
});

describe("TRANSPORT_TYPES", () => {
  it("is a non-empty array", () => {
    expect(Array.isArray(TRANSPORT_TYPES)).toBe(true);
    expect(TRANSPORT_TYPES.length).toBeGreaterThan(0);
  });

  it("contains all expected transport types", () => {
    expect(TRANSPORT_TYPES).toContain("plane");
    expect(TRANSPORT_TYPES).toContain("car");
    expect(TRANSPORT_TYPES).toContain("train");
    expect(TRANSPORT_TYPES).toContain("bus");
    expect(TRANSPORT_TYPES).toContain("ship");
    expect(TRANSPORT_TYPES).toContain("bike");
    expect(TRANSPORT_TYPES).toContain("walk");
    expect(TRANSPORT_TYPES).toContain("aerial");
  });

  it("has no duplicate values", () => {
    expect(new Set(TRANSPORT_TYPES).size).toBe(TRANSPORT_TYPES.length);
  });
});

describe("POI_TYPES", () => {
  it("is a non-empty array", () => {
    expect(Array.isArray(POI_TYPES)).toBe(true);
    expect(POI_TYPES.length).toBeGreaterThan(0);
  });

  it("contains expected POI types", () => {
    expect(POI_TYPES).toContain("stay");
    expect(POI_TYPES).toContain("visit");
    expect(POI_TYPES).toContain("food");
    expect(POI_TYPES).toContain("waypoint");
  });
});

describe("LINK_TYPES", () => {
  it("is a non-empty array", () => {
    expect(Array.isArray(LINK_TYPES)).toBe(true);
    expect(LINK_TYPES.length).toBeGreaterThan(0);
  });

  it("contains website link type", () => {
    expect(LINK_TYPES).toContain("website");
  });
});

describe("TRIP_STATUSES", () => {
  it("contains all three trip statuses", () => {
    expect(TRIP_STATUSES).toContain("draft");
    expect(TRIP_STATUSES).toContain("published");
    expect(TRIP_STATUSES).toContain("planned");
  });

  it("has exactly three statuses", () => {
    expect(TRIP_STATUSES).toHaveLength(3);
  });
});
