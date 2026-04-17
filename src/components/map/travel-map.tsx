"use client";

import { useEffect, useRef, useCallback } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import Supercluster from "supercluster";
import type { Trip, PointOfInterest } from "@/types/domain";
import type { AppSettings } from "@/types/domain";
import { MAP_STYLES } from "@/lib/constants";

interface TravelMapProps {
  trips: Trip[];
  settings: AppSettings;
  selectedTripId: string | null;
  onMapReady: (map: maplibregl.Map) => void;
}

const POI_COLORS: Record<string, string> = {
  stay: "#3B82F6",
  visit: "#10B981",
  food: "#F59E0B",
  waypoint: "#8B5CF6",
};

export function TravelMap({ trips, settings, selectedTripId, onMapReady }: TravelMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const clusterRef = useRef<Supercluster | null>(null);

  const getMapStyle = useCallback(() => {
    return MAP_STYLES[settings.mapStyle] ?? MAP_STYLES["voyager"];
  }, [settings.mapStyle]);

  const clearMarkers = useCallback(() => {
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];
  }, []);

  const renderMarkers = useCallback(
    (map: maplibregl.Map) => {
      clearMarkers();

      const visibleTrips = selectedTripId
        ? trips.filter((t) => t.id === selectedTripId)
        : trips;

      const allPoints: PointOfInterest[] = visibleTrips.flatMap((t) => t.points ?? []);

      if (!settings.clusterEnabled) {
        allPoints.forEach((poi) => {
          const el = document.createElement("div");
          el.className = "map-marker";
          el.style.cssText = `
            width: 12px; height: 12px;
            border-radius: 50%;
            background: ${POI_COLORS[poi.type] ?? "#6B7280"};
            border: 2px solid white;
            cursor: pointer;
            box-shadow: 0 1px 4px rgba(0,0,0,0.3);
          `;

          const popup = new maplibregl.Popup({ offset: 12, maxWidth: "280px" }).setHTML(`
            <div style="padding:12px;font-family:inherit">
              <strong style="display:block;margin-bottom:4px;font-size:14px">${poi.title}</strong>
              ${poi.description ? `<p style="font-size:12px;color:#6B7280;margin:0">${poi.description}</p>` : ""}
              ${poi.visit_date ? `<p style="font-size:11px;color:#9CA3AF;margin:4px 0 0">${new Date(poi.visit_date).toLocaleDateString()}</p>` : ""}
            </div>
          `);

          const marker = new maplibregl.Marker({ element: el })
            .setLngLat([poi.longitude, poi.latitude])
            .setPopup(popup)
            .addTo(map);

          markersRef.current.push(marker);
        });
        return;
      }

      // Use Supercluster
      const sc = new Supercluster({
        radius: settings.clusterMaxRadius,
        maxZoom: settings.clusterDisableAtZoom,
      });
      clusterRef.current = sc;

      sc.load(
        allPoints.map((poi) => ({
          type: "Feature" as const,
          geometry: { type: "Point" as const, coordinates: [poi.longitude, poi.latitude] },
          properties: { poi },
        })),
      );

      const updateClusters = () => {
        clearMarkers();
        const zoom = Math.floor(map.getZoom());
        const bounds = map.getBounds();
        const clusters = sc.getClusters(
          [bounds.getWest(), bounds.getSouth(), bounds.getEast(), bounds.getNorth()],
          zoom,
        );

        clusters.forEach((cluster) => {
          const [lng, lat] = cluster.geometry.coordinates;
          const isCluster = cluster.properties.cluster;

          const el = document.createElement("div");

          if (isCluster) {
            const count = cluster.properties.point_count;
            el.style.cssText = `
              width: ${Math.min(20 + count * 2, 44)}px;
              height: ${Math.min(20 + count * 2, 44)}px;
              border-radius: 50%;
              background: rgba(59,130,246,0.85);
              border: 2px solid white;
              color: white;
              font-size: 12px;
              font-weight: 600;
              display: flex;
              align-items: center;
              justify-content: center;
              cursor: pointer;
              box-shadow: 0 1px 4px rgba(0,0,0,0.3);
            `;
            el.textContent = String(count);
            el.addEventListener("click", () => {
              const zoomTo = sc.getClusterExpansionZoom(cluster.properties.cluster_id as number);
              map.flyTo({ center: [lng, lat], zoom: zoomTo });
            });
          } else {
            const poi = cluster.properties.poi as PointOfInterest;
            el.style.cssText = `
              width: 12px; height: 12px;
              border-radius: 50%;
              background: ${POI_COLORS[poi.type] ?? "#6B7280"};
              border: 2px solid white;
              cursor: pointer;
              box-shadow: 0 1px 4px rgba(0,0,0,0.3);
            `;

            const popup = new maplibregl.Popup({ offset: 12, maxWidth: "280px" }).setHTML(`
              <div style="padding:12px;font-family:inherit">
                <strong style="display:block;margin-bottom:4px;font-size:14px">${poi.title}</strong>
                ${poi.description ? `<p style="font-size:12px;color:#6B7280;margin:0">${poi.description}</p>` : ""}
                ${poi.visit_date ? `<p style="font-size:11px;color:#9CA3AF;margin:4px 0 0">${new Date(poi.visit_date).toLocaleDateString()}</p>` : ""}
              </div>
            `);

            const marker = new maplibregl.Marker({ element: el })
              .setLngLat([lng, lat])
              .setPopup(popup)
              .addTo(map);
            markersRef.current.push(marker);
            return;
          }

          const marker = new maplibregl.Marker({ element: el })
            .setLngLat([lng, lat])
            .addTo(map);
          markersRef.current.push(marker);
        });
      };

      updateClusters();
      map.on("moveend", updateClusters);
      map.on("zoomend", updateClusters);
    },
    [trips, settings, selectedTripId, clearMarkers],
  );

  const renderRoutes = useCallback(
    (map: maplibregl.Map) => {
      // Remove existing route sources/layers
      const existingLayers = map.getStyle()?.layers ?? [];
      existingLayers.forEach((layer) => {
        if (layer.id.startsWith("route-")) {
          if (map.getLayer(layer.id)) map.removeLayer(layer.id);
        }
      });
      const sources = Object.keys(map.getStyle()?.sources ?? {});
      sources.forEach((id) => {
        if (id.startsWith("route-")) map.removeSource(id);
      });

      const visibleTrips = selectedTripId
        ? trips.filter((t) => t.id === selectedTripId)
        : trips;

      visibleTrips.forEach((trip) => {
        (trip.routes ?? []).forEach((route) => {
          const sourceId = `route-${route.id}`;
          if (map.getSource(sourceId)) return;

          const color =
            settings.transportColors[route.transport_type] ?? route.color ?? "#3388ff";

          map.addSource(sourceId, {
            type: "geojson",
            data: route.geojson_data as Parameters<typeof map.addSource>[1] extends { data: infer D } ? D : never,
          });

          map.addLayer({
            id: `${sourceId}-line`,
            type: "line",
            source: sourceId,
            layout: { "line-join": "round", "line-cap": "round" },
            paint: {
              "line-color": color,
              "line-width": route.transport_type === "plane" ? 1.5 : 3,
              "line-dasharray": route.transport_type === "plane" ? [2, 2] : [1],
              "line-opacity": 0.8,
            },
          });
        });
      });
    },
    [trips, settings, selectedTripId],
  );

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: getMapStyle(),
      center: [0, 20],
      zoom: 2,
      attributionControl: false,
    });

    map.addControl(new maplibregl.NavigationControl(), "top-right");
    map.addControl(
      new maplibregl.AttributionControl({ compact: true }),
      "bottom-right",
    );

    map.on("load", () => {
      mapRef.current = map;
      renderMarkers(map);
      renderRoutes(map);
      onMapReady(map);
    });

    return () => {
      clearMarkers();
      map.remove();
      mapRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Re-render when trips/selection changes
  useEffect(() => {
    if (!mapRef.current) return;
    renderMarkers(mapRef.current);
    renderRoutes(mapRef.current);
  }, [trips, selectedTripId, settings, renderMarkers, renderRoutes]);

  return <div ref={mapContainer} className="h-full w-full" />;
}
