"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { getSettings } from "@/lib/models/settings";
import type { AppSettings } from "@/types/domain";

const DEFAULTS: AppSettings = {
  defaultLanguage: "en",
  mapStyle: "voyager",
  maxUploadSizeBytes: 8388608,
  sessionLifetimeSeconds: 86400,
  timezone: "UTC",
  clusterEnabled: true,
  clusterMaxRadius: 30,
  clusterDisableAtZoom: 15,
  transportColors: {
    plane: "#FF4444",
    car: "#4444FF",
    bike: "#b88907",
    walk: "#44FF44",
    ship: "#00AAAA",
    train: "#FF8800",
    bus: "#9C27B0",
    aerial: "#E91E63",
  },
  imageMaxWidth: 1920,
  imageMaxHeight: 1080,
  imageQuality: 85,
  thumbnailMaxWidth: 400,
  thumbnailMaxHeight: 300,
  thumbnailQuality: 80,
  siteTitle: "Viajeros",
  siteDescription: "",
  siteFavicon: "",
  siteAnalyticsCode: "",
  tripTagsEnabled: true,
  distanceUnit: "km",
  tripTimelineShowRoutes: false,
};

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULTS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const supabase = createClient();
        const s = await getSettings(supabase);
        setSettings(s);
      } catch {
        // Use defaults on error
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return { settings, loading };
}
