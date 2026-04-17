import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/geojson
 *
 * Public API endpoint that returns all published trips with their
 * points and routes as a GeoJSON FeatureCollection.
 *
 * Compatible with the original TravelMap API format.
 *
 * Phase 1: Will be fully implemented once the DB schema is in place.
 */
export async function GET() {
  try {
    const supabase = await createClient();

    // TODO Phase 1: query published trips, points, routes
    const featureCollection: GeoJSON.FeatureCollection = {
      type: "FeatureCollection",
      features: [],
    };

    return NextResponse.json(featureCollection, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    });
  } catch (error) {
    console.error("Error fetching geojson:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
