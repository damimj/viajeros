import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { findAirport } from "@/lib/utils/airports";
import type { FlightGroup } from "@/lib/utils/csv-parsers";

export async function POST(request: Request) {
  // Verify admin session
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { groups } = (await request.json()) as { groups: FlightGroup[] };
  if (!groups?.length) {
    return NextResponse.json({ error: "No groups provided" }, { status: 400 });
  }

  const admin = createAdminClient();
  const created: string[] = [];

  for (const group of groups) {
    try {
      // Create trip
      const { data: trip, error: tripErr } = await admin
        .from("trips")
        .insert({
          title: group.suggestedTitle,
          start_date: group.startDate,
          end_date: group.endDate,
          status: "draft",
          color_hex: "#FF4444",
        })
        .select()
        .single();

      if (tripErr || !trip) continue;
      created.push(trip.id);

      // Create route per flight
      for (const flight of group.flights) {
        const fromAirport = findAirport(flight.from);
        const toAirport = findAirport(flight.to);

        if (!fromAirport || !toAirport) continue;

        const geojson = {
          type: "LineString",
          coordinates: [
            [fromAirport.lng, fromAirport.lat],
            [toAirport.lng, toAirport.lat],
          ],
        };

        await admin.from("routes").insert({
          trip_id: trip.id,
          transport_type: "plane",
          geojson_data: geojson,
          name: `${flight.flightNumber}: ${flight.from}→${flight.to}`,
          start_datetime: flight.date ? new Date(flight.date).toISOString() : null,
          color: "#FF4444",
          distance_meters: 0,
        });

        // Create POIs for departure and arrival
        await admin.from("points_of_interest").insert([
          {
            trip_id: trip.id,
            title: `${fromAirport.city} (${fromAirport.iata})`,
            type: "waypoint",
            latitude: fromAirport.lat,
            longitude: fromAirport.lng,
            visit_date: flight.date ? new Date(flight.date).toISOString() : null,
          },
          {
            trip_id: trip.id,
            title: `${toAirport.city} (${toAirport.iata})`,
            type: "waypoint",
            latitude: toAirport.lat,
            longitude: toAirport.lng,
            visit_date: flight.date ? new Date(flight.date).toISOString() : null,
          },
        ]);
      }
    } catch {
      // skip failed group
    }
  }

  return NextResponse.json({ created });
}
