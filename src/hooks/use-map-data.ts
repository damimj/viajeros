"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Trip } from "@/types/domain";

export function useMapData() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();

    supabase
      .from("trips")
      .select(`
        *,
        points:points_of_interest(*),
        routes(*),
        tags:trip_tags(id, tag_name, trip_id, created_at)
      `)
      .eq("status", "published")
      .order("start_date", { ascending: false })
      .then(({ data, error: err }) => {
        if (err) {
          setError(err.message);
        } else {
          setTrips((data as Trip[]) ?? []);
        }
        setLoading(false);
      });
  }, []);

  return { trips, loading, error };
}
