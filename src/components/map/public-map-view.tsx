"use client";

import { useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { TravelMap } from "@/components/map/travel-map";
import { MapSidebar } from "@/components/map/map-sidebar";
import { PointPopup } from "@/components/map/point-popup";
import { LocaleSwitcher } from "@/components/shared/locale-switcher";
import { useMapData } from "@/hooks/use-map-data";
import { useSettings } from "@/hooks/use-settings";
import { Loader2 } from "lucide-react";

export function PublicMapView() {
  const t = useTranslations("map");
  const searchParams = useSearchParams();
  const tripIdParam = searchParams.get("trip_id");

  const { data, loading, error } = useMapData(tripIdParam);
  const { settings, loading: settingsLoading } = useSettings();

  const [selectedTripIds, setSelectedTripIds] = useState<Set<string> | null>(null);
  const [selectedPoint, setSelectedPoint] = useState<GeoJSON.Feature | null>(null);

  const handlePointClick = useCallback((feature: GeoJSON.Feature) => {
    setSelectedPoint(feature);
  }, []);

  const handleClosePopup = useCallback(() => {
    setSelectedPoint(null);
  }, []);

  if (loading || settingsLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-100">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>{t("allTrips")}</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-100">
        <p className="text-destructive">{error}</p>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      {/* Map */}
      <TravelMap
        styleKey={settings.mapStyle}
        features={data?.features ?? []}
        transportColors={settings.transportColors}
        clusterEnabled={settings.clusterEnabled}
        clusterRadius={settings.clusterMaxRadius}
        clusterMaxZoom={settings.clusterDisableAtZoom}
        selectedTripIds={selectedTripIds}
        onPointClick={handlePointClick}
      />

      {/* Sidebar */}
      {!tripIdParam && (
        <MapSidebar
          trips={data?.trips ?? []}
          selectedTripIds={selectedTripIds}
          onSelectionChange={setSelectedTripIds}
        />
      )}

      {/* Point popup */}
      {selectedPoint && (
        <PointPopup feature={selectedPoint} onClose={handleClosePopup} />
      )}

      {/* Locale switcher — bottom right */}
      <div className="fixed bottom-4 right-4 z-20 rounded-md border bg-background/90 p-2 shadow-md backdrop-blur">
        <LocaleSwitcher />
      </div>

      {/* Trip info when filtered by URL param */}
      {tripIdParam && data?.trips.length === 1 && (
        <div className="fixed left-4 top-4 z-20 rounded-md border bg-background/90 p-3 shadow-md backdrop-blur">
          <div className="flex items-center gap-2">
            <span
              className="inline-block h-3 w-3 rounded-full"
              style={{ backgroundColor: data.trips[0].color }}
            />
            <h2 className="font-semibold">{data.trips[0].title}</h2>
          </div>
          {data.trips[0].startDate && (
            <p className="mt-1 text-xs text-muted-foreground">
              {data.trips[0].startDate}
              {data.trips[0].endDate ? ` → ${data.trips[0].endDate}` : ""}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
