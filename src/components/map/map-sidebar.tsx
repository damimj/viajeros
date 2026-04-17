"use client";

import { useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import type { TripData } from "@/hooks/use-map-data";

interface MapSidebarProps {
  trips: TripData[];
  selectedTripId: string | null;
  onSelectTrip: (id: string | null) => void;
}

export function MapSidebar({ trips, selectedTripId, onSelectTrip }: MapSidebarProps) {
  const t = useTranslations("map");
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute left-0 top-1/2 z-20 -translate-y-1/2 rounded-r-md border border-l-0 bg-white/90 p-1.5 shadow-md backdrop-blur-sm transition-transform"
        style={{ transform: collapsed ? "translateX(0) translateY(-50%)" : "translateX(320px) translateY(-50%)" }}
      >
        {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </button>

      {/* Sidebar panel */}
      <div
        className={`absolute left-0 top-0 z-10 h-full w-80 overflow-y-auto bg-white/95 shadow-lg backdrop-blur-sm transition-transform ${
          collapsed ? "-translate-x-full" : "translate-x-0"
        }`}
      >
        <div className="p-4">
          <h2 className="mb-1 text-lg font-bold">{t("filterTrips")}</h2>

          {/* Show all button */}
          <button
            onClick={() => onSelectTrip(null)}
            className={`mb-3 w-full rounded-md px-3 py-2 text-left text-sm font-medium transition-colors ${
              selectedTripId === null
                ? "bg-primary text-primary-foreground"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {t("allTrips")} ({trips.length})
          </button>

          {/* Trip list */}
          <div className="space-y-1">
            {trips.map((trip) => {
              const isSelected = selectedTripId === trip.id;
              const pointCount = trip.points_of_interest.length;
              const routeCount = trip.routes.length;
              const tags = trip.trip_tags ?? [];

              return (
                <button
                  key={trip.id}
                  onClick={() => onSelectTrip(isSelected ? null : trip.id)}
                  className={`w-full rounded-md px-3 py-2.5 text-left transition-colors ${
                    isSelected
                      ? "bg-primary/10 ring-1 ring-primary/30"
                      : "hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="inline-block h-3 w-3 flex-shrink-0 rounded-full"
                      style={{ backgroundColor: trip.color_hex }}
                    />
                    <span className="text-sm font-medium leading-tight">{trip.title}</span>
                  </div>

                  {/* Date range */}
                  {(trip.start_date || trip.end_date) && (
                    <div className="ml-5 mt-0.5 text-xs text-muted-foreground">
                      {trip.start_date ?? "?"} → {trip.end_date ?? "?"}
                    </div>
                  )}

                  {/* Counts */}
                  <div className="ml-5 mt-1 flex gap-2 text-xs text-muted-foreground">
                    {pointCount > 0 && <span>{pointCount} pts</span>}
                    {routeCount > 0 && <span>{routeCount} routes</span>}
                  </div>

                  {/* Tags */}
                  {tags.length > 0 && (
                    <div className="ml-5 mt-1 flex flex-wrap gap-1">
                      {tags.map((tag) => (
                        <span
                          key={tag.id}
                          className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground"
                        >
                          {tag.tag_name}
                        </span>
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
