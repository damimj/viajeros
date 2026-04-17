"use client";

import { useState, useMemo, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import type maplibregl from "maplibre-gl";
import { useMapData } from "@/hooks/use-map-data";
import { useMapSettings } from "@/hooks/use-map-settings";
import { useBrowserLanguageDetection } from "@/hooks/use-browser-language";
import { TravelMap } from "./travel-map";
import { FlightArcs } from "./flight-arcs";
import { MapSidebar } from "./map-sidebar";
import { LocaleSwitcher } from "@/components/shared/locale-switcher";

export function MapView() {
  const t = useTranslations("map");
  const searchParams = useSearchParams();
  const tripIdFromUrl = searchParams.get("trip_id");

  // Auto-detect browser language on first visit
  useBrowserLanguageDetection();

  const { trips, loading: dataLoading, error } = useMapData();
  const { settings, loading: settingsLoading } = useMapSettings();
  const [selectedTripId, setSelectedTripId] = useState<string | null>(tripIdFromUrl);
  const [mapInstance, setMapInstance] = useState<maplibregl.Map | null>(null);

  const loading = dataLoading || settingsLoading;

  const visibleTrips = useMemo(
    () => (selectedTripId ? trips.filter((t) => t.id === selectedTripId) : trips),
    [trips, selectedTripId],
  );

  const handleMapReady = useCallback((map: maplibregl.Map) => {
    setMapInstance(map);
  }, []);

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-100">
        <div className="rounded-lg border bg-white p-6 text-center shadow-sm">
          <p className="text-destructive">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      {loading ? (
        <div className="flex h-full items-center justify-center bg-slate-100">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>{t("allTrips")}</span>
          </div>
        </div>
      ) : (
        <>
          <TravelMap
            trips={trips}
            settings={settings}
            selectedTripId={selectedTripId}
            onMapReady={handleMapReady}
          />

          <FlightArcs
            map={mapInstance}
            trips={visibleTrips}
            transportColors={settings.transportColors}
          />

          <MapSidebar
            trips={trips}
            selectedTripId={selectedTripId}
            onSelectTrip={setSelectedTripId}
          />

          <div className="absolute bottom-4 left-4 z-10 flex gap-2">
            <LocaleSwitcher />
          </div>
        </>
      )}
    </div>
  );
}
