"use client";

import { X, MapPin, Calendar, ExternalLink } from "lucide-react";

interface PointPopupProps {
  feature: GeoJSON.Feature;
  onClose: () => void;
}

export function PointPopup({ feature, onClose }: PointPopupProps) {
  const props = feature.properties ?? {};

  return (
    <div className="fixed bottom-4 left-4 right-4 z-30 mx-auto max-w-sm rounded-lg border bg-background shadow-xl md:bottom-auto md:left-auto md:right-4 md:top-4">
      {/* Header */}
      <div className="flex items-start justify-between border-b p-4">
        <div className="flex items-center gap-2">
          <span
            className="inline-block h-3 w-3 rounded-full"
            style={{ backgroundColor: props.tripColor ?? "#3388ff" }}
          />
          <div>
            <h3 className="font-semibold">{props.title ?? "Point"}</h3>
            <p className="text-xs text-muted-foreground">{props.tripTitle}</p>
          </div>
        </div>
        <button onClick={onClose} className="rounded-md p-1 hover:bg-accent">
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Image */}
      {props.imagePath && (
        <div className="border-b">
          <img
            src={props.imagePath}
            alt={props.title}
            className="h-48 w-full object-cover"
          />
        </div>
      )}

      {/* Body */}
      <div className="space-y-2 p-4">
        {props.description && (
          <p className="text-sm text-foreground">{props.description}</p>
        )}

        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
          {props.type && (
            <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5">
              <MapPin className="h-3 w-3" />
              {props.type}
            </span>
          )}
          {props.visitDate && (
            <span className="inline-flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {new Date(props.visitDate).toLocaleDateString()}
            </span>
          )}
        </div>

        {/* Coordinates */}
        <div className="pt-1">
          <a
            href={`https://www.google.com/maps?q=${(feature.geometry as GeoJSON.Point).coordinates[1]},${(feature.geometry as GeoJSON.Point).coordinates[0]}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
          >
            <ExternalLink className="h-3 w-3" />
            Open in Google Maps
          </a>
        </div>
      </div>
    </div>
  );
}
