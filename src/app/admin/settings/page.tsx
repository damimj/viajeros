"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { Save, Check } from "lucide-react";
import { TRANSPORT_TYPES } from "@/lib/constants";

type Tab = "general" | "map" | "images" | "site";

interface SettingRow {
  setting_key: string;
  setting_value: string | null;
  setting_type: string;
}

export default function AdminSettingsPage() {
  const t = useTranslations("settings");
  const tc = useTranslations("common");

  const [tab, setTab] = useState<Tab>("general");
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data } = await supabase.from("settings").select("setting_key, setting_value, setting_type");
      const map: Record<string, string> = {};
      (data ?? []).forEach((row: SettingRow) => {
        map[row.setting_key] = row.setting_value ?? "";
      });
      setSettings(map);
      setLoading(false);
    }
    load();
  }, []);

  function set(key: string, value: string) {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  async function handleSave() {
    setSaving(true);
    const supabase = createClient();

    const updates = Object.entries(settings).map(([key, value]) =>
      supabase.from("settings").update({ setting_value: value }).eq("setting_key", key),
    );

    await Promise.all(updates);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  if (loading) return <p className="text-muted-foreground">{tc("loading")}</p>;

  const tabs: { key: Tab; label: string }[] = [
    { key: "general", label: t("general") },
    { key: "map", label: t("map") },
    { key: "images", label: t("images") },
    { key: "site", label: t("site") },
  ];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex h-9 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
          {saved ? t("saved") : saving ? tc("loading") : tc("save")}
        </button>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 border-b">
        {tabs.map((tb) => (
          <button
            key={tb.key}
            onClick={() => setTab(tb.key)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              tab === tb.key
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tb.label}
          </button>
        ))}
      </div>

      <div className="max-w-2xl space-y-4">
        {tab === "general" && (
          <>
            <Field label={t("defaultLanguage")}>
              <select value={settings.default_language ?? "en"} onChange={(e) => set("default_language", e.target.value)} className="input-field">
                <option value="en">English</option>
                <option value="es">Español</option>
              </select>
            </Field>
            <Field label={t("timezone")}>
              <input type="text" value={settings.timezone ?? ""} onChange={(e) => set("timezone", e.target.value)} className="input-field" />
            </Field>
            <Field label={t("sessionLifetime")}>
              <input type="number" value={settings.session_lifetime ?? ""} onChange={(e) => set("session_lifetime", e.target.value)} className="input-field" />
            </Field>
            <Field label={t("maxUploadSize")}>
              <input type="number" value={settings.max_upload_size ?? ""} onChange={(e) => set("max_upload_size", e.target.value)} className="input-field" />
            </Field>
          </>
        )}

        {tab === "map" && (
          <>
            <Field label={t("mapStyle")}>
              <select value={settings.map_style ?? "voyager"} onChange={(e) => set("map_style", e.target.value)} className="input-field">
                <option value="positron">Positron (Light)</option>
                <option value="voyager">Voyager (Colorful)</option>
                <option value="dark-matter">Dark Matter</option>
                <option value="osm-liberty">OSM Liberty</option>
              </select>
            </Field>
            <Field label={t("clusterEnabled")}>
              <select value={settings.map_cluster_enabled ?? "true"} onChange={(e) => set("map_cluster_enabled", e.target.value)} className="input-field">
                <option value="true">{tc("yes")}</option>
                <option value="false">{tc("no")}</option>
              </select>
            </Field>
            <Field label={t("clusterRadius")}>
              <input type="number" value={settings.map_cluster_max_radius ?? ""} onChange={(e) => set("map_cluster_max_radius", e.target.value)} className="input-field" />
            </Field>
            <Field label={t("clusterMaxZoom")}>
              <input type="number" value={settings.map_cluster_disable_at_zoom ?? ""} onChange={(e) => set("map_cluster_disable_at_zoom", e.target.value)} className="input-field" />
            </Field>
            <div className="space-y-2">
              <span className="text-sm font-medium">{t("transportColors")}</span>
              <div className="grid grid-cols-2 gap-3">
                {TRANSPORT_TYPES.map((tt) => (
                  <div key={tt} className="flex items-center gap-2">
                    <input
                      type="color"
                      value={settings[`transport_color_${tt}`] ?? "#3388ff"}
                      onChange={(e) => set(`transport_color_${tt}`, e.target.value)}
                      className="h-8 w-10 cursor-pointer rounded border border-input"
                    />
                    <span className="text-sm capitalize">{tt}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {tab === "images" && (
          <>
            <Field label={t("imageMaxWidth")}>
              <input type="number" value={settings.image_max_width ?? ""} onChange={(e) => set("image_max_width", e.target.value)} className="input-field" />
            </Field>
            <Field label={t("imageMaxHeight")}>
              <input type="number" value={settings.image_max_height ?? ""} onChange={(e) => set("image_max_height", e.target.value)} className="input-field" />
            </Field>
            <Field label={t("imageQuality")}>
              <input type="number" min="1" max="100" value={settings.image_quality ?? ""} onChange={(e) => set("image_quality", e.target.value)} className="input-field" />
            </Field>
          </>
        )}

        {tab === "site" && (
          <>
            <Field label={t("siteTitle")}>
              <input type="text" value={settings.site_title ?? ""} onChange={(e) => set("site_title", e.target.value)} className="input-field" />
            </Field>
            <Field label={t("siteDescription")}>
              <textarea value={settings.site_description ?? ""} onChange={(e) => set("site_description", e.target.value)} rows={3} className="input-field" />
            </Field>
            <Field label={t("favicon")}>
              <input type="text" value={settings.site_favicon ?? ""} onChange={(e) => set("site_favicon", e.target.value)} className="input-field" placeholder="/favicon.ico" />
            </Field>
            <Field label={t("analyticsScript")}>
              <textarea value={settings.site_analytics_code ?? ""} onChange={(e) => set("site_analytics_code", e.target.value)} rows={4} className="input-field font-mono text-xs" placeholder="<script>...</script>" />
            </Field>
          </>
        )}
      </div>

      <style jsx>{`
        .input-field {
          display: flex;
          height: 2.5rem;
          width: 100%;
          border-radius: 0.375rem;
          border: 1px solid hsl(var(--input));
          background: hsl(var(--background));
          padding: 0.5rem 0.75rem;
          font-size: 0.875rem;
        }
        .input-field:focus-visible {
          outline: none;
          ring: 2px solid hsl(var(--ring));
        }
        textarea.input-field {
          height: auto;
        }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      {children}
    </div>
  );
}
