/**
 * FlightRadar CSV export format (from my.flightradar24.com/settings/export):
 * Date, Flight Number, From (IATA/ICAO), To (IATA/ICAO), Departure Time, Arrival Time,
 * Duration, Airline, Aircraft, Registration, Seat Number, Seat Type, Class, Reason, Note
 *
 * Only Date, From, and To are mandatory.
 */

export interface FlightRow {
  date: string;
  flightNumber: string;
  from: string;
  to: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  airline: string;
  aircraft: string;
  registration: string;
  seatNumber: string;
  seatType: string;
  flightClass: string;
  reason: string;
  note: string;
}

export interface FlightGroup {
  id: string;
  title: string;
  flights: FlightRow[];
  startDate: string;
  endDate: string;
}

/**
 * Parse FlightRadar CSV text into FlightRow array.
 * Handles both quoted and unquoted fields.
 */
export function parseFlightRadarCSV(csvText: string): FlightRow[] {
  const lines = csvText.trim().split("\n");
  if (lines.length < 2) return [];

  // Skip header row
  const rows: FlightRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const cols = parseCSVLine(line);
    if (cols.length < 3) continue;

    rows.push({
      date: cols[0]?.trim() ?? "",
      flightNumber: cols[1]?.trim() ?? "",
      from: extractAirportCode(cols[2]?.trim() ?? ""),
      to: extractAirportCode(cols[3]?.trim() ?? ""),
      departureTime: cols[4]?.trim() ?? "",
      arrivalTime: cols[5]?.trim() ?? "",
      duration: cols[6]?.trim() ?? "",
      airline: cols[7]?.trim() ?? "",
      aircraft: cols[8]?.trim() ?? "",
      registration: cols[9]?.trim() ?? "",
      seatNumber: cols[10]?.trim() ?? "",
      seatType: cols[11]?.trim() ?? "",
      flightClass: cols[12]?.trim() ?? "",
      reason: cols[13]?.trim() ?? "",
      note: cols[14]?.trim() ?? "",
    });
  }

  return rows.filter((r) => r.date && r.from && r.to);
}

/**
 * Parse a single CSV line handling quoted fields.
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}

/**
 * Extract IATA/ICAO code from formats like "LHR", "EGLL", "LHR/EGLL", "EGLL/LHR"
 */
function extractAirportCode(raw: string): string {
  if (!raw) return "";
  // Take the first part if there's a slash
  const parts = raw.split("/");
  const code = parts[0].trim().toUpperCase();
  // Return 3-letter IATA if available, otherwise the code
  return code.length <= 4 ? code : code.substring(0, 4);
}

/**
 * Group flights into trips based on time intervals.
 * Flights within `gapDays` of each other are grouped into the same trip.
 */
export function groupFlightsIntoTrips(
  flights: FlightRow[],
  gapDays: number = 7,
): FlightGroup[] {
  if (flights.length === 0) return [];

  // Sort by date
  const sorted = [...flights].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );

  const groups: FlightGroup[] = [];
  let currentGroup: FlightRow[] = [sorted[0]];

  for (let i = 1; i < sorted.length; i++) {
    const prevDate = new Date(sorted[i - 1].date).getTime();
    const currDate = new Date(sorted[i].date).getTime();
    const diffDays = (currDate - prevDate) / (1000 * 60 * 60 * 24);

    if (diffDays <= gapDays) {
      currentGroup.push(sorted[i]);
    } else {
      groups.push(makeGroup(currentGroup, groups.length));
      currentGroup = [sorted[i]];
    }
  }

  if (currentGroup.length > 0) {
    groups.push(makeGroup(currentGroup, groups.length));
  }

  return groups;
}

function makeGroup(flights: FlightRow[], index: number): FlightGroup {
  const dates = flights.map((f) => f.date).sort();
  const origins = flights.map((f) => f.from);
  const destinations = flights.map((f) => f.to);
  const cities = [...new Set([...origins, ...destinations])];

  return {
    id: `group-${index}`,
    title: `Trip: ${cities.slice(0, 3).join(" - ")}${cities.length > 3 ? "..." : ""}`,
    flights,
    startDate: dates[0],
    endDate: dates[dates.length - 1],
  };
}

/**
 * Airbnb CSV export format.
 * Columns: Status, Confirmation Code, Listing, Start Date, End Date, Nights, Booked, Listing Address
 */
export interface AirbnbRow {
  status: string;
  confirmationCode: string;
  listing: string;
  startDate: string;
  endDate: string;
  nights: string;
  booked: string;
  listingAddress: string;
}

export function parseAirbnbCSV(csvText: string): AirbnbRow[] {
  const lines = csvText.trim().split("\n");
  if (lines.length < 2) return [];

  const rows: AirbnbRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const cols = parseCSVLine(line);
    if (cols.length < 4) continue;

    rows.push({
      status: cols[0]?.trim() ?? "",
      confirmationCode: cols[1]?.trim() ?? "",
      listing: cols[2]?.trim() ?? "",
      startDate: cols[3]?.trim() ?? "",
      endDate: cols[4]?.trim() ?? "",
      nights: cols[5]?.trim() ?? "",
      booked: cols[6]?.trim() ?? "",
      listingAddress: cols[7]?.trim() ?? "",
    });
  }

  return rows.filter((r) => r.startDate && r.listing);
}
