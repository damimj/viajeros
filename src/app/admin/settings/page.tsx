import { getAllSettingRows, updateSettings } from "@/lib/models/settings";
import { revalidatePath } from "next/cache";
import { MAP_STYLES, TRANSPORT_TYPES } from "@/lib/constants";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const rows = await getAllSettingRows();
  const get = (key: string) => rows.find((r) => r.setting_key === key)?.setting_value ?? "";

  async function handleSave(formData: FormData) {
    "use server";
    const updates: Record<string, string> = {};
    for (const [key, value] of formData.entries()) {
      if (typeof value === "string") updates[key] = value;
    }
    await updateSettings(updates);
    revalidatePath("/admin/settings");
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold">Settings</h1>

      <form action={handleSave} className="space-y-8">
        {/* Map */}
        <Section title="Map">
          <Field label="Map style">
            <select name="map_style" defaultValue={get("map_style")} className={inputClass}>
              {Object.keys(MAP_STYLES).map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </Field>
          <div className="grid grid-cols-3 gap-4">
            <Field label="Clustering enabled">
              <select name="map_cluster_enabled" defaultValue={get("map_cluster_enabled")} className={inputClass}>
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </Field>
            <Field label="Cluster radius (px)">
              <input type="number" name="map_cluster_max_radius" defaultValue={get("map_cluster_max_radius")} className={inputClass} />
            </Field>
            <Field label="Disable at zoom">
              <input type="number" name="map_cluster_disable_at_zoom" defaultValue={get("map_cluster_disable_at_zoom")} className={inputClass} />
            </Field>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">Transport colors</p>
            <div className="grid grid-cols-4 gap-3">
              {TRANSPORT_TYPES.map((t) => {
                const key = `transport_color_${t}`;
                return (
                  <div key={t} className="flex flex-col gap-1">
                    <label className="text-xs capitalize text-muted-foreground">{t}</label>
                    <div className="flex items-center gap-1.5">
                      <input type="color" name={key} defaultValue={get(key)} className="h-8 w-10 cursor-pointer rounded border p-0.5" />
                      <input type="text" name={`${key}_text`} defaultValue={get(key)} className="w-full rounded border px-2 py-1 text-xs font-mono" readOnly />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Section>

        {/* Images */}
        <Section title="Images">
          <div className="grid grid-cols-3 gap-4">
            <Field label="Max width (px)">
              <input type="number" name="image_max_width" defaultValue={get("image_max_width")} className={inputClass} />
            </Field>
            <Field label="Max height (px)">
              <input type="number" name="image_max_height" defaultValue={get("image_max_height")} className={inputClass} />
            </Field>
            <Field label="Quality (0–100)">
              <input type="number" name="image_quality" min="1" max="100" defaultValue={get("image_quality")} className={inputClass} />
            </Field>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Field label="Thumbnail width (px)">
              <input type="number" name="thumbnail_max_width" defaultValue={get("thumbnail_max_width")} className={inputClass} />
            </Field>
            <Field label="Thumbnail height (px)">
              <input type="number" name="thumbnail_max_height" defaultValue={get("thumbnail_max_height")} className={inputClass} />
            </Field>
            <Field label="Thumbnail quality">
              <input type="number" name="thumbnail_quality" min="1" max="100" defaultValue={get("thumbnail_quality")} className={inputClass} />
            </Field>
          </div>
          <Field label="Max upload size (bytes)">
            <input type="number" name="max_upload_size" defaultValue={get("max_upload_size")} className={inputClass} />
          </Field>
        </Section>

        {/* Site */}
        <Section title="Site">
          <Field label="Site title">
            <input type="text" name="site_title" defaultValue={get("site_title")} className={inputClass} />
          </Field>
          <Field label="Site description">
            <textarea name="site_description" rows={2} defaultValue={get("site_description")} className={inputClass} />
          </Field>
          <Field label="Analytics script (optional)">
            <textarea name="site_analytics_code" rows={3} defaultValue={get("site_analytics_code")} placeholder="<!-- Google Analytics or other scripts -->" className={`font-mono text-xs ${inputClass}`} />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Default language">
              <select name="default_language" defaultValue={get("default_language")} className={inputClass}>
                <option value="en">English</option>
                <option value="es">Español</option>
              </select>
            </Field>
            <Field label="Distance unit">
              <select name="distance_unit" defaultValue={get("distance_unit")} className={inputClass}>
                <option value="km">km</option>
                <option value="mi">mi</option>
              </select>
            </Field>
          </div>
        </Section>

        <div className="pt-2">
          <button type="submit" className="rounded-md bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            Save settings
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

const inputClass = "w-full rounded-md border border-input bg-background px-3 py-2 text-sm";
