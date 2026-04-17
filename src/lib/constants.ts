import type { MapStyle, TransportType } from "@/types/domain";

/**
 * Free map tile styles — same options as the original TravelMap.
 * All are self-hostable or free-tier compatible.
 */
export const MAP_STYLES: Record<MapStyle, { label: string; url: string }> = {
  positron: {
    label: "Positron (Light)",
    url: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
  },
  voyager: {
    label: "Voyager (Colorful)",
    url: "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json",
  },
  "dark-matter": {
    label: "Dark Matter",
    url: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
  },
  "osm-liberty": {
    label: "OSM Liberty",
    url: "https://demotiles.maplibre.org/style.json",
  },
};

/**
 * Default transport colors — same as original TravelMap database.sql seed.
 */
export const DEFAULT_TRANSPORT_COLORS: Record<TransportType, string> = {
  plane: "#FF4444",
  car: "#4444FF",
  bike: "#b88907",
  walk: "#44FF44",
  ship: "#00AAAA",
  train: "#FF8800",
  bus: "#9C27B0",
  aerial: "#E91E63",
};

/**
 * All available transport types.
 */
export const TRANSPORT_TYPES: TransportType[] = [
  "plane", "car", "bike", "walk", "ship", "train", "bus", "aerial",
];
