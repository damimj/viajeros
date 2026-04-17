import Papa from "papaparse";
import { findAirport } from "./airports";

// ============================================================
// FlightRadar24 CSV
// ============================================================

export interface FlightRow {
  date: string;
  flightNumber: string;
  from: string;
  to: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  aircraft: string;
  airline: string;
}

export interface FlightGroup {
  suggestedTitle: string;
  startDate: string;
  endDate: string;
  flights: FlightRow[];
}

export function parseFlightRadarCSV(csvText: string): FlightRow[] {
  const result = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim(),
  });

  return result.data
    .filter((row) => row["Date"] || row["date"])
    .map((row) => ({
      date: row["Date"] ?? row["date"] ?? "",
      flightNumber: row["Flight number"] ?? row["flightNumber"] ?? row["Flight Number"] ?? "",
      from: row["From"] ?? row["from"] ?? "",
      to: row["To"] ?? row["to"] ?? "",
      departureTime: row["Departure time"] ?? row["departureTime"] ?? "",
      arrivalTime: row["Arrival time"] ?? row["arrivalTime"] ?? "",
      duration: row["Duration"] ?? row["duration"] ?? "",
      aircraft: row["Aircraft"] ?? row["aircraft"] ?? "",
      airline: row["Airline"] ?? row["airline"] ?? "",
    }))
    .filter((r) => r.date && r.from && r.to);
}

export function groupFlightsIntoTrips(
  flights: FlightRow[],
  gapDays = 30,
): FlightGroup[] {
  if (!flights.length) return [];

  const sorted = [...flights].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );

  const groups: FlightGroup[] = [];
  let currentGroup: FlightRow[] = [sorted[0]];

  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1].date);
    const curr = new Date(sorted[i].date);
    const diffDays = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);

    if (diffDays > gapDays) {
      groups.push(makeGroup(currentGroup));
      currentGroup = [sorted[i]];
    } else {
      currentGroup.push(sorted[i]);
    }
  }
  groups.push(makeGroup(currentGroup));

  return groups;
}

function makeGroup(flights: FlightRow[]): FlightGroup {
  const dates = flights.map((f) => f.date).sort();
  const first = flights[0];
  const last = flights[flights.length - 1];

  const fromAirport = findAirport(first.from);
  const toAirport = findAirport(last.to);
  const fromCity = fromAirport?.city ?? first.from;
  const toCity = toAirport?.city ?? last.to;

  return {
    suggestedTitle: `${fromCity} → ${toCity}`,
    startDate: dates[0],
    endDate: dates[dates.length - 1],
    flights,
  };
}

// ============================================================
// Airbnb CSV
// ============================================================

export interface AirbnbRow {
  confirmationCode: string;
  checkIn: string;
  checkOut: string;
  nights: string;
  guestName: string;
  listingName: string;
  listingAddress: string;
  amount: string;
  currency: string;
}

export function parseAirbnbCSV(csvText: string): AirbnbRow[] {
  const result = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim(),
  });

  return result.data
    .filter((row) => row["Check-in"] ?? row["Checkin"])
    .map((row) => ({
      confirmationCode: row["Confirmation Code"] ?? row["confirmation_code"] ?? "",
      checkIn: row["Check-in"] ?? row["Checkin"] ?? row["check_in"] ?? "",
      checkOut: row["Check-out"] ?? row["Checkout"] ?? row["check_out"] ?? "",
      nights: row["Nights"] ?? row["nights"] ?? "",
      guestName: row["Guest Name"] ?? row["guest_name"] ?? "",
      listingName: row["Listing"] ?? row["listing"] ?? row["Listing Name"] ?? "",
      listingAddress: row["Address"] ?? row["address"] ?? row["Listing Address"] ?? "",
      amount: row["Amount"] ?? row["amount"] ?? "",
      currency: row["Currency"] ?? row["currency"] ?? "USD",
    }))
    .filter((r) => r.checkIn && r.listingAddress);
}
