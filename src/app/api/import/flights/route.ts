import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { findAirport } from "@/lib/utils/airports";
import type { FlightGroup } from "@/lib/utils/csv-parsers";

/**
 * POST /api/import/flights
 *
 * Receives grouped flights and creates trips + routes in the database.
 * Body: { groups: FlightGroup[] }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const groups: FlightGroup[] = body.groups;

    if (!groups || groups.length === 0) {
      return NextResponse.json({ error: "No groups provided" }, { status: 400 });
    }

    const supabase = createAdminClient();
    const results: { tripId: string; title: string; routeCount: number }[] = [];

    for (const group of groups) {
      // Create trip
      const { data: trip, error: tripErr } = await supabase
        .from("trips")
        .insert({
          title: group.title,
          start_date: group.startDate,
          end_date: group.endDate,
          color_hex: "#FF4444",
          status: "draft",
        })
        .select("id")
        .single();

      if (tripErr || !trip) {
        console.error("Failed to create trip:", tripErr);
        continue;
      }

      let routeCount = 0;

      // Create routes for each flight
      for (const flight of group.flights) {
        const fromAirport = findAirport(flight.from);
        const toAirport = findAirport(flight.to);

        if (!fromAirport || !toAirport) {
          console.warn(`Airport not found: ${flight.from} or ${flight.to}`);
          continue;
        }

        const geojson: GeoJSON.Feature = {
          type: "Feature",
          geometry: {
            type: "LineString",
            coordinates: [
              [fromAirport.lon, fromAirport.lat],
              [toAirport.lon, toAirport.lat],
            ],
          },
          properties: {
            from: flight.from,
            to: flight.to,
            fromCity: fromAirport.city,
            toCity: toAirport.city,
            flightNumber: flight.flightNumber,
            airline: flight.airline,
          },
        };

        const routeName = `${fromAirport.city} → ${toAirport.city}`;

        const { error: routeErr } = await supabase.from("routes").insert({
          trip_id: trip.id,
          transport_type: "plane",
          geojson_data: geojson,
          name: routeName,
          description: flight.flightNumber
            ? `${flight.airline} ${flight.flightNumber}`
            : undefined,
          color: "#FF4444",
          start_datetime: flight.date && flight.departureTime
            ? `${flight.date}T${flight.departureTime}`
            : flight.date
              ? `${flight.date}T00:00:00`
              : undefined,
          end_datetime: flight.date && flight.arrivalTime
            ? `${flight.date}T${flight.arrivalTime}`
            : undefined,
        });

        if (!routeErr) routeCount++;
      }

      // Also create POIs for origin/destination airports
      const airportCodes = new Set<string>();
      for (const flight of group.flights) {
        airportCodes.add(flight.from);
        airportCodes.add(flight.to);
      }

      for (const code of airportCodes) {
        const airport = findAirport(code);
        if (!airport) continue;

        await supabase.from("points_of_interest").insert({
          trip_id: trip.id,
          title: `${airport.city} (${airport.iata})`,
          description: airport.name,
          type: "waypoint",
          latitude: airport.lat,
          longitude: airport.lon,
        });
      }

      results.push({ tripId: trip.id, title: group.title, routeCount });
    }

    return NextResponse.json({ success: true, imported: results });
  } catch (error) {
    console.error("Flight import error:", error);
    return NextResponse.json({ error: "Import failed" }, { status: 500 });
  }
}
