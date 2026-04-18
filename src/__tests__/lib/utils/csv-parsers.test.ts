import { describe, it, expect } from "vitest";
import {
  parseFlightRadarCSV,
  groupFlightsIntoTrips,
  parseAirbnbCSV,
  type FlightRow,
} from "@/lib/utils/csv-parsers";

const FLIGHT_CSV = `Date,Flight number,From,To,Departure time,Arrival time,Duration,Aircraft,Airline
2024-01-10,AA100,JFK,LAX,08:00,11:00,5h00m,Boeing 737,American Airlines
2024-01-15,BA200,LHR,MAD,14:00,17:00,2h00m,Airbus A320,British Airways
2024-03-01,IB300,MAD,BCN,10:00,11:00,1h00m,Airbus A321,Iberia
`;

const FLIGHT_CSV_MISSING_FIELDS = `Date,Flight number,From,To,Departure time,Arrival time,Duration,Aircraft,Airline
2024-01-10,AA100,,LAX,08:00,11:00,5h00m,Boeing 737,American Airlines
,BA200,LHR,MAD,14:00,17:00,2h00m,Airbus A320,British Airways
2024-02-01,IB300,MAD,,10:00,11:00,1h00m,Airbus A321,Iberia
`;

const AIRBNB_CSV = `Confirmation Code,Check-in,Check-out,Nights,Guest Name,Listing,Address,Amount,Currency
ABC123,2024-06-01,2024-06-07,6,John Doe,Nice Apartment,123 Main St Barcelona,450.00,EUR
DEF456,2024-07-10,2024-07-14,4,Jane Doe,Beach House,456 Ocean Ave Miami,320.00,USD
`;

const AIRBNB_CSV_MISSING_ADDRESS = `Confirmation Code,Check-in,Check-out,Nights,Guest Name,Listing,Address,Amount,Currency
GHI789,2024-08-01,2024-08-05,4,Bob,,
`;

describe("parseFlightRadarCSV", () => {
  it("parses valid CSV rows", () => {
    const rows = parseFlightRadarCSV(FLIGHT_CSV);
    expect(rows).toHaveLength(3);
  });

  it("extracts correct fields from first row", () => {
    const [first] = parseFlightRadarCSV(FLIGHT_CSV);
    expect(first.date).toBe("2024-01-10");
    expect(first.flightNumber).toBe("AA100");
    expect(first.from).toBe("JFK");
    expect(first.to).toBe("LAX");
    expect(first.aircraft).toBe("Boeing 737");
    expect(first.airline).toBe("American Airlines");
  });

  it("filters out rows missing date, from, or to", () => {
    const rows = parseFlightRadarCSV(FLIGHT_CSV_MISSING_FIELDS);
    expect(rows).toHaveLength(0);
  });

  it("returns empty array for empty CSV", () => {
    expect(parseFlightRadarCSV("")).toHaveLength(0);
  });

  it("returns empty array for header-only CSV", () => {
    const headerOnly = "Date,Flight number,From,To,Departure time,Arrival time,Duration,Aircraft,Airline\n";
    expect(parseFlightRadarCSV(headerOnly)).toHaveLength(0);
  });
});

describe("groupFlightsIntoTrips", () => {
  it("returns empty array for empty input", () => {
    expect(groupFlightsIntoTrips([])).toHaveLength(0);
  });

  it("groups nearby flights into one trip", () => {
    const flights = parseFlightRadarCSV(FLIGHT_CSV);
    // Jan 10 and Jan 15 are 5 days apart (< 30 day gap) → same group
    // Mar 01 is 45 days after Jan 15 (> 30 day gap) → new group
    const groups = groupFlightsIntoTrips(flights);
    expect(groups).toHaveLength(2);
    expect(groups[0].flights).toHaveLength(2);
    expect(groups[1].flights).toHaveLength(1);
  });

  it("uses custom gapDays parameter", () => {
    const flights = parseFlightRadarCSV(FLIGHT_CSV);
    // With a 3-day gap, Jan 10 and Jan 15 (5 days apart) split
    const groups = groupFlightsIntoTrips(flights, 3);
    expect(groups).toHaveLength(3);
  });

  it("sets startDate and endDate correctly", () => {
    const flights = parseFlightRadarCSV(FLIGHT_CSV);
    const groups = groupFlightsIntoTrips(flights);
    expect(groups[0].startDate).toBe("2024-01-10");
    expect(groups[0].endDate).toBe("2024-01-15");
  });

  it("builds suggestedTitle from city names", () => {
    const flights = parseFlightRadarCSV(FLIGHT_CSV);
    const groups = groupFlightsIntoTrips(flights);
    // First group: JFK → first flight from, LAX → last flight to within the group
    expect(groups[0].suggestedTitle).toContain("→");
  });

  it("single flight produces one group", () => {
    const single: FlightRow[] = [
      {
        date: "2024-05-01",
        flightNumber: "XX1",
        from: "JFK",
        to: "LAX",
        departureTime: "",
        arrivalTime: "",
        duration: "",
        aircraft: "",
        airline: "",
      },
    ];
    const groups = groupFlightsIntoTrips(single);
    expect(groups).toHaveLength(1);
    expect(groups[0].flights).toHaveLength(1);
  });

  it("sorts flights by date before grouping", () => {
    const flights: FlightRow[] = [
      { date: "2024-03-01", flightNumber: "C", from: "MAD", to: "BCN", departureTime: "", arrivalTime: "", duration: "", aircraft: "", airline: "" },
      { date: "2024-01-10", flightNumber: "A", from: "JFK", to: "LAX", departureTime: "", arrivalTime: "", duration: "", aircraft: "", airline: "" },
      { date: "2024-01-15", flightNumber: "B", from: "LHR", to: "MAD", departureTime: "", arrivalTime: "", duration: "", aircraft: "", airline: "" },
    ];
    const groups = groupFlightsIntoTrips(flights);
    expect(groups[0].startDate).toBe("2024-01-10");
    expect(groups[1].startDate).toBe("2024-03-01");
  });
});

describe("parseAirbnbCSV", () => {
  it("parses valid Airbnb CSV", () => {
    const rows = parseAirbnbCSV(AIRBNB_CSV);
    expect(rows).toHaveLength(2);
  });

  it("extracts correct fields", () => {
    const [first] = parseAirbnbCSV(AIRBNB_CSV);
    expect(first.confirmationCode).toBe("ABC123");
    expect(first.checkIn).toBe("2024-06-01");
    expect(first.checkOut).toBe("2024-06-07");
    expect(first.nights).toBe("6");
    expect(first.listingAddress).toBe("123 Main St Barcelona");
    expect(first.currency).toBe("EUR");
  });

  it("filters out rows missing checkIn or listingAddress", () => {
    const rows = parseAirbnbCSV(AIRBNB_CSV_MISSING_ADDRESS);
    expect(rows).toHaveLength(0);
  });

  it("returns empty array for empty input", () => {
    expect(parseAirbnbCSV("")).toHaveLength(0);
  });
});
