import { getAllSettingRows, updateSettings } from "@/lib/models/settings";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { locales, type Locale } from "@/lib/i18n/config";
import { SettingsForm } from "./settings-form";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const rows = await getAllSettingRows();

  async function handleSave(
    _prevState: { success: boolean } | null,
    formData: FormData,
  ): Promise<{ success: boolean }> {
    "use server";
    const updates: Record<string, string> = {};
    for (const [key, value] of formData.entries()) {
      if (typeof value === "string") updates[key] = value;
    }
    await updateSettings(updates);

    const lang = updates["default_language"] as Locale | undefined;
    if (lang && locales.includes(lang)) {
      const cookieStore = await cookies();
      cookieStore.set("VIAJEROS_LOCALE", lang, {
        path: "/",
        maxAge: 60 * 60 * 24 * 365,
        sameSite: "lax",
      });
    }

    revalidatePath("/admin/settings");
    return { success: true };
  }

  return <SettingsForm rows={rows} onSave={handleSave} />;
}
