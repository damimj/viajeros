"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/shared/toast";
import type { Route, TransportType, Trip } from "@/types/domain";
import { TRANSPORT_TYPES, DEFAULT_TRANSPORT_COLORS } from "@/lib/constants";

interface RouteFormProps {
  route?: Route;
  trips: Trip[];
  defaultTripId?: string;
  onSubmit: (data: {
    trip_id: string;
    transport_type: TransportType;
    geojson_data: object;
    is_round_trip: boolean;
    distance_meters: number;
    color: string;
    name: string;
    description: string;
    start_datetime: string;
    end_datetime: string;
  }) => Promise<void>;
}

export function RouteForm({ route, trips, defaultTripId, onSubmit }: RouteFormProps) {
  const t = useTranslations("admin");
  const { showToast } = useToast();
  const router = useRouter();

  const [tripId, setTripId] = useState(route?.trip_id ?? defaultTripId ?? trips[0]?.id ?? "");
  const [name, setName] = useState(route?.name ?? "");
  const [description, setDescription] = useState(route?.description ?? "");
  const [transport, setTransport] = useState<TransportType>(route?.transport_type ?? "plane");
  const [color, setColor] = useState(
    route?.color ?? DEFAULT_TRANSPORT_COLORS[route?.transport_type ?? "plane"],
  );
  const [geojson, setGeojson] = useState(
    route?.geojson_data ? JSON.stringify(route.geojson_data, null, 2) : "",
  );
  const [distance, setDistance] = useState(String(route?.distance_meters ?? 0));
  const [roundTrip, setRoundTrip] = useState(route?.is_round_trip ?? true);
  const [startDatetime, setStartDatetime] = useState(
    route?.start_datetime?.slice(0, 16) ?? "",
  );
  const [endDatetime, setEndDatetime] = useState(route?.end_datetime?.slice(0, 16) ?? "");
  const [geojsonError, setGeojsonError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function handleTransportChange(t: TransportType) {
    setTransport(t);
    setColor(DEFAULT_TRANSPORT_COLORS[t]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setGeojsonError(null);

    let parsed: object;
    try {
      parsed = JSON.parse(geojson);
    } catch {
      setGeojsonError("Invalid GeoJSON — please check the format.");
      return;
    }

    setSaving(true);
    try {
      await onSubmit({
        trip_id: tripId,
        transport_type: transport,
        geojson_data: parsed,
        is_round_trip: roundTrip,
        distance_meters: parseInt(distance) || 0,
        color,
        name,
        description,
        start_datetime: startDatetime,
        end_datetime: endDatetime,
      });
      showToast(t("saved"), "success");
      router.push("/admin/routes");
    } catch {
      showToast(t("error"), "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-4">
      <Field label={t("tripLabel")} required>
        <select value={tripId} onChange={(e) => setTripId(e.target.value)} className={inputClass}>
          {trips.map((trip) => (
            <option key={trip.id} value={trip.id}>
              {trip.title}
            </option>
          ))}
        </select>
      </Field>

      <Field label={t("title")}>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={inputClass}
        />
      </Field>

      <Field label={t("description")}>
        <textarea
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={inputClass}
        />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label={t("transport")} required>
          <select
            value={transport}
            onChange={(e) => handleTransportChange(e.target.value as TransportType)}
            className={inputClass}
          >
            {TRANSPORT_TYPES.map((tt) => (
              <option key={tt} value={tt}>
                {tt.charAt(0).toUpperCase() + tt.slice(1)}
              </option>
            ))}
          </select>
        </Field>
        <Field label={t("color")}>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="h-9 w-16 cursor-pointer rounded border p-1"
            />
            <input
              type="text"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className={inputClass}
            />
          </div>
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label={t("distance")}>
          <input
            type="number"
            min="0"
            value={distance}
            onChange={(e) => setDistance(e.target.value)}
            className={inputClass}
          />
        </Field>
        <div className="flex items-center gap-2 pt-6">
          <input
            type="checkbox"
            id="roundTrip"
            checked={roundTrip}
            onChange={(e) => setRoundTrip(e.target.checked)}
            className="h-4 w-4 rounded border"
          />
          <label htmlFor="roundTrip" className="text-sm font-medium">
            {t("roundTrip")}
          </label>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label={t("startDate")}>
          <input
            type="datetime-local"
            value={startDatetime}
            onChange={(e) => setStartDatetime(e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label={t("endDate")}>
          <input
            type="datetime-local"
            value={endDatetime}
            onChange={(e) => setEndDatetime(e.target.value)}
            className={inputClass}
          />
        </Field>
      </div>

      <Field label={t("geojson")} required>
        <textarea
          rows={8}
          required
          value={geojson}
          onChange={(e) => {
            setGeojson(e.target.value);
            setGeojsonError(null);
          }}
          placeholder='{"type":"LineString","coordinates":[[lng,lat],[lng,lat]]}'
          className={`font-mono text-xs ${inputClass}`}
        />
        {geojsonError && <p className="text-sm text-destructive">{geojsonError}</p>}
      </Field>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {saving ? t("saving") : t("save")}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-md border px-4 py-2 text-sm hover:bg-accent"
        >
          {t("cancel")}
        </button>
      </div>
    </form>
  );
}

const inputClass =
  "w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring";

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium">
        {label}
        {required && <span className="ml-0.5 text-destructive">*</span>}
      </label>
      {children}
    </div>
  );
}
