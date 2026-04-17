import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/geojson
 * GET /api/geojson?trip_id=UUID
 *
 * Public API endpoint returning published trips with points and routes
 * as a GeoJSON FeatureCollection. Compatible with original TravelMap API.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tripIdFilter = searchParams.get("trip_id");

    const supabase = await createClient();

    let tripsQuery = supabase
      .from("trips")
      .select(`
        id, title, description, start_date, end_date, color_hex, status,
        trip_tags(id, tag_name),
        points_of_interest(
          id, title, description, type, icon, image_path,
          latitude, longitude, visit_date
        ),
        routes(
          id, transport_type, geojson_data, is_round_trip,
          distance_meters, color, name, description,
          start_datetime, end_datetime
        )
      `)
      .eq("status", "published")
      .order("start_date", { ascending: false });

    if (tripIdFilter) {
      tripsQuery = tripsQuery.eq("id", tripIdFilter);
    }

    const { data: trips, error } = await tripsQuery;

    if (error) {
      console.error("GeoJSON API error:", error);
      return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
    }

    const features: GeoJSON.Feature[] = [];

    for (const trip of trips ?? []) {
      const tripMeta = {
        tripId: trip.id,
        tripTitle: trip.title,
        tripDescription: trip.description,
        tripColor: trip.color_hex,
        tripStartDate: trip.start_date,
        tripEndDate: trip.end_date,
        tripTags: (trip.trip_tags ?? []).map((t: { tag_name: string }) => t.tag_name),
      };

      // Points as Point features
      for (const poi of trip.points_of_interest ?? []) {
        features.push({
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [Number(poi.longitude), Number(poi.latitude)],
          },
          properties: {
            ...tripMeta,
            featureType: "point",
            id: poi.id,
            title: poi.title,
            description: poi.description,
            pointType: poi.type,
            icon: poi.icon,
            imagePath: poi.image_path,
            visitDate: poi.visit_date,
          },
        });
      }

      // Routes
      for (const route of trip.routes ?? []) {
        const routeProps = {
          ...tripMeta,
          featureType: "route",
          id: route.id,
          transportType: route.transport_type,
          routeColor: route.color,
          routeName: route.name,
          routeDescription: route.description,
          distanceMeters: route.distance_meters,
          isRoundTrip: route.is_round_trip,
          startDatetime: route.start_datetime,
          endDatetime: route.end_datetime,
        };

        const geojson = route.geojson_data as GeoJSON.Feature | GeoJSON.FeatureCollection;

        if (geojson.type === "FeatureCollection") {
          for (const feature of geojson.features) {
            features.push({
              ...feature,
              properties: { ...(feature.properties ?? {}), ...routeProps },
            });
          }
        } else if (geojson.type === "Feature") {
          features.push({
            ...geojson,
            properties: { ...(geojson.properties ?? {}), ...routeProps },
          });
        }
      }
    }

    return NextResponse.json(
      { type: "FeatureCollection", features } as GeoJSON.FeatureCollection,
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
          "Access-Control-Allow-Origin": "*",
        },
      },
    );
  } catch (error) {
    console.error("GeoJSON API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
