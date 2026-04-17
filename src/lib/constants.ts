import type { TransportType } from "@/types/domain";

export const MAP_STYLES: Record<string, string> = {
  voyager: "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json",
  positron: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
  "dark-matter": "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
  "osm-liberty": "https://maputnik.github.io/osm-liberty/style.json",
};

export const DEFAULT_TRANSPORT_COLORS: Record<TransportType, string> = {
  plane: "#FF4444",
  ship: "#00AAAA",
  car: "#4444FF",
  bike: "#b88907",
  train: "#FF8800",
  walk: "#44FF44",
  bus: "#9C27B0",
  aerial: "#E91E63",
};

export const TRANSPORT_TYPES: TransportType[] = [
  "plane",
  "car",
  "bike",
  "walk",
  "ship",
  "train",
  "bus",
  "aerial",
];

export const POI_TYPES = ["stay", "visit", "food", "waypoint"] as const;

export const LINK_TYPES = [
  "website",
  "google_maps",
  "instagram",
  "facebook",
  "twitter",
  "tripadvisor",
  "booking",
  "airbnb",
  "youtube",
  "wikipedia",
  "google_photos",
  "other",
] as const;

export const TRIP_STATUSES = ["draft", "published", "planned"] as const;
