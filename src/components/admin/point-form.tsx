"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/shared/toast";
import type { PointOfInterest, PoiType, Trip } from "@/types/domain";
import { POI_TYPES } from "@/lib/constants";

interface PointFormProps {
  point?: PointOfInterest;
  trips: Trip[];
  defaultTripId?: string;
  onSubmit: (data: {
    trip_id: string;
    title: string;
    description: string;
    type: PoiType;
    latitude: number;
    longitude: number;
    visit_date: string;
  }) => Promise<void>;
}

export function PointForm({ point, trips, defaultTripId, onSubmit }: PointFormProps) {
  const t = useTranslations("admin");
  const { showToast } = useToast();
  const router = useRouter();

  const [tripId, setTripId] = useState(point?.trip_id ?? defaultTripId ?? trips[0]?.id ?? "");
  const [title, setTitle] = useState(point?.title ?? "");
  const [description, setDescription] = useState(point?.description ?? "");
  const [type, setType] = useState<PoiType>(point?.type ?? "visit");
  const [lat, setLat] = useState(String(point?.latitude ?? ""));
  const [lng, setLng] = useState(String(point?.longitude ?? ""));
  const [visitDate, setVisitDate] = useState(
    point?.visit_date ? point.visit_date.split("T")[0] : "",
  );
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await onSubmit({
        trip_id: tripId,
        title,
        description,
        type,
        latitude: parseFloat(lat),
        longitude: parseFloat(lng),
        visit_date: visitDate,
      });
      showToast(t("saved"), "success");
      router.push("/admin/points");
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

      <Field label={t("title")} required>
        <input
          type="text"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={inputClass}
        />
      </Field>

      <Field label={t("description")}>
        <textarea
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={inputClass}
        />
      </Field>

      <Field label={t("type")} required>
        <select
          value={type}
          onChange={(e) => setType(e.target.value as PoiType)}
          className={inputClass}
        >
          {POI_TYPES.map((pt) => (
            <option key={pt} value={pt}>
              {pt.charAt(0).toUpperCase() + pt.slice(1)}
            </option>
          ))}
        </select>
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label={t("latitude")} required>
          <input
            type="number"
            step="any"
            required
            value={lat}
            onChange={(e) => setLat(e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label={t("longitude")} required>
          <input
            type="number"
            step="any"
            required
            value={lng}
            onChange={(e) => setLng(e.target.value)}
            className={inputClass}
          />
        </Field>
      </div>

      <Field label={t("visitDate")}>
        <input
          type="date"
          value={visitDate}
          onChange={(e) => setVisitDate(e.target.value)}
          className={inputClass}
        />
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
