"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export interface TripData {
  id: string;
  title: string;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
  color_hex: string;
  trip_tags: { id: string; tag_name: string }[];
  points_of_interest: PointData[];
  routes: RouteData[];
}

export interface PointData {
  id: string;
  title: string;
  description: string | null;
  type: string;
  icon: string;
  image_path: string | null;
  latitude: number;
  longitude: number;
  visit_date: string | null;
}

export interface RouteData {
  id: string;
  transport_type: string;
  geojson_data: GeoJSON.Feature | GeoJSON.FeatureCollection;
  is_round_trip: boolean;
  distance_meters: number;
  color: string;
  name: string | null;
  description: string | null;
  start_datetime: string | null;
  end_datetime: string | null;
}

export function useMapData() {
  const [trips, setTrips] = useState<TripData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const supabase = createClient();
        const { data, error: err } = await supabase
          .from("trips")
          .select(`
            id, title, description, start_date, end_date, color_hex,
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

        if (err) throw err;
        setTrips((data as TripData[]) ?? []);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load map data");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return { trips, loading, error };
}
