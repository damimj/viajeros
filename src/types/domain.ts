export type TransportType = "plane" | "car" | "bike" | "walk" | "ship" | "train" | "bus" | "aerial";
export type TripStatus = "draft" | "published" | "planned";
export type PoiType = "stay" | "visit" | "food" | "waypoint";
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

export interface Trip {
  id: string;
  title: string;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
  color_hex: string;
  status: TripStatus;
  show_routes_in_timeline: boolean | null;
  created_at: string;
  updated_at: string;
  points?: PointOfInterest[];
  routes?: Route[];
  tags?: TripTag[];
}

export interface Route {
  id: string;
  trip_id: string;
  transport_type: TransportType;
  geojson_data: Record<string, unknown>;
  is_round_trip: boolean;
  distance_meters: number;
  color: string;
  name: string | null;
  description: string | null;
  image_path: string | null;
  start_datetime: string | null;
  end_datetime: string | null;
  created_at: string;
  updated_at: string;
}

export interface PointOfInterest {
  id: string;
  trip_id: string;
  title: string;
  description: string | null;
  type: PoiType;
  icon: string;
  image_path: string | null;
  latitude: number;
  longitude: number;
  visit_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface TripTag {
  id: string;
  trip_id: string;
  tag_name: string;
  created_at: string;
}

export interface Link {
  id: string;
  entity_type: "poi" | "route" | "trip";
  entity_id: string;
  link_type: LinkType;
  url: string;
  label: string | null;
  sort_order: number;
  created_at: string;
}

export interface Setting {
  id: string;
  setting_key: string;
  setting_value: string | null;
  setting_type: "string" | "number" | "boolean" | "json";
  description: string | null;
}

export interface AppSettings {
  mapStyle: string;
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
  maxUploadSize: number;
  siteTitle: string;
  siteDescription: string;
  siteFavicon: string;
  siteAnalyticsCode: string;
  distanceUnit: "km" | "mi";
  defaultLanguage: string;
  tripTagsEnabled: boolean;
  tripTimelineShowRoutes: boolean;
}
