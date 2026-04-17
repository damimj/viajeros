"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { TRANSPORT_TYPES, DEFAULT_TRANSPORT_COLORS } from "@/lib/constants";

interface RouteFormProps {
  route?: {
    id: string;
    trip_id: string;
    transport_type: string;
    geojson_data: object;
    is_round_trip: boolean;
    distance_meters: number;
    color: string;
    name: string | null;
    description: string | null;
    start_datetime: string | null;
    end_datetime: string | null;
  };
}

export function RouteForm({ route }: RouteFormProps) {
  const t = useTranslations("routes");
  const tc = useTranslations("common");
  const router = useRouter();
  const isEdit = !!route;

  const [trips, setTrips] = useState<{ id: string; title: string }[]>([]);
  const [tripId, setTripId] = useState(route?.trip_id ?? "");
  const [transportType, setTransportType] = useState(route?.transport_type ?? "car");
  const [geojsonText, setGeojsonText] = useState(
    route ? JSON.stringify(route.geojson_data, null, 2) : "",
  );
  const [isRoundTrip, setIsRoundTrip] = useState(route?.is_round_trip ?? true);
  const [distanceMeters, setDistanceMeters] = useState(route?.distance_meters?.toString() ?? "0");
  const [color, setColor] = useState(
    route?.color ?? DEFAULT_TRANSPORT_COLORS[transportType as keyof typeof DEFAULT_TRANSPORT_COLORS] ?? "#3388ff",
  );
  const [name, setName] = useState(route?.name ?? "");
  const [description, setDescription] = useState(route?.description ?? "");
  const [startDatetime, setStartDatetime] = useState(route?.start_datetime?.substring(0, 16) ?? "");
  const [endDatetime, setEndDatetime] = useState(route?.end_datetime?.substring(0, 16) ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadTrips() {
      const supabase = createClient();
      const { data } = await supabase
        .from("trips")
        .select("id, title")
        .order("start_date", { ascending: false });
      setTrips(data ?? []);
      if (!tripId && data && data.length > 0) {
        setTripId(data[0].id);
      }
    }
    loadTrips();
  }, []);

  // Auto-set color when transport type changes (only on create)
  useEffect(() => {
    if (!isEdit) {
      const c = DEFAULT_TRANSPORT_COLORS[transportType as keyof typeof DEFAULT_TRANSPORT_COLORS];
      if (c) setColor(c);
    }
  }, [transportType, isEdit]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    let parsedGeojson: object;
    try {
      parsedGeojson = JSON.parse(geojsonText);
    } catch {
      setError("Invalid GeoJSON");
      setSaving(false);
      return;
    }

    const payload = {
      trip_id: tripId,
      transport_type: transportType,
      geojson_data: parsedGeojson,
      is_round_trip: isRoundTrip,
      distance_meters: parseInt(distanceMeters) || 0,
      color,
      name: name || null,
      description: description || null,
      start_datetime: startDatetime || null,
      end_datetime: endDatetime || null,
    };

    try {
      const supabase = createClient();

      if (isEdit) {
        const { error: err } = await supabase
          .from("routes")
          .update(payload)
          .eq("id", route.id);
        if (err) throw err;
      } else {
        const { error: err } = await supabase.from("routes").insert(payload);
        if (err) throw err;
      }

      router.push("/admin/routes");
      router.refresh();
    } catch {
      setError(tc("error"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-4">
      <div className="space-y-2">
        <label htmlFor="routeTrip" className="text-sm font-medium">
          {t("trip")} *
        </label>
        <select
          id="routeTrip"
          value={tripId}
          onChange={(e) => setTripId(e.target.value)}
          required
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {trips.map((tr) => (
            <option key={tr.id} value={tr.id}>
              {tr.title}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label htmlFor="routeName" className="text-sm font-medium">
          Name
        </label>
        <input
          id="routeName"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          placeholder="Buenos Aires → Mendoza"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="transport" className="text-sm font-medium">
            {t("transport")} *
          </label>
          <select
            id="transport"
            value={transportType}
            onChange={(e) => setTransportType(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {TRANSPORT_TYPES.map((tt) => (
              <option key={tt} value={tt}>
                {t(tt as "car" | "plane" | "train" | "boat" | "foot") ?? tt}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label htmlFor="routeColor" className="text-sm font-medium">
            Color
          </label>
          <div className="flex items-center gap-2">
            <input
              id="routeColor"
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="h-10 w-14 cursor-pointer rounded-md border border-input"
            />
            <input
              type="text"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="flex h-10 w-28 rounded-md border border-input bg-background px-3 py-2 text-sm font-mono"
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="routeDesc" className="text-sm font-medium">
          {t("editRoute") ? "Description" : "Description"}
        </label>
        <textarea
          id="routeDesc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="startDt" className="text-sm font-medium">Start</label>
          <input
            id="startDt"
            type="datetime-local"
            value={startDatetime}
            onChange={(e) => setStartDatetime(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="endDt" className="text-sm font-medium">End</label>
          <input
            id="endDt"
            type="datetime-local"
            value={endDatetime}
            onChange={(e) => setEndDatetime(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <input
            id="roundTrip"
            type="checkbox"
            checked={isRoundTrip}
            onChange={(e) => setIsRoundTrip(e.target.checked)}
            className="h-4 w-4 rounded border-input"
          />
          <label htmlFor="roundTrip" className="text-sm">Round trip</label>
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="distance" className="text-sm">{t("distance")} (m):</label>
          <input
            id="distance"
            type="number"
            value={distanceMeters}
            onChange={(e) => setDistanceMeters(e.target.value)}
            className="flex h-8 w-28 rounded-md border border-input bg-background px-2 text-sm font-mono"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="geojson" className="text-sm font-medium">
          GeoJSON *
        </label>
        <textarea
          id="geojson"
          value={geojsonText}
          onChange={(e) => setGeojsonText(e.target.value)}
          required
          rows={10}
          className="flex w-full rounded-md border border-input bg-background px-3 py-2 font-mono text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          placeholder='{"type":"Feature","geometry":{"type":"LineString","coordinates":[[-58.38,-34.60],[-68.84,-32.89]]},"properties":{}}'
        />
        <p className="text-xs text-muted-foreground">{t("drawRoute")}</p>
      </div>

      {error && (
        <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex h-10 items-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {saving ? tc("loading") : tc("save")}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex h-10 items-center rounded-md border bg-background px-6 text-sm font-medium hover:bg-accent"
        >
          {tc("cancel")}
        </button>
      </div>
    </form>
  );
}
