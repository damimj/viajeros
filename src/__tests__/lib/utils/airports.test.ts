import { describe, it, expect } from "vitest";
import { AIRPORTS, findAirport } from "@/lib/utils/airports";

describe("AIRPORTS", () => {
  it("is a non-empty array", () => {
    expect(Array.isArray(AIRPORTS)).toBe(true);
    expect(AIRPORTS.length).toBeGreaterThan(0);
  });

  it("every airport has required fields", () => {
    for (const airport of AIRPORTS) {
      expect(typeof airport.iata).toBe("string");
      expect(airport.iata).toHaveLength(3);
      expect(typeof airport.city).toBe("string");
      expect(typeof airport.country).toBe("string");
      expect(typeof airport.lat).toBe("number");
      expect(typeof airport.lng).toBe("number");
    }
  });

  it("IATA codes are uppercase", () => {
    for (const airport of AIRPORTS) {
      expect(airport.iata).toBe(airport.iata.toUpperCase());
    }
  });
});

describe("findAirport", () => {
  it("finds an airport by uppercase IATA code", () => {
    const airport = findAirport("JFK");
    expect(airport).toBeDefined();
    expect(airport?.iata).toBe("JFK");
  });

  it("is case-insensitive", () => {
    const upper = findAirport("MAD");
    const lower = findAirport("mad");
    expect(upper).toBeDefined();
    expect(lower).toBeDefined();
    expect(upper?.iata).toBe(lower?.iata);
  });

  it("returns undefined for unknown IATA code", () => {
    expect(findAirport("ZZZ")).toBeUndefined();
  });

  it("returns undefined for empty string", () => {
    expect(findAirport("")).toBeUndefined();
  });

  it("returned airport has valid coordinates", () => {
    const airport = findAirport("LHR");
    expect(airport).toBeDefined();
    expect(airport!.lat).toBeGreaterThan(-90);
    expect(airport!.lat).toBeLessThan(90);
    expect(airport!.lng).toBeGreaterThan(-180);
    expect(airport!.lng).toBeLessThan(180);
  });
});
