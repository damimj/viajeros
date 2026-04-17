"use client";

import { useEffect, useRef } from "react";
import type maplibregl from "maplibre-gl";
import type { Trip, TransportType } from "@/types/domain";

interface FlightArcsProps {
  map: maplibregl.Map | null;
  trips: Trip[];
  transportColors: Record<TransportType, string>;
}

// deck.gl is loaded dynamically to avoid SSR issues
export function FlightArcs({ map, trips, transportColors }: FlightArcsProps) {
  const deckRef = useRef<unknown>(null);

  useEffect(() => {
    if (!map) return;

    let cancelled = false;

    async function initDeck() {
      try {
        const [{ Deck }, { ArcLayer }, { MapboxOverlay }] = await Promise.all([
          import("@deck.gl/core"),
          import("@deck.gl/layers"),
          import("@deck.gl/mapbox"),
        ]);

        if (cancelled) return;

        const arcData: {
          from: [number, number];
          to: [number, number];
          color: number[];
        }[] = [];

        trips.forEach((trip) => {
          (trip.routes ?? [])
            .filter((r) => r.transport_type === "plane")
            .forEach((route) => {
              const gj = route.geojson_data as {
                type: string;
                coordinates?: number[][];
                features?: Array<{ geometry: { coordinates: number[][] } }>;
              };

              let coords: number[][] = [];
              if (gj.type === "LineString") {
                coords = gj.coordinates ?? [];
              } else if (gj.type === "FeatureCollection") {
                const feat = gj.features?.[0];
                coords = feat?.geometry?.coordinates ?? [];
              } else if (gj.type === "Feature") {
                const feat = gj as unknown as { geometry: { coordinates: number[][] } };
                coords = feat?.geometry?.coordinates ?? [];
              }

              if (coords.length >= 2) {
                const color = transportColors["plane"] ?? "#FF4444";
                const rgb = hexToRgb(color);
                arcData.push({
                  from: [coords[0][0], coords[0][1]],
                  to: [coords[coords.length - 1][0], coords[coords.length - 1][1]],
                  color: rgb,
                });
              }
            });
        });

        if (!arcData.length) return;

        const overlay = new MapboxOverlay({
          layers: [
            new ArcLayer({
              id: "flight-arcs",
              data: arcData,
              getSourcePosition: (d) => d.from,
              getTargetPosition: (d) => d.to,
              getSourceColor: (d: typeof arcData[number]): [number,number,number,number] => [d.color[0], d.color[1], d.color[2], 180],
              getTargetColor: (d: typeof arcData[number]): [number,number,number,number] => [d.color[0], d.color[1], d.color[2], 180],
              getWidth: 1.5,
              greatCircle: true,
            }),
          ],
        });

        (map as unknown as { addControl: (o: unknown) => void }).addControl(overlay);
        deckRef.current = overlay;
      } catch {
        // deck.gl failed to load — non-critical
      }
    }

    initDeck();
    return () => {
      cancelled = true;
      if (deckRef.current) {
        try {
          (map as unknown as { removeControl: (o: unknown) => void }).removeControl(
            deckRef.current,
          );
        } catch {
          // ignore
        }
        deckRef.current = null;
      }
    };
  }, [map, trips, transportColors]);

  return null;
}

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace("#", "");
  const bigint = parseInt(clean, 16);
  return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
}
