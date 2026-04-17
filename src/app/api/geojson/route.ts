import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Trip } from "@/types/domain";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tripId = searchParams.get("trip_id");

  const supabase = createAdminClient();

  let query = supabase
    .from("trips")
    .select(`
      *,
      points:points_of_interest(*),
      routes(*),
      tags:trip_tags(id, tag_name, trip_id, created_at)
    `)
    .eq("status", "published");

  if (tripId) {
    query = query.eq("id", tripId);
  }

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const trips = (data as Trip[]) ?? [];

  const features = trips.flatMap((trip) => {
    const poiFeatures = (trip.points ?? []).map((poi) => ({
      type: "Feature" as const,
      geometry: {
        type: "Point" as const,
        coordinates: [poi.longitude, poi.latitude],
      },
      properties: {
        id: poi.id,
        trip_id: poi.trip_id,
        title: poi.title,
        description: poi.description,
        type: poi.type,
        visit_date: poi.visit_date,
        image_path: poi.image_path,
        trip_color: trip.color_hex,
        trip_title: trip.title,
      },
    }));

    const routeFeatures = (trip.routes ?? []).flatMap((route) => {
      try {
        const gj = route.geojson_data as { type: string; features?: unknown[] };
        if (gj.type === "FeatureCollection") {
          return (gj.features ?? []).map((f) => ({
            ...(f as object),
            properties: {
              ...((f as { properties?: object }).properties ?? {}),
              route_id: route.id,
              trip_id: route.trip_id,
              transport_type: route.transport_type,
              color: route.color,
              trip_color: trip.color_hex,
            },
          }));
        }
        return [
          {
            type: "Feature" as const,
            geometry: gj,
            properties: {
              route_id: route.id,
              trip_id: route.trip_id,
              transport_type: route.transport_type,
              color: route.color,
              trip_color: trip.color_hex,
            },
          },
        ];
      } catch {
        return [];
      }
    });

    return [...poiFeatures, ...routeFeatures];
  });

  return NextResponse.json(
    {
      type: "FeatureCollection",
      features,
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    },
  );
}
