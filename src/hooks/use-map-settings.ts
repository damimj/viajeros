"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { parseSettings } from "@/lib/utils/parse-settings";
import { DEFAULT_TRANSPORT_COLORS } from "@/lib/constants";
import type { AppSettings, Setting } from "@/types/domain";

const DEFAULT_SETTINGS: AppSettings = {
  mapStyle: "voyager",
  clusterEnabled: true,
  clusterMaxRadius: 30,
  clusterDisableAtZoom: 15,
  transportColors: { ...DEFAULT_TRANSPORT_COLORS },
  imageMaxWidth: 1920,
  imageMaxHeight: 1080,
  imageQuality: 85,
  thumbnailMaxWidth: 400,
  thumbnailMaxHeight: 300,
  thumbnailQuality: 80,
  maxUploadSize: 8388608,
  siteTitle: "Viajeros",
  siteDescription: "",
  siteFavicon: "",
  siteAnalyticsCode: "",
  distanceUnit: "km",
  defaultLanguage: "en",
  tripTagsEnabled: true,
  tripTimelineShowRoutes: false,
};

export function useMapSettings() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    supabase
      .from("settings")
      .select("*")
      .then(({ data }) => {
        if (data) {
          setSettings(parseSettings(data as Setting[]));
        }
        setLoading(false);
      });
  }, []);

  return { settings, loading };
}
