import { DEFAULT_TRANSPORT_COLORS } from "@/lib/constants";
import type { AppSettings, Setting, TransportType } from "@/types/domain";

export function parseSettings(rows: Setting[]): AppSettings {
  const get = (key: string) => rows.find((r) => r.setting_key === key)?.setting_value ?? null;
  const num = (key: string, fallback: number) => {
    const v = get(key);
    return v !== null ? Number(v) : fallback;
  };
  const bool = (key: string, fallback: boolean) => {
    const v = get(key);
    return v !== null ? v === "true" : fallback;
  };

  const transportColors = { ...DEFAULT_TRANSPORT_COLORS };
  const transports: TransportType[] = ["plane", "ship", "car", "bike", "train", "walk", "bus", "aerial"];
  for (const t of transports) {
    const color = get(`transport_color_${t}`);
    if (color) transportColors[t] = color;
  }

  return {
    mapStyle: get("map_style") ?? "voyager",
    clusterEnabled: bool("map_cluster_enabled", true),
    clusterMaxRadius: num("map_cluster_max_radius", 30),
    clusterDisableAtZoom: num("map_cluster_disable_at_zoom", 15),
    transportColors,
    imageMaxWidth: num("image_max_width", 1920),
    imageMaxHeight: num("image_max_height", 1080),
    imageQuality: num("image_quality", 85),
    thumbnailMaxWidth: num("thumbnail_max_width", 400),
    thumbnailMaxHeight: num("thumbnail_max_height", 300),
    thumbnailQuality: num("thumbnail_quality", 80),
    maxUploadSize: num("max_upload_size", 8388608),
    siteTitle: get("site_title") ?? "Viajeros",
    siteDescription: get("site_description") ?? "",
    siteFavicon: get("site_favicon") ?? "",
    siteAnalyticsCode: get("site_analytics_code") ?? "",
    distanceUnit: (get("distance_unit") as "km" | "mi") ?? "km",
    defaultLanguage: get("default_language") ?? "en",
    tripTagsEnabled: bool("trip_tags_enabled", true),
    tripTimelineShowRoutes: bool("trip_timeline_show_routes", false),
  };
}
