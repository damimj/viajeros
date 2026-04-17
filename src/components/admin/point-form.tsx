"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import imageCompression from "browser-image-compression";

interface PointFormProps {
  point?: {
    id: string;
    trip_id: string;
    title: string;
    description: string | null;
    type: string;
    icon: string;
    image_path: string | null;
    latitude: number;
    longitude: number;
    visit_date: string | null;
  };
  tripId?: string;
}

export function PointForm({ point, tripId }: PointFormProps) {
  const t = useTranslations("points");
  const tc = useTranslations("common");
  const router = useRouter();
  const isEdit = !!point;

  const [trips, setTrips] = useState<{ id: string; title: string }[]>([]);
  const [selectedTripId, setSelectedTripId] = useState(point?.trip_id ?? tripId ?? "");
  const [title, setTitle] = useState(point?.title ?? "");
  const [description, setDescription] = useState(point?.description ?? "");
  const [type, setType] = useState(point?.type ?? "visit");
  const [latitude, setLatitude] = useState(point?.latitude?.toString() ?? "");
  const [longitude, setLongitude] = useState(point?.longitude?.toString() ?? "");
  const [visitDate, setVisitDate] = useState(point?.visit_date?.substring(0, 16) ?? "");
  const [imagePath, setImagePath] = useState(point?.image_path ?? "");
  const [uploading, setUploading] = useState(false);
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
      if (!selectedTripId && data && data.length > 0) {
        setSelectedTripId(data[0].id);
      }
    }
    loadTrips();
  }, []);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      // Compress client-side
      const compressed = await imageCompression(file, {
        maxWidthOrHeight: 1920,
        maxSizeMB: 2,
        useWebWorker: true,
      });

      const supabase = createClient();
      const ext = file.name.split(".").pop() ?? "jpg";
      const fileName = `${selectedTripId}/${Date.now()}.${ext}`;

      const { error: uploadErr } = await supabase.storage
        .from("uploads")
        .upload(fileName, compressed, {
          contentType: compressed.type,
          upsert: false,
        });

      if (uploadErr) throw uploadErr;

      const { data: urlData } = supabase.storage
        .from("uploads")
        .getPublicUrl(fileName);

      setImagePath(urlData.publicUrl);
    } catch {
      setError(tc("error"));
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const payload = {
      trip_id: selectedTripId,
      title,
      description: description || null,
      type,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      visit_date: visitDate || null,
      image_path: imagePath || null,
    };

    try {
      const supabase = createClient();

      if (isEdit) {
        const { error: err } = await supabase
          .from("points_of_interest")
          .update(payload)
          .eq("id", point.id);
        if (err) throw err;
      } else {
        const { error: err } = await supabase
          .from("points_of_interest")
          .insert(payload);
        if (err) throw err;
      }

      router.push("/admin/points");
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
        <label htmlFor="trip" className="text-sm font-medium">
          {t("trip")} *
        </label>
        <select
          id="trip"
          value={selectedTripId}
          onChange={(e) => setSelectedTripId(e.target.value)}
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
        <label htmlFor="pointTitle" className="text-sm font-medium">
          {t("pointTitle")} *
        </label>
        <input
          id="pointTitle"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="pointDesc" className="text-sm font-medium">
          {t("description")}
        </label>
        <textarea
          id="pointDesc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="type" className="text-sm font-medium">
            {t("kind")}
          </label>
          <select
            id="type"
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="visit">{t("poi")}</option>
            <option value="stay">{t("stay")}</option>
            <option value="food">Food</option>
            <option value="waypoint">Waypoint</option>
          </select>
        </div>

        <div className="space-y-2">
          <label htmlFor="visitDate" className="text-sm font-medium">
            Visit date
          </label>
          <input
            id="visitDate"
            type="datetime-local"
            value={visitDate}
            onChange={(e) => setVisitDate(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="lat" className="text-sm font-medium">
            {t("latitude")} *
          </label>
          <input
            id="lat"
            type="number"
            step="any"
            value={latitude}
            onChange={(e) => setLatitude(e.target.value)}
            required
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder="-34.60372"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="lng" className="text-sm font-medium">
            {t("longitude")} *
          </label>
          <input
            id="lng"
            type="number"
            step="any"
            value={longitude}
            onChange={(e) => setLongitude(e.target.value)}
            required
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder="-58.38157"
          />
        </div>
      </div>

      <p className="text-xs text-muted-foreground">{t("clickMap")}</p>

      <div className="space-y-2">
        <label htmlFor="image" className="text-sm font-medium">
          {t("images")}
        </label>
        <input
          id="image"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleImageUpload}
          disabled={uploading}
          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm file:mr-4 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1 file:text-xs file:text-primary-foreground"
        />
        {uploading && <p className="text-xs text-muted-foreground">{tc("loading")}</p>}
        {imagePath && (
          <img
            src={imagePath}
            alt="Preview"
            className="mt-2 h-32 w-auto rounded-md border object-cover"
          />
        )}
      </div>

      {error && (
        <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          disabled={saving || uploading}
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
