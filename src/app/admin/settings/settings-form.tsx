"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { MAP_STYLES, TRANSPORT_TYPES } from "@/lib/constants";
import type { Setting } from "@/types/domain";

interface SettingsFormProps {
  rows: Setting[];
  onSave: (
    prev: { success: boolean } | null,
    formData: FormData,
  ) => Promise<{ success: boolean }>;
}

export function SettingsForm({ rows, onSave }: SettingsFormProps) {
  const t = useTranslations("settings");
  const [state, action, pending] = useActionState(onSave, null);

  const get = (key: string) => rows.find((r) => r.setting_key === key)?.setting_value ?? "";

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold">{t("title")}</h1>

      {state?.success && (
        <div className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200">
          {t("saved")}
        </div>
      )}

      <form action={action} className="space-y-8">
        {/* Map */}
        <Section title={t("map")}>
          <Field label={t("mapStyle")}>
            <select name="map_style" defaultValue={get("map_style")} className={inputClass}>
              {Object.keys(MAP_STYLES).map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </Field>
          <div className="grid grid-cols-3 gap-4">
            <Field label={t("clusterEnabled")}>
              <select
                name="map_cluster_enabled"
                defaultValue={get("map_cluster_enabled")}
                className={inputClass}
              >
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </Field>
            <Field label={t("clusterRadius")}>
              <input
                type="number"
                name="map_cluster_max_radius"
                defaultValue={get("map_cluster_max_radius")}
                className={inputClass}
              />
            </Field>
            <Field label={t("clusterZoom")}>
              <input
                type="number"
                name="map_cluster_disable_at_zoom"
                defaultValue={get("map_cluster_disable_at_zoom")}
                className={inputClass}
              />
            </Field>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">{t("transportColors")}</p>
            <div className="grid grid-cols-4 gap-3">
              {TRANSPORT_TYPES.map((transport) => {
                const key = `transport_color_${transport}`;
                return (
                  <div key={transport} className="flex flex-col gap-1">
                    <label className="text-xs capitalize text-muted-foreground">{transport}</label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="color"
                        name={key}
                        defaultValue={get(key)}
                        className="h-8 w-10 cursor-pointer rounded border p-0.5"
                      />
                      <input
                        type="text"
                        name={`${key}_text`}
                        defaultValue={get(key)}
                        className="w-full rounded border px-2 py-1 text-xs font-mono"
                        readOnly
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Section>

        {/* Images */}
        <Section title={t("images")}>
          <div className="grid grid-cols-3 gap-4">
            <Field label={t("imageMaxWidth")}>
              <input
                type="number"
                name="image_max_width"
                defaultValue={get("image_max_width")}
                className={inputClass}
              />
            </Field>
            <Field label={t("imageMaxHeight")}>
              <input
                type="number"
                name="image_max_height"
                defaultValue={get("image_max_height")}
                className={inputClass}
              />
            </Field>
            <Field label={t("imageQuality")}>
              <input
                type="number"
                name="image_quality"
                min="1"
                max="100"
                defaultValue={get("image_quality")}
                className={inputClass}
              />
            </Field>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Field label={t("thumbnailMaxWidth")}>
              <input
                type="number"
                name="thumbnail_max_width"
                defaultValue={get("thumbnail_max_width")}
                className={inputClass}
              />
            </Field>
            <Field label={t("thumbnailMaxHeight")}>
              <input
                type="number"
                name="thumbnail_max_height"
                defaultValue={get("thumbnail_max_height")}
                className={inputClass}
              />
            </Field>
            <Field label={t("thumbnailQuality")}>
              <input
                type="number"
                name="thumbnail_quality"
                min="1"
                max="100"
                defaultValue={get("thumbnail_quality")}
                className={inputClass}
              />
            </Field>
          </div>
          <Field label={t("maxUploadSize")}>
            <input
              type="number"
              name="max_upload_size"
              defaultValue={get("max_upload_size")}
              className={inputClass}
            />
          </Field>
        </Section>

        {/* Site */}
        <Section title={t("site")}>
          <Field label={t("siteTitle")}>
            <input
              type="text"
              name="site_title"
              defaultValue={get("site_title")}
              className={inputClass}
            />
          </Field>
          <Field label={t("siteDescription")}>
            <textarea
              name="site_description"
              rows={2}
              defaultValue={get("site_description")}
              className={inputClass}
            />
          </Field>
          <Field label={t("analyticsCode")}>
            <textarea
              name="site_analytics_code"
              rows={3}
              defaultValue={get("site_analytics_code")}
              placeholder="<!-- Google Analytics or other scripts -->"
              className={`font-mono text-xs ${inputClass}`}
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label={t("defaultLanguage")}>
              <select
                name="default_language"
                defaultValue={get("default_language")}
                className={inputClass}
              >
                <option value="en">English</option>
                <option value="es">Español</option>
              </select>
            </Field>
            <Field label={t("distanceUnit")}>
              <select
                name="distance_unit"
                defaultValue={get("distance_unit")}
                className={inputClass}
              >
                <option value="km">km</option>
                <option value="mi">mi</option>
              </select>
            </Field>
          </div>
        </Section>

        <div className="pt-2">
          <button
            type="submit"
            disabled={pending}
            className="rounded-md bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {pending ? t("saving") : t("save")}
          </button>
        </div>
      </form>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border p-6 space-y-4">
      <h2 className="font-semibold text-lg">{title}</h2>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium">{label}</label>
      {children}
    </div>
  );
}

const inputClass =
  "w-full rounded-md border border-input bg-background px-3 py-2 text-sm";
