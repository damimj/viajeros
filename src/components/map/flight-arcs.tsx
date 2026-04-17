"use client";

import { useEffect, useRef } from "react";
import { MapboxOverlay } from "@deck.gl/mapbox";
import { ArcLayer } from "@deck.gl/layers";
import type { TripData } from "@/hooks/use-map-data";

interface FlightArcsProps {
  map: maplibregl.Map | null;
  trips: TripData[];
  transportColors: Record<string, string>;
}

interface ArcData {
  source: [number, number];
  target: [number, number];
  color: string;
  name: string;
}

function hexToRgb(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return [r, g, b];
}

/**
 * Extracts arc data from plane routes.
 * For LineString routes, takes first and last coordinates as source/target.
 */
function extractArcs(trips: TripData[], transportColors: Record<string, string>): ArcData[] {
  const arcs: ArcData[] = [];

  for (const trip of trips) {
    for (const route of trip.routes) {
      if (route.transport_type !== "plane") continue;

      const color = route.color || transportColors.plane || trip.color_hex;
      const geojson = route.geojson_data;

      const features: GeoJSON.Feature[] =
        geojson.type === "FeatureCollection"
          ? geojson.features
          : geojson.type === "Feature"
            ? [geojson]
            : [];

      for (const feature of features) {
        const geom = feature.geometry;
        if (geom.type === "LineString" && geom.coordinates.length >= 2) {
          const coords = geom.coordinates;
          arcs.push({
            source: coords[0] as [number, number],
            target: coords[coords.length - 1] as [number, number],
            color,
            name: route.name || `${trip.title} flight`,
          });
        }
      }
    }
  }

  return arcs;
}

export function FlightArcs({ map, trips, transportColors }: FlightArcsProps) {
  const overlayRef = useRef<MapboxOverlay | null>(null);

  useEffect(() => {
    if (!map) return;

    const arcs = extractArcs(trips, transportColors);

    if (arcs.length === 0) {
      // Remove overlay if no arcs
      if (overlayRef.current) {
        map.removeControl(overlayRef.current as unknown as maplibregl.IControl);
        overlayRef.current = null;
      }
      return;
    }

    const arcLayer = new ArcLayer<ArcData>({
      id: "flight-arcs",
      data: arcs,
      getSourcePosition: (d) => d.source,
      getTargetPosition: (d) => d.target,
      getSourceColor: (d) => [...hexToRgb(d.color), 180],
      getTargetColor: (d) => [...hexToRgb(d.color), 180],
      getWidth: 2,
      greatCircle: true,
      pickable: true,
    });

    if (overlayRef.current) {
      overlayRef.current.setProps({ layers: [arcLayer] });
    } else {
      const overlay = new MapboxOverlay({
        layers: [arcLayer],
      });
      map.addControl(overlay as unknown as maplibregl.IControl);
      overlayRef.current = overlay;
    }

    return () => {
      if (overlayRef.current) {
        try {
          map.removeControl(overlayRef.current as unknown as maplibregl.IControl);
        } catch {
          // Map may already be destroyed
        }
        overlayRef.current = null;
      }
    };
  }, [map, trips, transportColors]);

  return null;
}
