import type { SupabaseClient } from "@supabase/supabase-js";
import type { AppSettings, TransportType } from "@/types/domain";

const DEFAULT_TRANSPORT_COLORS: Record<TransportType, string> = {
  plane: "#FF4444",
  car: "#4444FF",
  bike: "#b88907",
  walk: "#44FF44",
  ship: "#00AAAA",
  train: "#FF8800",
  bus: "#9C27B0",
  aerial: "#E91E63",
};

const DEFAULTS: AppSettings = {
  defaultLanguage: "en",
  mapStyle: "voyager",
  maxUploadSizeBytes: 8388608,
  sessionLifetimeSeconds: 86400,
  timezone: "UTC",
  clusterEnabled: true,
  clusterMaxRadius: 30,
  clusterDisableAtZoom: 15,
  transportColors: DEFAULT_TRANSPORT_COLORS,
  imageMaxWidth: 1920,
  imageMaxHeight: 1080,
  imageQuality: 85,
  thumbnailMaxWidth: 400,
  thumbnailMaxHeight: 300,
  thumbnailQuality: 80,
  siteTitle: "Viajeros",
  siteDescription: "Interactive travel diary with maps, routes, and points of interest.",
  siteFavicon: "",
  siteAnalyticsCode: "",
  tripTagsEnabled: true,
  distanceUnit: "km",
  tripTimelineShowRoutes: false,
};

/**
 * Fetch all settings rows and parse them into a typed AppSettings object.
 */
export async function getSettings(supabase: SupabaseClient): Promise<AppSettings> {
  const { data: rows, error } = await supabase
    .from("settings")
    .select("setting_key, setting_value, setting_type");

  if (error || !rows) return { ...DEFAULTS };

  const map = new Map<string, string>();
  for (const row of rows) {
    if (row.setting_value != null) {
      map.set(row.setting_key, row.setting_value);
    }
  }

  const str = (key: string, fallback: string) => map.get(key) ?? fallback;
  const num = (key: string, fallback: number) => {
    const v = map.get(key);
    return v != null ? Number(v) : fallback;
  };
  const bool = (key: string, fallback: boolean) => {
    const v = map.get(key);
    return v != null ? v === "true" : fallback;
  };

  // Build transport colors from individual keys
  const transportColors = { ...DEFAULT_TRANSPORT_COLORS };
  const transportTypes: TransportType[] = [
    "plane", "car", "bike", "walk", "ship", "train", "bus", "aerial",
  ];
  for (const t of transportTypes) {
    const color = map.get(`transport_color_${t}`);
    if (color) transportColors[t] = color;
  }

  return {
    defaultLanguage: str("default_language", DEFAULTS.defaultLanguage) as "en" | "es",
    mapStyle: str("map_style", DEFAULTS.mapStyle) as AppSettings["mapStyle"],
    maxUploadSizeBytes: num("max_upload_size", DEFAULTS.maxUploadSizeBytes),
    sessionLifetimeSeconds: num("session_lifetime", DEFAULTS.sessionLifetimeSeconds),
    timezone: str("timezone", DEFAULTS.timezone),
    clusterEnabled: bool("map_cluster_enabled", DEFAULTS.clusterEnabled),
    clusterMaxRadius: num("map_cluster_max_radius", DEFAULTS.clusterMaxRadius),
    clusterDisableAtZoom: num("map_cluster_disable_at_zoom", DEFAULTS.clusterDisableAtZoom),
    transportColors,
    imageMaxWidth: num("image_max_width", DEFAULTS.imageMaxWidth),
    imageMaxHeight: num("image_max_height", DEFAULTS.imageMaxHeight),
    imageQuality: num("image_quality", DEFAULTS.imageQuality),
    thumbnailMaxWidth: num("thumbnail_max_width", DEFAULTS.thumbnailMaxWidth),
    thumbnailMaxHeight: num("thumbnail_max_height", DEFAULTS.thumbnailMaxHeight),
    thumbnailQuality: num("thumbnail_quality", DEFAULTS.thumbnailQuality),
    siteTitle: str("site_title", DEFAULTS.siteTitle),
    siteDescription: str("site_description", DEFAULTS.siteDescription),
    siteFavicon: str("site_favicon", DEFAULTS.siteFavicon),
    siteAnalyticsCode: str("site_analytics_code", DEFAULTS.siteAnalyticsCode),
    tripTagsEnabled: bool("trip_tags_enabled", DEFAULTS.tripTagsEnabled),
    distanceUnit: str("distance_unit", DEFAULTS.distanceUnit) as AppSettings["distanceUnit"],
    tripTimelineShowRoutes: bool("trip_timeline_show_routes", DEFAULTS.tripTimelineShowRoutes),
  };
}

/**
 * Update a single setting by key.
 */
export async function updateSetting(
  supabase: SupabaseClient,
  key: string,
  value: string,
) {
  const { error } = await supabase
    .from("settings")
    .update({ setting_value: value })
    .eq("setting_key", key);

  if (error) throw error;
}

/**
 * Update multiple settings at once.
 */
export async function updateSettings(
  supabase: SupabaseClient,
  settings: Record<string, string>,
) {
  const promises = Object.entries(settings).map(([key, value]) =>
    supabase
      .from("settings")
      .update({ setting_value: value })
      .eq("setting_key", key),
  );

  const results = await Promise.all(promises);
  const failed = results.find((r) => r.error);
  if (failed?.error) throw failed.error;
}
