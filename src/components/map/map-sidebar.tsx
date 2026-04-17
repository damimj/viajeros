"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight, MapPin, Route, Tag } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { Trip } from "@/types/domain";

interface MapSidebarProps {
  trips: Trip[];
  selectedTripId: string | null;
  onSelectTrip: (id: string | null) => void;
}

export function MapSidebar({ trips, selectedTripId, onSelectTrip }: MapSidebarProps) {
  const t = useTranslations("map");
  const [isOpen, setIsOpen] = useState(true);

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="absolute left-0 top-1/2 z-20 -translate-y-1/2 rounded-r-lg border border-l-0 bg-white p-2 shadow-md transition-colors hover:bg-slate-50"
        style={{ left: isOpen ? "18rem" : 0, transition: "left 0.2s" }}
      >
        {isOpen ? (
          <ChevronLeft className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        )}
      </button>

      {/* Sidebar panel */}
      <aside
        className={cn(
          "absolute left-0 top-0 z-10 h-full w-72 overflow-hidden border-r bg-white shadow-lg transition-transform duration-200",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-full flex-col">
          <div className="border-b p-4">
            <h2 className="font-semibold">{t("trips")}</h2>
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            {trips.length === 0 ? (
              <p className="p-4 text-center text-sm text-muted-foreground">{t("noTrips")}</p>
            ) : (
              <div className="space-y-1">
                {selectedTripId && (
                  <button
                    onClick={() => onSelectTrip(null)}
                    className="w-full rounded-lg px-3 py-2 text-left text-sm text-primary hover:bg-primary/5"
                  >
                    ← {t("showAll")}
                  </button>
                )}
                {trips.map((trip) => (
                  <TripCard
                    key={trip.id}
                    trip={trip}
                    isSelected={selectedTripId === trip.id}
                    onClick={() => onSelectTrip(trip.id === selectedTripId ? null : trip.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}

function TripCard({
  trip,
  isSelected,
  onClick,
}: {
  trip: Trip;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full rounded-lg border p-3 text-left transition-colors hover:bg-slate-50",
        isSelected ? "border-primary bg-primary/5" : "border-transparent",
      )}
    >
      <div className="flex items-start gap-2">
        <div
          className="mt-0.5 h-3 w-3 flex-shrink-0 rounded-full"
          style={{ background: trip.color_hex }}
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{trip.title}</p>
          {(trip.start_date || trip.end_date) && (
            <p className="mt-0.5 text-xs text-muted-foreground">
              {trip.start_date ? new Date(trip.start_date).getFullYear() : ""}
              {trip.start_date && trip.end_date ? " – " : ""}
              {trip.end_date && trip.end_date !== trip.start_date
                ? new Date(trip.end_date).getFullYear()
                : ""}
            </p>
          )}
          <div className="mt-1.5 flex items-center gap-3 text-xs text-muted-foreground">
            {(trip.points?.length ?? 0) > 0 && (
              <span className="flex items-center gap-0.5">
                <MapPin className="h-3 w-3" />
                {trip.points!.length}
              </span>
            )}
            {(trip.routes?.length ?? 0) > 0 && (
              <span className="flex items-center gap-0.5">
                <Route className="h-3 w-3" />
                {trip.routes!.length}
              </span>
            )}
            {(trip.tags?.length ?? 0) > 0 && (
              <span className="flex items-center gap-0.5">
                <Tag className="h-3 w-3" />
                {trip.tags!.length}
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}
