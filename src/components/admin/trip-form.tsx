"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";

interface TripFormProps {
  trip?: {
    id: string;
    title: string;
    description: string | null;
    start_date: string | null;
    end_date: string | null;
    color_hex: string;
    status: string;
  };
}

export function TripForm({ trip }: TripFormProps) {
  const t = useTranslations("trips");
  const tc = useTranslations("common");
  const router = useRouter();
  const isEdit = !!trip;

  const [title, setTitle] = useState(trip?.title ?? "");
  const [description, setDescription] = useState(trip?.description ?? "");
  const [startDate, setStartDate] = useState(trip?.start_date ?? "");
  const [endDate, setEndDate] = useState(trip?.end_date ?? "");
  const [colorHex, setColorHex] = useState(trip?.color_hex ?? "#3388ff");
  const [status, setStatus] = useState(trip?.status ?? "draft");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const payload = {
      title,
      description: description || null,
      start_date: startDate || null,
      end_date: endDate || null,
      color_hex: colorHex,
      status,
    };

    try {
      const supabase = createClient();

      if (isEdit) {
        const { error: err } = await supabase
          .from("trips")
          .update(payload)
          .eq("id", trip.id);
        if (err) throw err;
      } else {
        const { error: err } = await supabase.from("trips").insert(payload);
        if (err) throw err;
      }

      router.push("/admin");
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
        <label htmlFor="title" className="text-sm font-medium">
          {t("tripTitle")} *
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="description" className="text-sm font-medium">
          {t("description")}
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="startDate" className="text-sm font-medium">
            {t("startDate")}
          </label>
          <input
            id="startDate"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="endDate" className="text-sm font-medium">
            {t("endDate")}
          </label>
          <input
            id="endDate"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="color" className="text-sm font-medium">
            {t("color")}
          </label>
          <div className="flex items-center gap-2">
            <input
              id="color"
              type="color"
              value={colorHex}
              onChange={(e) => setColorHex(e.target.value)}
              className="h-10 w-14 cursor-pointer rounded-md border border-input"
            />
            <input
              type="text"
              value={colorHex}
              onChange={(e) => setColorHex(e.target.value)}
              className="flex h-10 w-28 rounded-md border border-input bg-background px-3 py-2 text-sm font-mono"
              pattern="^#[0-9a-fA-F]{6}$"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="status" className="text-sm font-medium">
            Status
          </label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="draft">{t("draft") ?? "Draft"}</option>
            <option value="published">{t("publish")}</option>
            <option value="planned">Planned</option>
          </select>
        </div>
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
