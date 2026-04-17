import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/geojson
 *
 * Public API endpoint returning all published trips with their points and routes
 * as a GeoJSON FeatureCollection. Compatible with the original TravelMap API.
 *
 * Query params:
 *   ?trip_id=UUID  — filter to a single trip
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const tripId = request.nextUrl.searchParams.get("trip_id");

    // Fetch published trips
    let tripsQuery = supabase
      .from("trips")
      .select(`
        *,
        trip_tags(tag_name),
        points_of_interest(*),
        routes(*)
      `)
      .eq("status", "published")
      .order("start_date", { ascending: false });

    if (tripId) {
      tripsQuery = tripsQuery.eq("id", tripId);
    }

    const { data: trips, error } = await tripsQuery;

    if (error) {
      console.error("GeoJSON API error:", error);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    const features: GeoJSON.Feature[] = [];

    for (const trip of trips ?? []) {
      // Add points as Point features
      const points = (trip.points_of_interest ?? []) as Array<{
        id: string;
        title: string;
        description: string | null;
        type: string;
        icon: string;
        image_path: string | null;
        latitude: number;
        longitude: number;
        visit_date: string | null;
      }>;

      for (const poi of points) {
        features.push({
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [Number(poi.longitude), Number(poi.latitude)],
          },
          properties: {
            id: poi.id,
            tripId: trip.id,
            tripTitle: trip.title,
            tripColor: trip.color_hex,
            title: poi.title,
            description: poi.description,
            type: poi.type,
            icon: poi.icon,
            imagePath: poi.image_path,
            visitDate: poi.visit_date,
            featureType: "point",
          },
        });
      }

      // Add routes as LineString / MultiLineString features
      const routes = (trip.routes ?? []) as Array<{
        id: string;
        transport_type: string;
        geojson_data: GeoJSON.Feature | GeoJSON.FeatureCollection | GeoJSON.Geometry;
        distance_meters: number;
        color: string;
        name: string | null;
        is_round_trip: boolean;
        start_datetime: string | null;
        end_datetime: string | null;
      }>;

      for (const route of routes) {
        // Extract geometry from geojson_data which can be Feature, FeatureCollection, or raw Geometry
        let geometry: GeoJSON.Geometry | null = null;
        const gj = route.geojson_data;

        if (gj && typeof gj === "object") {
          if ("type" in gj) {
            if (gj.type === "Feature") {
              geometry = (gj as GeoJSON.Feature).geometry;
            } else if (gj.type === "FeatureCollection") {
              // Merge all geometries into one
              const fc = gj as GeoJSON.FeatureCollection;
              if (fc.features.length === 1) {
                geometry = fc.features[0].geometry;
              } else if (fc.features.length > 1) {
                // Combine into MultiLineString if all are LineStrings
                const coords: number[][][] = [];
                for (const f of fc.features) {
                  if (f.geometry.type === "LineString") {
                    coords.push((f.geometry as GeoJSON.LineString).coordinates);
                  }
                }
                if (coords.length > 0) {
                  geometry = { type: "MultiLineString", coordinates: coords };
                }
              }
            } else {
              // Raw geometry
              geometry = gj as GeoJSON.Geometry;
            }
          }
        }

        if (!geometry) continue;

        features.push({
          type: "Feature",
          geometry,
          properties: {
            id: route.id,
            tripId: trip.id,
            tripTitle: trip.title,
            tripColor: trip.color_hex,
            transportType: route.transport_type,
            color: route.color,
            name: route.name,
            distanceMeters: route.distance_meters,
            isRoundTrip: route.is_round_trip,
            startDatetime: route.start_datetime,
            endDatetime: route.end_datetime,
            featureType: "route",
          },
        });
      }
    }

    // Build response with trip metadata
    const tripsMeta = (trips ?? []).map((trip) => ({
      id: trip.id,
      title: trip.title,
      color: trip.color_hex,
      startDate: trip.start_date,
      endDate: trip.end_date,
      tags: ((trip.trip_tags ?? []) as Array<{ tag_name: string }>).map((t) => t.tag_name),
      pointCount: ((trip.points_of_interest ?? []) as unknown[]).length,
      routeCount: ((trip.routes ?? []) as unknown[]).length,
    }));

    const response = {
      type: "FeatureCollection" as const,
      features,
      metadata: {
        totalTrips: tripsMeta.length,
        totalPoints: features.filter((f) => f.properties?.featureType === "point").length,
        totalRoutes: features.filter((f) => f.properties?.featureType === "route").length,
        trips: tripsMeta,
      },
    };

    return NextResponse.json(response, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    console.error("GeoJSON API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
