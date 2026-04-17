import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { AirbnbRow } from "@/lib/utils/csv-parsers";

/**
 * POST /api/import/airbnb
 *
 * Receives parsed Airbnb rows with geocoded coordinates.
 * Links stays to existing trips by date overlap, or creates new trips.
 *
 * Body: { stays: Array<AirbnbRow & { latitude?: number; longitude?: number }> }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const stays: (AirbnbRow & { latitude?: number; longitude?: number })[] = body.stays;

    if (!stays || stays.length === 0) {
      return NextResponse.json({ error: "No stays provided" }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Fetch all existing trips for date matching
    const { data: existingTrips } = await supabase
      .from("trips")
      .select("id, title, start_date, end_date")
      .order("start_date");

    let imported = 0;
    let linked = 0;
    let newTrips = 0;

    for (const stay of stays) {
      if (!stay.latitude || !stay.longitude) continue;

      // Try to find a matching trip by date overlap
      let matchedTripId: string | null = null;

      if (existingTrips) {
        for (const trip of existingTrips) {
          if (!trip.start_date || !trip.end_date) continue;
          const tripStart = new Date(trip.start_date).getTime();
          const tripEnd = new Date(trip.end_date).getTime();
          const stayStart = new Date(stay.startDate).getTime();
          const stayEnd = new Date(stay.endDate).getTime();

          // Check overlap: stay starts during trip or trip starts during stay
          if (stayStart <= tripEnd && stayEnd >= tripStart) {
            matchedTripId = trip.id;
            linked++;
            break;
          }
        }
      }

      // If no matching trip, create a new one
      if (!matchedTripId) {
        const { data: newTrip, error: tripErr } = await supabase
          .from("trips")
          .insert({
            title: `Airbnb: ${stay.listing}`,
            start_date: stay.startDate,
            end_date: stay.endDate,
            color_hex: "#FF5A5F", // Airbnb red
            status: "draft",
          })
          .select("id")
          .single();

        if (tripErr || !newTrip) continue;
        matchedTripId = newTrip.id;
        newTrips++;
      }

      // Create point of interest for the stay
      const { error: poiErr } = await supabase.from("points_of_interest").insert({
        trip_id: matchedTripId,
        title: stay.listing,
        description: stay.listingAddress
          ? `${stay.listingAddress} · ${stay.nights} nights · ${stay.confirmationCode}`
          : `${stay.nights} nights · ${stay.confirmationCode}`,
        type: "stay",
        latitude: stay.latitude,
        longitude: stay.longitude,
        visit_date: stay.startDate ? `${stay.startDate}T14:00:00` : undefined,
      });

      if (!poiErr) imported++;
    }

    return NextResponse.json({
      success: true,
      imported,
      linked,
      newTrips,
    });
  } catch (error) {
    console.error("Airbnb import error:", error);
    return NextResponse.json({ error: "Import failed" }, { status: 500 });
  }
}
