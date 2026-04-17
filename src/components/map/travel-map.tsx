"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import Supercluster from "supercluster";
import type { TripData, PointData } from "@/hooks/use-map-data";
import type { MapSettings } from "@/hooks/use-map-settings";

interface TravelMapProps {
  trips: TripData[];
  settings: MapSettings;
  selectedTripId: string | null;
  onMapReady?: (map: maplibregl.Map) => void;
}

function poiToFeature(
  poi: PointData,
  trip: TripData,
): Supercluster.PointFeature<{ poi: PointData; trip: TripData }> {
  return {
    type: "Feature",
    geometry: {
      type: "Point",
      coordinates: [Number(poi.longitude), Number(poi.latitude)],
    },
    properties: { poi, trip },
  };
}

export function TravelMap({ trips, settings, selectedTripId, onMapReady }: TravelMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const clusterRef = useRef<Supercluster<{ poi: PointData; trip: TripData }> | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const popupRef = useRef<maplibregl.Popup | null>(null);
  const [mapReady, setMapReady] = useState(false);

  const visibleTrips = selectedTripId
    ? trips.filter((t) => t.id === selectedTripId)
    : trips;

  // Initialize map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: settings.mapStyleUrl,
      center: [0, 20],
      zoom: 2,
      attributionControl: true,
    });

    map.addControl(new maplibregl.NavigationControl(), "top-right");

    map.on("load", () => {
      mapRef.current = map;
      setMapReady(true);
      onMapReady?.(map);
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [settings.mapStyleUrl]);

  // Build Supercluster index
  useEffect(() => {
    const points: Supercluster.PointFeature<{ poi: PointData; trip: TripData }>[] = [];
    for (const trip of visibleTrips) {
      for (const poi of trip.points_of_interest) {
        points.push(poiToFeature(poi, trip));
      }
    }

    const cluster = new Supercluster<{ poi: PointData; trip: TripData }>({
      radius: settings.clusterMaxRadius,
      maxZoom: settings.clusterDisableAtZoom,
    });
    cluster.load(points);
    clusterRef.current = cluster;
  }, [visibleTrips, settings.clusterMaxRadius, settings.clusterDisableAtZoom]);

  function showPopup(map: maplibregl.Map, lng: number, lat: number, poi: PointData, trip: TripData) {
    popupRef.current?.remove();

    const imgHtml = poi.image_path
      ? `<img src="${poi.image_path}" alt="${poi.title}" style="width:100%;max-height:160px;object-fit:cover;border-radius:8px 8px 0 0;" />`
      : "";
    const dateHtml = poi.visit_date
      ? `<div style="font-size:11px;color:#888;margin-top:4px;">${new Date(poi.visit_date).toLocaleDateString()}</div>`
      : "";

    const html = `
      <div style="min-width:200px;max-width:280px;">
        ${imgHtml}
        <div style="padding:10px;">
          <div style="font-size:14px;font-weight:600;">${poi.title}</div>
          <div style="font-size:12px;color:#666;margin-top:2px;">
            <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${trip.color_hex};margin-right:4px;vertical-align:middle;"></span>
            ${trip.title}
          </div>
          ${poi.description ? `<div style="font-size:12px;margin-top:6px;color:#444;">${poi.description}</div>` : ""}
          ${dateHtml}
          <div style="font-size:11px;color:#aaa;margin-top:4px;">${poi.type}</div>
        </div>
      </div>
    `;

    popupRef.current = new maplibregl.Popup({ closeButton: true, maxWidth: "300px", offset: 12 })
      .setLngLat([lng, lat])
      .setHTML(html)
      .addTo(map);
  }

  // Render markers/clusters
  const updateMarkers = useCallback(() => {
    const map = mapRef.current;
    const cluster = clusterRef.current;
    if (!map || !cluster) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    const bounds = map.getBounds();
    const zoom = Math.floor(map.getZoom());

    const items = settings.clusterEnabled
      ? cluster.getClusters([bounds.getWest(), bounds.getSouth(), bounds.getEast(), bounds.getNorth()], zoom)
      : visibleTrips.flatMap((trip) => trip.points_of_interest.map((poi) => poiToFeature(poi, trip)));

    for (const c of items) {
      const [lng, lat] = c.geometry.coordinates;
      const props = c.properties;

      if ("cluster" in props && props.cluster) {
        const count = props.point_count;
        const el = document.createElement("div");
        el.textContent = String(count);
        const size = count < 10 ? 32 : count < 100 ? 40 : 48;
        el.style.cssText = `width:${size}px;height:${size}px;background:hsl(222 47% 11%/0.85);color:white;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:600;border:2px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);cursor:pointer;`;
        el.addEventListener("click", () => {
          map.flyTo({
            center: [lng, lat],
            zoom: cluster.getClusterExpansionZoom(
              (c as Supercluster.ClusterFeature<{ poi: PointData; trip: TripData }>).id as number,
            ),
          });
        });
        markersRef.current.push(new maplibregl.Marker({ element: el }).setLngLat([lng, lat]).addTo(map));
      } else {
        const { poi, trip } = props as { poi: PointData; trip: TripData };
        const el = document.createElement("div");
        el.style.cssText = `width:14px;height:14px;background:${trip.color_hex};border-radius:50%;border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.3);cursor:pointer;`;
        el.addEventListener("click", () => showPopup(map, lng, lat, poi, trip));
        markersRef.current.push(new maplibregl.Marker({ element: el }).setLngLat([lng, lat]).addTo(map));
      }
    }
  }, [visibleTrips, settings.clusterEnabled, settings.clusterMaxRadius, settings.clusterDisableAtZoom]);

  // Render routes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;

    // Remove old route layers/sources
    const style = map.getStyle();
    (style?.layers ?? []).forEach((l) => { if (l.id.startsWith("route-")) map.removeLayer(l.id); });
    Object.keys(style?.sources ?? {}).forEach((s) => { if (s.startsWith("route-")) map.removeSource(s); });

    for (const trip of visibleTrips) {
      for (const route of trip.routes) {
        const sourceId = `route-${route.id}`;
        const layerId = `route-line-${route.id}`;
        const raw = route.geojson_data;
        let data: GeoJSON.FeatureCollection;

        if (raw.type === "FeatureCollection") data = raw as GeoJSON.FeatureCollection;
        else if (raw.type === "Feature") data = { type: "FeatureCollection", features: [raw as GeoJSON.Feature] };
        else continue;

        if (map.getSource(sourceId)) continue;
        map.addSource(sourceId, { type: "geojson", data });

        const color = route.color || settings.transportColors[route.transport_type] || trip.color_hex;
        const paint: maplibregl.LinePaint = {
          "line-color": color,
          "line-width": route.transport_type === "plane" ? 2 : 3,
          "line-opacity": 0.8,
        };
        if (route.transport_type === "plane") {
          (paint as Record<string, unknown>)["line-dasharray"] = [4, 4];
        }

        map.addLayer({ id: layerId, type: "line", source: sourceId, layout: { "line-join": "round", "line-cap": "round" }, paint });
      }
    }
  }, [visibleTrips, mapReady, settings.transportColors]);

  // Update markers on map move
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;
    updateMarkers();
    const handler = () => updateMarkers();
    map.on("moveend", handler);
    map.on("zoomend", handler);
    return () => { map.off("moveend", handler); map.off("zoomend", handler); };
  }, [mapReady, updateMarkers]);

  // Fit bounds
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady || visibleTrips.length === 0) return;

    const coords: [number, number][] = [];
    for (const trip of visibleTrips) {
      for (const poi of trip.points_of_interest) {
        coords.push([Number(poi.longitude), Number(poi.latitude)]);
      }
    }
    if (coords.length === 0) return;
    if (coords.length === 1) { map.flyTo({ center: coords[0], zoom: 12 }); return; }

    const bounds = new maplibregl.LngLatBounds(coords[0], coords[0]);
    coords.forEach((c) => bounds.extend(c));
    map.fitBounds(bounds, { padding: 60, maxZoom: 14 });
  }, [visibleTrips, mapReady]);

  return <div ref={containerRef} className="map-container" />;
}
