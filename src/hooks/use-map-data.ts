"use client";

import { useState, useEffect, useCallback } from "react";

interface TripMeta {
  id: string;
  title: string;
  color: string;
  startDate: string | null;
  endDate: string | null;
  tags: string[];
  pointCount: number;
  routeCount: number;
}

interface MapData {
  features: GeoJSON.Feature[];
  trips: TripMeta[];
  totalPoints: number;
  totalRoutes: number;
}

export function useMapData(tripId?: string | null) {
  const [data, setData] = useState<MapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const url = tripId
        ? `/api/geojson?trip_id=${tripId}`
        : "/api/geojson";

      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const json = await res.json();

      setData({
        features: json.features ?? [],
        trips: json.metadata?.trips ?? [],
        totalPoints: json.metadata?.totalPoints ?? 0,
        totalRoutes: json.metadata?.totalRoutes ?? 0,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load map data");
    } finally {
      setLoading(false);
    }
  }, [tripId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}
