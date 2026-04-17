"use client";

import { useEffect, useRef } from "react";

/**
 * Flight arcs overlay using deck.gl.
 *
 * This component renders animated great-circle arcs for plane routes
 * on top of the MapLibre GL map.
 *
 * It dynamically imports deck.gl to avoid SSR issues.
 *
 * Usage:
 *   <FlightArcs mapInstance={mapRef.current} routes={planeRoutes} />
 */

interface FlightRoute {
  id: string;
  from: [number, number]; // [lng, lat]
  to: [number, number]; // [lng, lat]
  color: string;
  tripTitle: string;
}

interface FlightArcsProps {
  routes: FlightRoute[];
}

/**
 * Extract flight routes from GeoJSON features that are plane-type routes.
 */
export function extractFlightRoutes(features: GeoJSON.Feature[]): FlightRoute[] {
  const flights: FlightRoute[] = [];

  for (const feature of features) {
    if (feature.properties?.featureType !== "route") continue;
    if (feature.properties?.transportType !== "plane") continue;

    const geom = feature.geometry;
    let coords: number[][] = [];

    if (geom.type === "LineString") {
      coords = (geom as GeoJSON.LineString).coordinates;
    } else if (geom.type === "MultiLineString") {
      // Use first segment
      const multi = (geom as GeoJSON.MultiLineString).coordinates;
      if (multi.length > 0) coords = multi[0];
    }

    if (coords.length >= 2) {
      flights.push({
        id: feature.properties.id ?? `flight-${flights.length}`,
        from: coords[0] as [number, number],
        to: coords[coords.length - 1] as [number, number],
        color: feature.properties.color ?? "#FF4444",
        tripTitle: feature.properties.tripTitle ?? "",
      });
    }
  }

  return flights;
}

/**
 * Placeholder component for deck.gl arcs.
 *
 * Full deck.gl integration requires MapboxOverlay/MapLibreOverlay
 * which needs careful initialization with the map instance.
 * This will be fully wired in Phase 5 optimization pass.
 *
 * For now, plane routes render as regular MapLibre lines (from TravelMap component).
 * The extractFlightRoutes utility above is ready for Phase 5.
 */
export function FlightArcs({ routes }: FlightArcsProps) {
  // deck.gl overlay will be added here in Phase 5
  return null;
}
