/**
 * Domain types — mirror the Viajeros database schema.
 * These are independent of the Supabase-generated row types and used
 * throughout the UI, model helpers, and API responses.
 */

// --- Enums ---

export type TransportType =
  | "plane"
  | "car"
  | "bike"
  | "walk"
  | "ship"
  | "train"
  | "bus"
  | "aerial";

export type TripStatus = "draft" | "published" | "planned";

export type PointType = "stay" | "visit" | "food" | "waypoint";

export type MapStyle = "positron" | "voyager" | "dark-matter" | "osm-liberty";

export type DistanceUnit = "km" | "mi";

export type LinkEntityType = "poi" | "route" | "trip";

export type LinkType =
  | "website"
  | "google_maps"
  | "instagram"
  | "facebook"
  | "twitter"
  | "tripadvisor"
  | "booking"
  | "airbnb"
  | "youtube"
  | "wikipedia"
  | "google_photos"
  | "other";

// --- Core entities ---

export interface Trip {
  id: string;
  title: string;
  description: string | null;
  startDate: string | null;
  endDate: string | null;
  colorHex: string;
  status: TripStatus;
  showRoutesInTimeline: boolean | null;
  createdAt: string;
  updatedAt: string;
  // Joined data (optional, populated by queries)
  tags?: TripTag[];
  points?: PointOfInterest[];
  routes?: Route[];
  links?: Link[];
}

export interface Route {
  id: string;
  tripId: string;
  transportType: TransportType;
  geojsonData: GeoJSON.Feature | GeoJSON.FeatureCollection;
  isRoundTrip: boolean;
  distanceMeters: number;
  color: string;
  name: string | null;
  description: string | null;
  imagePath: string | null;
  startDatetime: string | null;
  endDatetime: string | null;
  createdAt: string;
  updatedAt: string;
  links?: Link[];
}

export interface PointOfInterest {
  id: string;
  tripId: string;
  title: string;
  description: string | null;
  type: PointType;
  icon: string;
  imagePath: string | null;
  latitude: number;
  longitude: number;
  visitDate: string | null;
  createdAt: string;
  updatedAt: string;
  links?: Link[];
}

export interface TripTag {
  id: string;
  tripId: string;
  tagName: string;
  createdAt: string;
}

export interface Link {
  id: string;
  entityType: LinkEntityType;
  entityId: string;
  linkType: LinkType;
  url: string;
  label: string | null;
  sortOrder: number;
  createdAt: string;
}

export interface GeocodeCache {
  id: string;
  latitude: number;
  longitude: number;
  city: string;
  displayName: string | null;
  country: string | null;
  createdAt: string;
  expiresAt: string | null;
}

// --- Settings ---

export interface SettingRow {
  id: string;
  settingKey: string;
  settingValue: string | null;
  settingType: "string" | "number" | "boolean" | "json";
  description: string | null;
}

/**
 * Parsed app settings derived from the settings table rows.
 */
export interface AppSettings {
  defaultLanguage: "en" | "es";
  mapStyle: MapStyle;
  maxUploadSizeBytes: number;
  sessionLifetimeSeconds: number;
  timezone: string;
  clusterEnabled: boolean;
  clusterMaxRadius: number;
  clusterDisableAtZoom: number;
  transportColors: Record<TransportType, string>;
  imageMaxWidth: number;
  imageMaxHeight: number;
  imageQuality: number;
  thumbnailMaxWidth: number;
  thumbnailMaxHeight: number;
  thumbnailQuality: number;
  siteTitle: string;
  siteDescription: string;
  siteFavicon: string;
  siteAnalyticsCode: string;
  tripTagsEnabled: boolean;
  distanceUnit: DistanceUnit;
  tripTimelineShowRoutes: boolean;
}

// --- Utility ---

/**
 * Convert snake_case DB row to camelCase domain object.
 */
export function snakeToCamel<T extends Record<string, unknown>>(
  row: Record<string, unknown>,
): T {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(row)) {
    const camelKey = key.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
    result[camelKey] = value;
  }
  return result as T;
}
