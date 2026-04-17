"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { MAP_STYLES } from "@/lib/constants";
import type { MapStyle } from "@/types/domain";

interface TravelMapProps {
  styleKey: MapStyle;
  features: GeoJSON.Feature[];
  transportColors: Record<string, string>;
  clusterEnabled: boolean;
  clusterRadius: number;
  clusterMaxZoom: number;
  selectedTripIds: Set<string> | null;
  onPointClick?: (feature: GeoJSON.Feature) => void;
}

export function TravelMap({
  styleKey,
  features,
  transportColors,
  clusterEnabled,
  clusterRadius,
  clusterMaxZoom,
  selectedTripIds,
  onPointClick,
}: TravelMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [mapReady, setMapReady] = useState(false);

  // Filter features by selected trips
  const filteredFeatures = selectedTripIds
    ? features.filter((f) => selectedTripIds.has(f.properties?.tripId))
    : features;

  const pointFeatures = filteredFeatures.filter(
    (f) => f.properties?.featureType === "point",
  );
  const routeFeatures = filteredFeatures.filter(
    (f) => f.properties?.featureType === "route",
  );

  // Initialize map
  useEffect(() => {
    if (!containerRef.current) return;

    const styleUrl = MAP_STYLES[styleKey]?.url ?? MAP_STYLES.voyager.url;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: styleUrl,
      center: [0, 20],
      zoom: 2,
      attributionControl: true,
    });

    map.addControl(new maplibregl.NavigationControl(), "top-right");
    map.addControl(
      new maplibregl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: false,
      }),
      "top-right",
    );

    map.on("load", () => {
      mapRef.current = map;
      setMapReady(true);
    });

    return () => {
      mapRef.current = null;
      setMapReady(false);
      map.remove();
    };
  }, [styleKey]);

  // Update route layers
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;

    // Remove old route layers/sources
    const existingLayers = map.getStyle().layers ?? [];
    for (const layer of existingLayers) {
      if (layer.id.startsWith("route-")) {
        map.removeLayer(layer.id);
      }
    }
    for (const sourceId of Object.keys(map.getStyle().sources ?? {})) {
      if (sourceId.startsWith("route-")) {
        map.removeSource(sourceId);
      }
    }

    // Add route features individually for per-route coloring
    routeFeatures.forEach((feature, i) => {
      const sourceId = `route-${i}`;
      const color =
        feature.properties?.color ??
        transportColors[feature.properties?.transportType] ??
        "#3388ff";

      map.addSource(sourceId, {
        type: "geojson",
        data: feature,
      });

      map.addLayer({
        id: sourceId,
        type: "line",
        source: sourceId,
        paint: {
          "line-color": color,
          "line-width": 3,
          "line-opacity": 0.8,
        },
        layout: {
          "line-cap": "round",
          "line-join": "round",
        },
      });
    });
  }, [routeFeatures, transportColors, mapReady]);

  // Update point layers with clustering
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;

    // Remove existing point layers
    const layersToRemove = ["clusters", "cluster-count", "unclustered-point"];
    for (const id of layersToRemove) {
      if (map.getLayer(id)) map.removeLayer(id);
    }
    if (map.getSource("points")) map.removeSource("points");

    if (pointFeatures.length === 0) return;

    const geojsonSource: GeoJSON.FeatureCollection = {
      type: "FeatureCollection",
      features: pointFeatures,
    };

    map.addSource("points", {
      type: "geojson",
      data: geojsonSource,
      cluster: clusterEnabled,
      clusterRadius: clusterRadius,
      clusterMaxZoom: clusterMaxZoom,
    });

    if (clusterEnabled) {
      // Cluster circles
      map.addLayer({
        id: "clusters",
        type: "circle",
        source: "points",
        filter: ["has", "point_count"],
        paint: {
          "circle-color": [
            "step",
            ["get", "point_count"],
            "#51bbd6",
            10,
            "#f1f075",
            30,
            "#f28cb1",
          ],
          "circle-radius": [
            "step",
            ["get", "point_count"],
            18,
            10,
            24,
            30,
            32,
          ],
          "circle-stroke-width": 2,
          "circle-stroke-color": "#fff",
        },
      });

      // Cluster count labels
      map.addLayer({
        id: "cluster-count",
        type: "symbol",
        source: "points",
        filter: ["has", "point_count"],
        layout: {
          "text-field": "{point_count_abbreviated}",
          "text-font": ["Open Sans Bold"],
          "text-size": 12,
        },
        paint: {
          "text-color": "#333",
        },
      });
    }

    // Individual points
    map.addLayer({
      id: "unclustered-point",
      type: "circle",
      source: "points",
      filter: clusterEnabled ? ["!", ["has", "point_count"]] : ["all"],
      paint: {
        "circle-color": ["coalesce", ["get", "tripColor"], "#3388ff"],
        "circle-radius": 8,
        "circle-stroke-width": 2,
        "circle-stroke-color": "#fff",
      },
    });

    // Click handlers
    if (clusterEnabled) {
      map.on("click", "clusters", (e) => {
        const features = map.queryRenderedFeatures(e.point, { layers: ["clusters"] });
        if (!features.length) return;
        const clusterId = features[0].properties?.cluster_id;
        const source = map.getSource("points") as maplibregl.GeoJSONSource;
        source.getClusterExpansionZoom(clusterId).then((zoom) => {
          map.easeTo({
            center: (features[0].geometry as GeoJSON.Point).coordinates as [number, number],
            zoom,
          });
        });
      });
    }

    map.on("click", "unclustered-point", (e) => {
      const feature = e.features?.[0];
      if (feature && onPointClick) {
        onPointClick(feature);
      }
    });

    // Cursor
    map.on("mouseenter", "unclustered-point", () => {
      map.getCanvas().style.cursor = "pointer";
    });
    map.on("mouseleave", "unclustered-point", () => {
      map.getCanvas().style.cursor = "";
    });
    if (clusterEnabled) {
      map.on("mouseenter", "clusters", () => {
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", "clusters", () => {
        map.getCanvas().style.cursor = "";
      });
    }

    // Fit bounds to all points
    if (pointFeatures.length > 0) {
      const bounds = new maplibregl.LngLatBounds();
      pointFeatures.forEach((f) => {
        const coords = (f.geometry as GeoJSON.Point).coordinates;
        bounds.extend(coords as [number, number]);
      });
      // Also include route features
      routeFeatures.forEach((f) => {
        const geom = f.geometry;
        if (geom.type === "LineString") {
          (geom as GeoJSON.LineString).coordinates.forEach((c) =>
            bounds.extend(c as [number, number]),
          );
        } else if (geom.type === "MultiLineString") {
          (geom as GeoJSON.MultiLineString).coordinates.forEach((line) =>
            line.forEach((c) => bounds.extend(c as [number, number])),
          );
        }
      });

      if (!bounds.isEmpty()) {
        map.fitBounds(bounds, { padding: 60, maxZoom: 12 });
      }
    }
  }, [
    pointFeatures,
    clusterEnabled,
    clusterRadius,
    clusterMaxZoom,
    mapReady,
    onPointClick,
  ]);

  return <div ref={containerRef} className="map-container" />;
}
