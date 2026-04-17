"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/shared/toast";
import type { Trip, TripStatus } from "@/types/domain";
import { TRIP_STATUSES } from "@/lib/constants";

interface TripFormProps {
  trip?: Trip;
  onSubmit: (data: {
    title: string;
    description: string;
    start_date: string;
    end_date: string;
    color_hex: string;
    status: TripStatus;
  }) => Promise<void>;
}

export function TripForm({ trip, onSubmit }: TripFormProps) {
  const t = useTranslations("admin");
  const { showToast } = useToast();
  const router = useRouter();

  const [title, setTitle] = useState(trip?.title ?? "");
  const [description, setDescription] = useState(trip?.description ?? "");
  const [startDate, setStartDate] = useState(trip?.start_date ?? "");
  const [endDate, setEndDate] = useState(trip?.end_date ?? "");
  const [color, setColor] = useState(trip?.color_hex ?? "#3388ff");
  const [status, setStatus] = useState<TripStatus>(trip?.status ?? "draft");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await onSubmit({
        title,
        description,
        start_date: startDate,
        end_date: endDate,
        color_hex: color,
        status,
      });
      showToast(t("saved"), "success");
      router.push("/admin");
    } catch {
      showToast(t("error"), "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
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

      <div className="grid grid-cols-2 gap-4">
        <Field label={t("startDate")}>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label={t("endDate")}>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className={inputClass}
          />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
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
              pattern="^#[0-9A-Fa-f]{6}$"
            />
          </div>
        </Field>
        <Field label={t("status")}>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as TripStatus)}
            className={inputClass}
          >
            {TRIP_STATUSES.map((s) => (
              <option key={s} value={s}>
                {t(s as Parameters<typeof t>[0])}
              </option>
            ))}
          </select>
        </Field>
      </div>

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
