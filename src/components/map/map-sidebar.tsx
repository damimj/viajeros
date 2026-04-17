"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight, Filter, MapPin, Route as RouteIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface TripMeta {
  id: string;
  title: string;
  color: string;
  startDate: string | null;
  endDate: string | null;
  tags: string[];
  pointCount: number;
  routeCount: number;
}

interface MapSidebarProps {
  trips: TripMeta[];
  selectedTripIds: Set<string> | null;
  onSelectionChange: (ids: Set<string> | null) => void;
}

export function MapSidebar({
  trips,
  selectedTripIds,
  onSelectionChange,
}: MapSidebarProps) {
  const t = useTranslations("map");
  const [collapsed, setCollapsed] = useState(false);
  const [search, setSearch] = useState("");

  const isAllSelected = selectedTripIds === null;

  const filteredTrips = trips.filter((trip) =>
    trip.title.toLowerCase().includes(search.toLowerCase()) ||
    trip.tags.some((tag) => tag.toLowerCase().includes(search.toLowerCase())),
  );

  function toggleTrip(tripId: string) {
    if (isAllSelected) {
      // From "all" → select only this trip
      onSelectionChange(new Set([tripId]));
    } else if (selectedTripIds!.has(tripId)) {
      const next = new Set(selectedTripIds!);
      next.delete(tripId);
      // If nothing selected, go back to all
      onSelectionChange(next.size === 0 ? null : next);
    } else {
      const next = new Set(selectedTripIds!);
      next.add(tripId);
      // If all selected, go to null (show all)
      onSelectionChange(next.size === trips.length ? null : next);
    }
  }

  function showAll() {
    onSelectionChange(null);
  }

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="fixed left-0 top-1/2 z-20 -translate-y-1/2 rounded-r-md border border-l-0 bg-background p-1.5 shadow-md transition-all"
        style={{ left: collapsed ? 0 : "18rem" }}
      >
        {collapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </button>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-10 w-72 overflow-y-auto border-r bg-background/95 shadow-lg backdrop-blur transition-transform",
          collapsed && "-translate-x-full",
        )}
      >
        <div className="p-4">
          {/* Header */}
          <div className="mb-4 flex items-center gap-2">
            <Filter className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold">{t("filterTrips")}</h2>
          </div>

          {/* Search */}
          <input
            type="text"
            placeholder={`${t("filterTrips")}...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mb-3 flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />

          {/* Show All button */}
          <button
            onClick={showAll}
            className={cn(
              "mb-3 w-full rounded-md px-3 py-2 text-left text-sm font-medium transition-colors",
              isAllSelected
                ? "bg-primary text-primary-foreground"
                : "hover:bg-accent",
            )}
          >
            {t("showAll")} ({trips.length})
          </button>

          {/* Trip list */}
          <div className="space-y-1">
            {filteredTrips.map((trip) => {
              const isSelected = isAllSelected || selectedTripIds?.has(trip.id);

              return (
                <button
                  key={trip.id}
                  onClick={() => toggleTrip(trip.id)}
                  className={cn(
                    "w-full rounded-md px-3 py-2.5 text-left transition-colors",
                    isSelected && !isAllSelected
                      ? "bg-accent"
                      : "hover:bg-accent/50",
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="inline-block h-3 w-3 flex-shrink-0 rounded-full"
                      style={{ backgroundColor: trip.color }}
                    />
                    <span className="truncate text-sm font-medium">
                      {trip.title}
                    </span>
                  </div>

                  <div className="ml-5 mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                    {trip.startDate && (
                      <span>
                        {trip.startDate}
                        {trip.endDate ? ` → ${trip.endDate}` : ""}
                      </span>
                    )}
                  </div>

                  <div className="ml-5 mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-0.5">
                      <MapPin className="h-3 w-3" />
                      {trip.pointCount}
                    </span>
                    <span className="inline-flex items-center gap-0.5">
                      <RouteIcon className="h-3 w-3" />
                      {trip.routeCount}
                    </span>
                  </div>

                  {trip.tags.length > 0 && (
                    <div className="ml-5 mt-1 flex flex-wrap gap-1">
                      {trip.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {filteredTrips.length === 0 && (
            <p className="mt-4 text-center text-sm text-muted-foreground">
              {t("allTrips")}
            </p>
          )}
        </div>
      </aside>
    </>
  );
}
