import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { parseSettings } from "@/lib/utils/parse-settings";
import type { AppSettings, Setting } from "@/types/domain";

export { parseSettings };

export async function getSettings(): Promise<AppSettings> {
  const supabase = await createClient();
  const { data } = await supabase.from("settings").select("*");
  return parseSettings((data as Setting[]) ?? []);
}

export async function updateSetting(key: string, value: string): Promise<void> {
  const supabase = createAdminClient();
  await supabase
    .from("settings")
    .update({ setting_value: value })
    .eq("setting_key", key);
}

export async function updateSettings(updates: Record<string, string>): Promise<void> {
  const supabase = createAdminClient();
  await Promise.all(
    Object.entries(updates).map(([key, value]) =>
      supabase.from("settings").update({ setting_value: value }).eq("setting_key", key),
    ),
  );
}

export async function getAllSettingRows(): Promise<Setting[]> {
  const supabase = createAdminClient();
  const { data } = await supabase.from("settings").select("*").order("setting_key");
  return (data as Setting[]) ?? [];
}
