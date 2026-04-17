"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { MAP_STYLES, DEFAULT_TRANSPORT_COLORS } from "@/lib/constants";
import type { MapStyle, TransportType } from "@/types/domain";

export interface MapSettings {
  mapStyleUrl: string;
  mapStyle: MapStyle;
  clusterEnabled: boolean;
  clusterMaxRadius: number;
  clusterDisableAtZoom: number;
  transportColors: Record<string, string>;
  siteTitle: string;
}

const DEFAULTS: MapSettings = {
  mapStyleUrl: MAP_STYLES.voyager.url,
  mapStyle: "voyager",
  clusterEnabled: true,
  clusterMaxRadius: 30,
  clusterDisableAtZoom: 15,
  transportColors: DEFAULT_TRANSPORT_COLORS,
  siteTitle: "Viajeros",
};

export function useMapSettings() {
  const [settings, setSettings] = useState<MapSettings>(DEFAULTS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const supabase = createClient();
        const { data } = await supabase
          .from("settings")
          .select("setting_key, setting_value");

        if (!data) return;

        const map = new Map<string, string>();
        data.forEach((r: { setting_key: string; setting_value: string | null }) => {
          if (r.setting_value != null) map.set(r.setting_key, r.setting_value);
        });

        const style = (map.get("map_style") ?? "voyager") as MapStyle;
        const transportColors: Record<string, string> = { ...DEFAULT_TRANSPORT_COLORS };
        const types: TransportType[] = ["plane", "car", "bike", "walk", "ship", "train", "bus", "aerial"];
        for (const t of types) {
          const c = map.get(`transport_color_${t}`);
          if (c) transportColors[t] = c;
        }

        setSettings({
          mapStyleUrl: MAP_STYLES[style]?.url ?? MAP_STYLES.voyager.url,
          mapStyle: style,
          clusterEnabled: map.get("map_cluster_enabled") !== "false",
          clusterMaxRadius: Number(map.get("map_cluster_max_radius") ?? 30),
          clusterDisableAtZoom: Number(map.get("map_cluster_disable_at_zoom") ?? 15),
          transportColors,
          siteTitle: map.get("site_title") ?? "Viajeros",
        });
      } catch (e) {
        console.error("Failed to load map settings:", e);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  return { settings, loading };
}
